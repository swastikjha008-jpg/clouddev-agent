import { GoogleGenerativeAI, SchemaType, type Content, type FunctionDeclarationSchema, type Part, type Tool as GeminiTool } from "@google/generative-ai";
import { randomUUID } from "node:crypto";
import type { GenerateInput, LLMHistoryItem, LLMProvider, LLMTurn, ToolCallRequest, ToolParameterSchema, ToolSchema } from "./provider.js";

const JSON_TYPE_TO_GEMINI: Record<ToolParameterSchema["properties"][string]["type"], SchemaType> = {
  string: SchemaType.STRING,
  number: SchemaType.NUMBER,
  boolean: SchemaType.BOOLEAN,
  array: SchemaType.ARRAY,
  object: SchemaType.OBJECT,
};

function toGeminiSchema(schema: ToolParameterSchema): FunctionDeclarationSchema {
  return {
    type: SchemaType.OBJECT,
    properties: Object.fromEntries(
      Object.entries(schema.properties).map(([key, prop]) => [
        key,
        {
          type: JSON_TYPE_TO_GEMINI[prop.type],
          description: prop.description,
          ...(prop.enum ? { enum: prop.enum } : {}),
          ...(prop.items && prop.type === "array"
            ? { items: { type: JSON_TYPE_TO_GEMINI[prop.items.type], description: prop.items.description } }
            : {}),
        },
      ]),
    ),
    required: schema.required,
  };
}

function toGeminiTools(tools: ToolSchema[]): GeminiTool[] {
  if (tools.length === 0) return [];
  return [
    {
      functionDeclarations: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        parameters: toGeminiSchema(tool.parameters),
      })),
    },
  ];
}

/**
 * Maps our provider-agnostic history onto Gemini's `Content[]` shape.
 * Gemini has no dedicated "tool call requested" role — a function call is
 * represented as a `model` turn with a `functionCall` part, and its result
 * as the following `user` turn's `functionResponse` part.
 */
function toGeminiHistory(history: LLMHistoryItem[]): Content[] {
  const contents: Content[] = [];

  for (const item of history) {
    switch (item.role) {
      case "user":
        contents.push({ role: "user", parts: [{ text: item.content }] });
        break;
      case "assistant":
        if ("content" in item) {
          contents.push({ role: "model", parts: [{ text: item.content }] });
        } else {
          const parts: Part[] = item.toolCalls.map((call) => {
            const part: Part & { thoughtSignature?: string } = {
              functionCall: { name: call.name, args: call.args },
            };
            const signature = call.providerMetadata?.thoughtSignature;
            if (typeof signature === "string") {
              part.thoughtSignature = signature;
            }
            return part;
          });
          contents.push({ role: "model", parts });
        }
        break;
      case "tool":
        contents.push({
          role: "user",
          parts: [
            {
              functionResponse: {
                name: item.toolName,
                response: { result: item.result },
              },
            },
          ],
        });
        break;
    }
  }

  return contents;
}

export class GeminiProvider implements LLMProvider {
  private readonly client: GoogleGenerativeAI;
  private readonly modelName: string;

  constructor(apiKey: string, modelName = "gemini-1.5-pro") {
    this.client = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  async generate({ systemPrompt, history, tools }: GenerateInput): Promise<LLMTurn> {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction: systemPrompt,
      tools: toGeminiTools(tools),
    });

    const result = await model.generateContent({ contents: toGeminiHistory(history) });
    const candidate = result.response.candidates?.[0];
    const parts = candidate?.content?.parts ?? [];

   const calls: ToolCallRequest[] = parts
      .filter((part): part is Part & { functionCall: { name: string; args: Record<string, unknown> } } => Boolean(part.functionCall))
      .map((part) => {
        const signature = (part as { thoughtSignature?: string }).thoughtSignature;
        return {
          id: randomUUID(),
          name: part.functionCall.name,
          args: part.functionCall.args ?? {},
          ...(typeof signature === "string" ? { providerMetadata: { thoughtSignature: signature } } : {}),
        };
      });

    if (calls.length > 0) {
      return { kind: "tool_calls", calls };
    }

    const text = result.response.text();
    return { kind: "message", content: text };
  }
}
