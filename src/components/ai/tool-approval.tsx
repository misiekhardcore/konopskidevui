'use client';

import { cn } from 'cn';
import * as React from 'react';

import { Button } from '../ui/button';
import { CodeBlock, CodeBlockContent } from '../ui/code-block';
import { Input } from '../ui/input';

import type { DynamicToolUIPart, ToolUIPart } from 'ai';

/**
 * Any tool part. The card renders the request, the decision that was recorded
 * and the denial that came back — every state a reloaded conversation can
 * arrive in — and nothing at all for a call that carries no approval.
 */
export type ToolApprovalPart = ToolUIPart | DynamicToolUIPart;

/** An answer to the request, carrying the id the app hands back to the SDK. */
export type ToolApprovalResponse = { id: string };

/** A denial, which may also carry the reason the person typed. */
export type ToolApprovalDenial = { id: string; reason?: string };

/** Every user-facing string, so the family can be translated without a fork. */
export type ToolApprovalLabels = {
  approve: string;
  decline: string;
  reason: string;
  reasonPlaceholder: string;
  requested: string;
  submitting: string;
  approved: string;
  declined: string;
};

const DEFAULT_LABELS: ToolApprovalLabels = {
  approve: 'Approve',
  decline: 'Decline',
  reason: 'Reason for declining (optional)',
  reasonPlaceholder: 'Why are you declining this call?',
  requested: 'is waiting for your approval',
  submitting: 'is recording your decision',
  approved: 'was approved',
  declined: 'was declined',
};

// `part` is also a DOM attribute, so it has to leave the forwarded props or the
// element's `part?: string` would be intersected into the tool part.
export type ToolApprovalProps = Omit<React.ComponentProps<'div'>, 'children' | 'part'> & {
  part: ToolApprovalPart;
  /** Override the strings shown, one at a time. */
  labels?: Partial<ToolApprovalLabels>;
  /** Called with the approval id; the app forwards it to `addToolApprovalResponse`. */
  onApprove?: (approval: ToolApprovalResponse) => void | Promise<void>;
  /** Called with the approval id and the typed reason, when one was given. */
  onDeny?: (denial: ToolApprovalDenial) => void | Promise<void>;
};

/** The arguments as text, or nothing when there is nothing to show. */
function formatArguments(input: unknown): string | null {
  const text = JSON.stringify(input, null, 2);

  return !text || text === '{}' ? null : text;
}

/** An opaque descriptor is shown as-is and never interpreted. */
function formatDescriptor(descriptor: unknown): string | null {
  if (descriptor === undefined || descriptor === null) return null;

  return typeof descriptor === 'string' ? descriptor : JSON.stringify(descriptor);
}

/**
 * A tool call's approval request, inline in the message.
 *
 * It is a body, not a panel with a trigger of its own: a tool row owns the
 * one-line summary and renders this inside its disclosure, so the card names the
 * tool in a sentence instead of repeating it as a heading. It never calls the
 * SDK — approving and denying are events carrying the approval id, and the app
 * decides what to do with them.
 */
function ToolApproval({ part, labels, onApprove, onDeny, className, ...props }: ToolApprovalProps) {
  const [pending, setPending] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const reasonId = React.useId();
  const text = { ...DEFAULT_LABELS, ...labels };

  const approval = part.approval;

  // A call with no approval has nothing to decide, so the card is mountable over
  // every part in a transcript instead of needing a guard at every call site.
  if (!approval) return null;

  const approvalId = approval.id;
  const toolName = part.type === 'dynamic-tool' ? part.toolName : part.type.slice('tool-'.length);
  const argumentsText = formatArguments(part.input);
  const descriptor = formatDescriptor(approval.descriptor);
  const requested = part.state === 'approval-requested';
  const status = pending
    ? text.submitting
    : requested
      ? text.requested
      : approval.approved
        ? text.approved
        : text.declined;

  async function respond(decision: 'approve' | 'deny') {
    setPending(true);

    try {
      if (decision === 'approve') {
        await onApprove?.({ id: approvalId });
        return;
      }

      const typed = reason.trim();

      await onDeny?.(typed ? { id: approvalId, reason: typed } : { id: approvalId });
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      data-slot="tool-approval"
      data-state={part.state}
      className={cn(
        'flex w-full min-w-0 flex-col gap-3 rounded-sm border border-input p-3 text-sm',
        className,
      )}
      {...props}
    >
      <p
        data-slot="tool-approval-summary"
        className="flex min-w-0 flex-wrap items-baseline gap-x-1.5"
      >
        <span
          data-slot="tool-approval-tool"
          className="min-w-0 font-medium wrap-break-word text-foreground"
        >
          {toolName}
        </span>
        <span data-slot="tool-approval-status" role="status" className="text-muted-foreground">
          {status}
        </span>
      </p>

      {argumentsText ? (
        <CodeBlock size="sm">
          <CodeBlockContent>{argumentsText}</CodeBlockContent>
        </CodeBlock>
      ) : null}

      {descriptor ? (
        <p data-slot="tool-approval-descriptor" className="text-xs text-muted-foreground">
          {descriptor}
        </p>
      ) : null}

      {!requested && approval.reason ? (
        <p data-slot="tool-approval-reason" className="text-xs text-muted-foreground">
          {approval.reason}
        </p>
      ) : null}

      {requested ? (
        <div data-slot="tool-approval-actions" className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={reasonId} className="text-xs font-medium text-muted-foreground">
              {text.reason}
            </label>
            <Input
              id={reasonId}
              value={reason}
              placeholder={text.reasonPlaceholder}
              disabled={pending}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={pending} onClick={() => void respond('approve')}>
              {text.approve}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => void respond('deny')}
            >
              {text.decline}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { ToolApproval };
