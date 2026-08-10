import type { Tool } from "./types.js";

export const openFileTool: Tool = {
  name: "open_file",
  description: "View the contents of a file in the repo.",
  parameters: {
    type: "object",
    properties: {
      path: { type: "string", description: "File path, relative to the repo root." },
    },
    required: ["path"],
  },
  async execute(args, ctx) {
    const path = String(args.path);
    const result = await ctx.sandbox.openFile(path);
    return { ...result };
  },
};

export const createFileTool: Tool = {
  name: "create_file",
  description: "Create a new file with the given content. Fails if the file already exists.",
  parameters: {
    type: "object",
    properties: {
      path: { type: "string", description: "File path, relative to the repo root." },
      content: { type: "string", description: "Full file content." },
    },
    required: ["path", "content"],
  },
  async execute(args, ctx) {
    const path = String(args.path);
    const content = String(args.content);
    const result = await ctx.sandbox.createFile(path, content);
    return { ...result };
  },
};

export const strReplaceTool: Tool = {
  name: "str_replace",
  description:
    "Find-and-replace edit on a file. old_str must match exactly once in the file — widen it with surrounding context if it isn't unique.",
  parameters: {
    type: "object",
    properties: {
      path: { type: "string", description: "File path, relative to the repo root." },
      old_str: { type: "string", description: "Exact text to replace. Must appear exactly once in the file." },
      new_str: { type: "string", description: "Replacement text." },
    },
    required: ["path", "old_str", "new_str"],
  },
  async execute(args, ctx) {
    const path = String(args.path);
    const oldStr = String(args.old_str);
    const newStr = String(args.new_str);
    const result = await ctx.sandbox.strReplace(path, oldStr, newStr);
    return { ...result };
  },
};

export const insertAtLineTool: Tool = {
  name: "insert_at_line",
  description: "Insert content at a specific line number in a file.",
  parameters: {
    type: "object",
    properties: {
      path: { type: "string", description: "File path, relative to the repo root." },
      line: { type: "number", description: "1-indexed line number to insert before." },
      content: { type: "string", description: "Content to insert." },
    },
    required: ["path", "line", "content"],
  },
  async execute(args, ctx) {
    const path = String(args.path);
    const line = Number(args.line);
    const content = String(args.content);
    const result = await ctx.sandbox.insertAtLine(path, line, content);
    return { ...result };
  },
};

export const undoEditTool: Tool = {
  name: "undo_edit",
  description: "Revert the most recent edit made to a file by str_replace, create_file, or insert_at_line.",
  parameters: {
    type: "object",
    properties: {
      path: { type: "string", description: "File path, relative to the repo root." },
    },
    required: ["path"],
  },
  async execute(args, ctx) {
    const path = String(args.path);
    const result = await ctx.sandbox.undoEdit(path);
    return { ...result };
  },
};

/**
 * find_and_edit is a regex-based multi-file refactor: each match gets
 * routed to a cheaper/faster sub-model call (per the build brief). That
 * sub-call fan-out lives here rather than in the sandbox daemon because it
 * needs an LLMProvider, not just file I/O — wired up in Phase 1.5 once the
 * core loop is proven; stubbed for now so the tool registry is complete.
 */
export const findAndEditTool: Tool = {
  name: "find_and_edit",
  description:
    "Regex-based multi-file refactor. Not yet implemented — use str_replace per-file until this lands.",
  parameters: {
    type: "object",
    properties: {
      pattern: { type: "string", description: "Regex pattern to search for across the repo." },
      instruction: { type: "string", description: "What each match should be changed to." },
    },
    required: ["pattern", "instruction"],
  },
  execute() {
    return Promise.resolve({
      error: "find_and_edit is not implemented yet. Use str_replace on individual files instead.",
    });
  },
};

export const editorTools: Tool[] = [
  openFileTool,
  createFileTool,
  strReplaceTool,
  insertAtLineTool,
  undoEditTool,
  findAndEditTool,
];
