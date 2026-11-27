import type {
  DataUIPart,
  DynamicToolUIPart,
  FileUIPart,
  ReasoningUIPart,
  SourceDocumentUIPart,
  SourceUrlUIPart,
  StepStartUIPart,
  TextUIPart,
  ToolUIPart,
  UIMessagePart,
} from 'ai';

/**
 * The shared AI part fixtures.
 *
 * Every AI component suite and story renders from this module, so a new part is
 * a fixture here instead of a literal invented inline per suite. Each fixture is
 * typed against the SDK's own part union, which means an SDK upgrade that changes
 * a part shape breaks `pnpm tsc` here rather than drifting silently.
 *
 * This directory is test-only: `scripts/entries.mjs` keeps it out of the build's
 * entry list and `scripts/check-build.mjs` fails if it ever reaches `dist`.
 */

/** The app-defined data part the fixtures cover. */
export type AiFixtureData = {
  weather: {
    location: string;
    temperatureC: number;
    summary: string;
  };
};

/** The tool the fixtures call, so a tool part carries a real input and output. */
export type AiFixtureTools = {
  getWeather: {
    input: { location: string };
    output: { temperatureC: number; summary: string };
  };
};

/** The union every fixture is typed against. */
export type AiFixturePart = UIMessagePart<AiFixtureData, AiFixtureTools>;

export const textParts = {
  streaming: {
    type: 'text',
    text: 'The forecast for Kraków is',
    state: 'streaming',
  },
  done: {
    type: 'text',
    text: 'The forecast for Kraków is 21 °C and clear.',
    state: 'done',
  },
} as const satisfies Record<'streaming' | 'done', TextUIPart>;

export const reasoningParts = {
  streaming: {
    type: 'reasoning',
    id: 'reasoning_forecast',
    text: 'The user asked about the weather, so I need the forecast before answering.',
    state: 'streaming',
  },
  done: {
    type: 'reasoning',
    id: 'reasoning_forecast',
    text: 'The user asked about the weather, so I need the forecast before answering.\n\nA single lookup is enough; no follow-up call is needed.',
    state: 'done',
  },
} as const satisfies Record<'streaming' | 'done', ReasoningUIPart>;

export const sourceParts = {
  url: {
    type: 'source-url',
    sourceId: 'source_forecast',
    url: 'https://example.com/krakow-forecast',
    title: 'Kraków forecast',
  },
  document: {
    type: 'source-document',
    sourceId: 'source_policy',
    mediaType: 'application/pdf',
    title: 'Weather data policy',
    filename: 'weather-data-policy.pdf',
  },
} as const satisfies { url: SourceUrlUIPart; document: SourceDocumentUIPart };

export const filePart = {
  type: 'file',
  mediaType: 'image/png',
  filename: 'forecast-chart.png',
  url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
} as const satisfies FileUIPart;

export const dataPart = {
  type: 'data-weather',
  id: 'data_forecast',
  data: { location: 'Kraków', temperatureC: 21, summary: 'Clear' },
} as const satisfies DataUIPart<AiFixtureData>;

export const stepStartPart = { type: 'step-start' } as const satisfies StepStartUIPart;

const toolCallId = 'call_getWeather';
const approvalId = 'approval_getWeather';
const weatherInput = { location: 'Kraków' };

