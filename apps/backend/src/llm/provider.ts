/**
 * Generic JSON-schema-ish tool parameter description. Deliberately a subset
 * of full JSON Schema — enough to describe the tools in src/tools without
 * depending on any single provider's function-calling format.
 */
export interface ToolParameterSchema {
  type: "object";
  properties: Record<
    string,
    {
      type: "string" | "number" | "boolean" | "array" | "object";
      description: string;
      enum?: string[];
      items?: ToolParameterSchema["properties"][string];
    }
  >;
  required: string[];
}

export interface ToolSchema {
  name: string;
  description: string;
  parameters: ToolParameterSchema;
}

export interface ToolCallRequest {
  /** Provider-issued call id when available, otherwise generated locally. */
  id: string;
  name: string;
  args: Record<string, unknown>;
  /**
   * Opaque provider-specific data that must be replayed verbatim on the
   * next turn for the provider's internal reasoning state to stay coherent
   * (e.g. Gemini 3's thought signatures). Never passed to tool.execute() —
   * tools only ever see `args`.
   */
  providerMetadata?: Record<string, unknown>;
}

/**
 * Provider-agnostic conversation history. The agent loop builds this from
 * Postgres rows; each provider adapter is responsible for translating it
 * into its own wire format (Gemini `Content[]`, Anthropic `messages`, etc).
 */
export type LLMHistoryItem =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string }
  | { role: "assistant"; toolCalls: ToolCallRequest[] }
  | { role: "tool"; toolCallId: string; toolName: string; result: unknown };

export type LLMTurn =
  | { kind: "tool_calls"; calls: ToolCallRequest[] }
  | { kind: "message"; content: string };

export interface GenerateInput {
  systemPrompt: string;
  history: LLMHistoryItem[];
  tools: ToolSchema[];
}

/**
 * Implement this once per provider. The agent loop (src/agent/loop.ts)
 * only ever talks to this interface, never to a provider SDK directly —
 * that's what makes swapping Gemini -> Anthropic later a new file instead
 * of a rewrite.
 */
export interface LLMProvider {
  generate(input: GenerateInput): Promise<LLMTurn>;
}
