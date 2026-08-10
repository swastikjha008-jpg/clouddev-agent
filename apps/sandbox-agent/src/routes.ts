import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { ShellManager } from "./shell-manager.js";
import { Editor } from "./editor.js";

const runShellSchema = z.object({ command: z.string().min(1), cwd: z.string().optional() });
const stdinSchema = z.object({ input: z.string() });
const createFileSchema = z.object({ path: z.string().min(1), content: z.string() });
const strReplaceSchema = z.object({ path: z.string().min(1), oldStr: z.string(), newStr: z.string() });
const insertAtLineSchema = z.object({ path: z.string().min(1), line: z.number().int().positive(), content: z.string() });
const undoSchema = z.object({ path: z.string().min(1) });

export function registerRoutes(app: FastifyInstance): void {
  const shells = new ShellManager();
  const editor = new Editor(process.env.WORKSPACE_DIR ?? "/workspace");

  app.get("/health", () => ({ status: "ok" }));

  // ---- Shell ----

  app.post("/shell/run", async (request, reply) => {
    const body = runShellSchema.parse(request.body);
    const shellId = shells.run(body.command, body.cwd);
    return reply.code(201).send({ shellId });
  });

  app.get<{ Params: { id: string } }>("/shell/:id/output", async (request, reply) => {
    try {
      return reply.send(shells.getOutput(request.params.id));
    } catch (err) {
      return reply.code(404).send({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  app.post<{ Params: { id: string } }>("/shell/:id/stdin", async (request, reply) => {
    const body = stdinSchema.parse(request.body);
    try {
      shells.writeStdin(request.params.id, body.input);
      return reply.send({ ok: true });
    } catch (err) {
      return reply.code(400).send({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  app.post<{ Params: { id: string } }>("/shell/:id/kill", async (request, reply) => {
    try {
      shells.kill(request.params.id);
      return reply.send({ ok: true });
    } catch (err) {
      return reply.code(404).send({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  // ---- Editor ----

  app.get("/files/open", async (request, reply) => {
    const path = z.string().min(1).parse((request.query as Record<string, unknown>).path);
    try {
      return reply.send(await editor.open(path));
    } catch (err) {
      return reply.code(404).send({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  app.post("/files/create", async (request, reply) => {
    const body = createFileSchema.parse(request.body);
    try {
      return reply.code(201).send(await editor.create(body.path, body.content));
    } catch (err) {
      return reply.code(400).send({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  app.post("/files/str-replace", async (request, reply) => {
    const body = strReplaceSchema.parse(request.body);
    try {
      return reply.send(await editor.strReplace(body.path, body.oldStr, body.newStr));
    } catch (err) {
      return reply.code(400).send({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  app.post("/files/insert-at-line", async (request, reply) => {
    const body = insertAtLineSchema.parse(request.body);
    try {
      return reply.send(await editor.insertAtLine(body.path, body.line, body.content));
    } catch (err) {
      return reply.code(400).send({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  app.post("/files/undo", async (request, reply) => {
    const body = undoSchema.parse(request.body);
    try {
      return reply.send(await editor.undo(body.path));
    } catch (err) {
      return reply.code(400).send({ error: err instanceof Error ? err.message : String(err) });
    }
  });
}