/** One static tool part per state, so a suite never has to build a lifecycle. */
export const toolParts = {
  'input-streaming': {
    type: 'tool-getWeather',
    toolCallId,
    state: 'input-streaming',
    input: { location: 'Kra' },
    rawInput: '{"location":"Kra',
  },
  'input-available': {
    type: 'tool-getWeather',
    toolCallId,
    state: 'input-available',
    input: weatherInput,
  },
  'approval-requested': {
    type: 'tool-getWeather',
    toolCallId,
    state: 'approval-requested',
    input: weatherInput,
    approval: {
      id: approvalId,
      descriptor: 'This tool reads the locations saved in your account.',
    },
  },
  'approval-responded': {
    type: 'tool-getWeather',
    toolCallId,
    state: 'approval-responded',
    input: weatherInput,
    approval: { id: approvalId, approved: true },
  },
  'output-available': {
    type: 'tool-getWeather',
    toolCallId,
    state: 'output-available',
    input: weatherInput,
    output: { temperatureC: 21, summary: 'Clear' },
  },
  'output-error': {
    type: 'tool-getWeather',
    toolCallId,
    state: 'output-error',
    input: weatherInput,
    errorText: 'The weather service did not answer.',
  },
  'output-denied': {
    type: 'tool-getWeather',
    toolCallId,
    state: 'output-denied',
    input: weatherInput,
    approval: { id: approvalId, approved: false, reason: 'Do not look up my location.' },
  },
} as const satisfies Record<ToolUIPart<AiFixtureTools>['state'], ToolUIPart<AiFixtureTools>>;

/** The same lifecycle for a tool the app did not register, named at runtime. */
export const dynamicToolParts = {
  'input-streaming': {
    type: 'dynamic-tool',
    toolName: 'lookup_order',
    toolCallId: 'call_lookup_order',
    state: 'input-streaming',
    input: { orderId: 'ord' },
  },
  'input-available': {
    type: 'dynamic-tool',
    toolName: 'lookup_order',
    toolCallId: 'call_lookup_order',
    state: 'input-available',
    input: { orderId: 'ord_123' },
  },
  'approval-requested': {
    type: 'dynamic-tool',
    toolName: 'lookup_order',
    toolCallId: 'call_lookup_order',
    state: 'approval-requested',
    input: { orderId: 'ord_123' },
    approval: { id: 'approval_lookup_order', descriptor: 'The order belongs to another account.' },
  },
  'approval-responded': {
    type: 'dynamic-tool',
    toolName: 'lookup_order',
    toolCallId: 'call_lookup_order',
    state: 'approval-responded',
    input: { orderId: 'ord_123' },
    approval: { id: 'approval_lookup_order', approved: false, reason: 'Not my order.' },
  },
  'output-available': {
    type: 'dynamic-tool',
    toolName: 'lookup_order',
    toolCallId: 'call_lookup_order',
    state: 'output-available',
    input: { orderId: 'ord_123' },
    output: { status: 'shipped' },
    providerExecuted: true,
  },
  'output-error': {
    type: 'dynamic-tool',
    toolName: 'lookup_order',
    toolCallId: 'call_lookup_order',
    state: 'output-error',
    input: { orderId: 'ord_123' },
    errorText: 'The order service did not answer.',
  },
  'output-denied': {
    type: 'dynamic-tool',
    toolName: 'lookup_order',
    toolCallId: 'call_lookup_order',
    state: 'output-denied',
    input: { orderId: 'ord_123' },
    approval: { id: 'approval_lookup_order', approved: false, reason: 'Not my order.' },
  },
} as const satisfies Record<DynamicToolUIPart['state'], DynamicToolUIPart>;

/** Every v1 fixture, for a composed transcript or a message-level suite. */
export const aiParts = [
  textParts.streaming,
  textParts.done,
  reasoningParts.streaming,
  reasoningParts.done,
  sourceParts.url,
  sourceParts.document,
  filePart,
  dataPart,
  stepStartPart,
  ...Object.values(toolParts),
  ...Object.values(dynamicToolParts),
] as const satisfies readonly AiFixturePart[];

type MissingPartType = Exclude<AiFixturePart['type'], (typeof aiParts)[number]['type']>;

/**
 * True only while every part type in the SDK's union has a fixture. An SDK
 * upgrade that adds a part turns this into a `pnpm tsc` error, which is where
 * the v1 inventory is supposed to notice (ADR 0005).
 */
export const coversEveryPartType: MissingPartType extends never ? true : never = true;
