import { safeValidateUIMessages, type UIMessage } from 'ai';
import { describe, expect, it } from 'vitest';

import {
  aiParts,
  dataPart,
  dynamicToolParts,
  filePart,
  reasoningParts,
  sourceParts,
  stepStartPart,
  textParts,
  toolParts,
  type AiFixtureData,
  type AiFixtureTools,
} from './ai-parts';

/**
 * The part types the v1 inventory renders (ADR 0005). Every one of them has a
 * fixture, so a suite or a story never invents a part inline.
 */
const V1_PART_TYPES = [
  'data-weather',
  'dynamic-tool',
  'file',
  'reasoning',
  'source-document',
  'source-url',
  'step-start',
  'text',
  'tool-getWeather',
];

/** The SDK's complete tool-part state union. */
const TOOL_STATES = [
  'approval-requested',
  'approval-responded',
  'input-available',
  'input-streaming',
  'output-available',
  'output-denied',
  'output-error',
];

describe('AI part fixtures', () => {
  it('covers every part type in the v1 inventory', () => {
    expect([...new Set(aiParts.map((part) => part.type))].sort()).toEqual(V1_PART_TYPES);
  });

  it('covers every tool state for both a static and a dynamic tool', () => {
    expect(Object.keys(toolParts).sort()).toEqual(TOOL_STATES);
    expect(
      Object.values(toolParts)
        .map(({ state }) => state)
        .sort(),
    ).toEqual(TOOL_STATES);
    expect(Object.keys(dynamicToolParts).sort()).toEqual(TOOL_STATES);
    expect(
      Object.values(dynamicToolParts)
        .map(({ state }) => state)
        .sort(),
    ).toEqual(TOOL_STATES);
  });

  it('carries both source kinds, both streaming states and a model-produced file', () => {
    expect(sourceParts.url.type).toBe('source-url');
    expect(sourceParts.document.type).toBe('source-document');
    expect(textParts.streaming.state).toBe('streaming');
    expect(textParts.done.state).toBe('done');
    expect(reasoningParts.streaming.state).toBe('streaming');
    expect(reasoningParts.done.state).toBe('done');
    expect(filePart.mediaType).toBe('image/svg+xml');
    expect(dataPart.type).toBe('data-weather');
    expect(stepStartPart.type).toBe('step-start');
  });

  it("is accepted by the SDK's own message validator", async () => {
    const message = {
      id: 'fixture-message',
      role: 'assistant',
      parts: [...aiParts],
    } satisfies UIMessage<unknown, AiFixtureData, AiFixtureTools>;

    const result = await safeValidateUIMessages({ messages: [message] });

    expect(result.success, result.success ? undefined : result.error.message).toBe(true);
  });
});
