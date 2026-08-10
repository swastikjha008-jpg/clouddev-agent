import type { Tool } from "./types.js";

/**
 * message_user is handled specially by the agent loop (src/agent/loop.ts) —
 * it's the only tool whose *arguments* (block_on_user_response) change loop
 * control flow, not just its result. The tool implementation here still
 * exists so it has a schema and shows up in the registry/tool_call log like
 * every other tool.
 */
export const messageUserTool: Tool = {
  name: "message_user",
  description:
    "Send a message to the user. Set block_on_user_response to BLOCK to pause until they reply, DONE for an informational update the agent keeps going after, or NONE for a plain status update.",
  parameters: {
    type: "object",
    properties: {
      content: { type: "string", description: "The message text." },
      block_on_user_response: {
        type: "string",
        description: "BLOCK pauses the agent until the user replies. DONE/NONE do not.",
        enum: ["BLOCK", "DONE", "NONE"],
      },
    },
    required: ["content", "block_on_user_response"],
  },
  execute(args, ctx) {
    const blockOnUserResponse = args.block_on_user_response;
    if (blockOnUserResponse === "BLOCK") {
      ctx.requestPause();
    }
    // Persisting + publishing the message itself happens in the agent loop,
    // since it needs to write the same row the loop's history builder reads
    // back on the next iteration.
    return Promise.resolve({ sent: true });
  },
};

export const waitTool: Tool = {
  name: "wait",
  description: "Pause for user input or a timer before continuing.",
  parameters: {
    type: "object",
    properties: {
      reason: { type: "string", description: "Why the agent is waiting." },
      timer_seconds: { type: "number", description: "Optional — resume automatically after this many seconds." },
    },
    required: ["reason"],
  },
  execute(args, ctx) {
    if (args.timer_seconds === undefined) {
      ctx.requestPause();
    }
    return Promise.resolve({ waiting: true });
  },
};

export const listSecretsTool: Tool = {
  name: "list_secrets",
  description:
    "List the names of secrets available to this task. Values are never returned here — they're injected as env vars into the sandbox at spawn time.",
  parameters: { type: "object", properties: {}, required: [] },
  execute(_args, _ctx) {
    // Phase 3: query Secret rows for the task's user and return names only.
    return Promise.resolve({ secrets: [] });
  },
};

export const userTools: Tool[] = [messageUserTool, waitTool, listSecretsTool];
