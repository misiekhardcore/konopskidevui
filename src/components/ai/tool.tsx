'use client';

import * as React from 'react';

import { CodeBlock, CodeBlockContent, CodeBlockHeader, CodeBlockTitle } from '../ui/code-block';
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceLine,
  TraceTitle,
} from '../ui/trace';
import { ToolApproval } from './tool-approval';

import type { ToolApprovalLabels, ToolApprovalPart } from './tool-approval';
import type { DynamicToolUIPart, ToolUIPart } from 'ai';

/** Any tool part: a typed tool call or one the app only knows at runtime. */
export type ToolPart = ToolUIPart | DynamicToolUIPart;

/** Every user-facing string, so the row can be translated without a fork. */
export type ToolLabels = {
  running: string;
  awaitingApproval: string;
  approved: string;
  declined: string;
  failed: string;
  providerExecuted: string;
  unnamedTool: string;
  partialInput: string;
  input: string;
  output: string;
  error: string;
};

const DEFAULT_LABELS: ToolLabels = {
  running: 'is running',
  awaitingApproval: 'is waiting for your approval',
  approved: 'was approved',
  declined: 'was declined',
  failed: 'failed',
  providerExecuted: 'provider-executed',
  unnamedTool: 'Tool',
  partialInput: 'Partial input',
  input: 'Input',
  output: 'Output',
  error: 'Error',
};

// `part` is also a DOM attribute, so it has to leave the forwarded props or the
// element's `part?: string` would be intersected into the tool part.
export type ToolProps = Omit<React.ComponentProps<'div'>, 'children' | 'part'> & {
  part: ToolPart;
  /** Override the strings shown, one at a time. */
  labels?: Partial<ToolLabels>;
  /** Override the approval card's strings, one at a time. */
  approvalLabels?: Partial<ToolApprovalLabels>;
  /** Drive the disclosure instead of letting the row remember its own state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Called with the approval id; the app forwards it to `addToolApprovalResponse`. */
  onApprove?: (approval: { id: string }) => void | Promise<void>;
  /** Called with the approval id and the typed reason, when one was given. */
  onDeny?: (denial: { id: string; reason?: string }) => void | Promise<void>;
};

/** A static tool's name comes from its type; a dynamic one names itself. */
function toolNameOf(part: ToolPart, fallback: string): string {
  if (part.type === 'dynamic-tool') return part.toolName.trim() || fallback;

  const name = part.type.startsWith('tool-') ? part.type.slice('tool-'.length).trim() : '';

  return name || fallback;
}

/** JSON for anything structured, so a payload reads as data rather than `[object Object]`. */
function jsonText(value: unknown): string | null {
  if (value === undefined || value === null) return null;

  const text = JSON.stringify(value, null, 2);

  return !text || text === '{}' ? null : text;
}

/** The partial JSON a still-streaming call has produced, as text and never parsed. */
function partialInputOf(part: ToolPart): string | null {
  if (part.state === 'input-streaming' && part.rawInput) return part.rawInput;

  const text = jsonText(part.input);

  return text;
}

/** The one fact a state has to offer, before the details are opened. */
function stateFactOf(part: ToolPart, text: ToolLabels): string | null {
  switch (part.state) {
    case 'input-streaming':
      return text.running;
    case 'approval-requested':
      return text.awaitingApproval;
    case 'approval-responded':
      return part.approval?.approved ? text.approved : text.declined;
    case 'input-available':
    case 'output-available':
      return null;
    case 'output-error':
      return text.failed;
    case 'output-denied':
      return text.declined;
    default:
      return null;
  }
}

function ToolSection({
  label,
  children,
  variant,
}: {
  label: string;
  children: React.ReactNode;
  variant?: 'default' | 'destructive';
}) {
  return (
    <CodeBlock size="sm" variant={variant}>
      <CodeBlockHeader>
        <CodeBlockTitle>{label}</CodeBlockTitle>
      </CodeBlockHeader>
      <CodeBlockContent>{children}</CodeBlockContent>
    </CodeBlock>
  );
}

/**
 * One tool call, in every state the SDK can deliver it in.
 *
 * Each call is one collapsed row built on the trace disclosure primitives, so
 * the transcript stays scannable and the details stay one click away (ADR 0014).
 * An unanswered approval opens the row by itself and holds it open; the approval
 * card is the body, so the reason is always in view. Outputs and errors are data
 * in, events out — the app owns the conversation.
 */
function Tool({
  part,
  labels,
  approvalLabels,
  open,
  onOpenChange,
  onApprove,
  onDeny,
  className,
  ...props
}: ToolProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const text = { ...DEFAULT_LABELS, ...labels };
  const requested = part.state === 'approval-requested';
  const expanded = requested || (open ?? uncontrolledOpen);
  const name = toolNameOf(part, text.unnamedTool);
  const fact = stateFactOf(part, text);
  const providerExecuted = part.providerExecuted === true;
  const approval = (part as ToolApprovalPart).approval;

  function handleOpenChange(next: boolean) {
    // A pending approval is the one row that refuses to close: the decision is
    // the point, and collapsing it would hide the arguments being judged.
    if (requested && !next) return;

    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  const partialInput = partialInputOf(part);
  const inputText = part.state === 'input-streaming' ? null : jsonText(part.input);
  const output = part.state === 'output-available' ? part.output : undefined;
  const outputText =
    typeof output === 'string' ? output : output === undefined ? null : jsonText(output);
  const errorText = part.state === 'output-error' ? part.errorText : undefined;

  const lineStatus =
    part.state === 'input-streaming'
      ? 'running'
      : part.state === 'output-error'
        ? 'error'
        : undefined;

  return (
    <Trace className={className} {...props} data-slot="tool" data-state={part.state}>
      <TraceCollapsible open={expanded} onOpenChange={handleOpenChange}>
        <TraceCollapsibleTrigger>
          <TraceLine status={lineStatus}>
            <TraceTitle>{name}</TraceTitle>
            {fact ? <TraceDescription>{fact}</TraceDescription> : null}
            {providerExecuted ? (
              <TraceDescription data-slot="tool-provider">{text.providerExecuted}</TraceDescription>
            ) : null}
          </TraceLine>
        </TraceCollapsibleTrigger>

        {/*
          `w-0 min-w-full` keeps the body from sizing the row: the details fill
          whatever width the row already has, so opening it cannot widen the row
          (and shift the name left) inside a shrink-to-fit column.
        */}
        <TraceCollapsibleContent className="flex w-0 min-w-full flex-col gap-3">
          {part.state === 'input-streaming' && partialInput ? (
            <ToolSection label={text.partialInput}>{partialInput}</ToolSection>
          ) : null}

          {inputText && !approval ? (
            <ToolSection label={text.input}>{inputText}</ToolSection>
          ) : null}

          {outputText ? (
            <ToolSection label={text.output}>
              {typeof output === 'string' ? (
                <span className="wrap-break-word whitespace-pre-wrap">{outputText}</span>
              ) : (
                outputText
              )}
            </ToolSection>
          ) : null}

          {errorText ? (
            <ToolSection label={text.error} variant="destructive">
              {errorText}
            </ToolSection>
          ) : null}

          {approval ? (
            <ToolApproval
              part={part as ToolApprovalPart}
              labels={approvalLabels}
              onApprove={onApprove}
              onDeny={onDeny}
            />
          ) : null}
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
}

export { Tool };
