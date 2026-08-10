import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { dirname, resolve, relative, isAbsolute } from "node:path";

export interface FileEditResult {
  path: string;
  content: string;
}

/**
 * All file tools go through here rather than raw shell commands (`cat`,
 * `sed`, `echo`) so edits are structured, auditable, and reversible — the
 * agent loop persists exactly what changed, not just "ran a command."
 */
export class Editor {
  private readonly undoHistory = new Map<string, string[]>();

  constructor(private readonly workspaceRoot: string) {}

  private resolvePath(relativePath: string): string {
    if (isAbsolute(relativePath)) {
      throw new Error("path must be relative to the repo root");
    }
    const resolved = resolve(this.workspaceRoot, relativePath);
    const rel = relative(this.workspaceRoot, resolved);
    if (rel.startsWith("..")) {
      throw new Error("path escapes the workspace root");
    }
    return resolved;
  }

  private pushUndoState(path: string, previousContent: string): void {
    const stack = this.undoHistory.get(path) ?? [];
    stack.push(previousContent);
    this.undoHistory.set(path, stack);
  }

  async open(relativePath: string): Promise<FileEditResult> {
    const absPath = this.resolvePath(relativePath);
    const content = await readFile(absPath, "utf8");
    return { path: relativePath, content };
  }

  async create(relativePath: string, content: string): Promise<FileEditResult> {
    const absPath = this.resolvePath(relativePath);
    const exists = await access(absPath, fsConstants.F_OK)
      .then(() => true)
      .catch(() => false);
    if (exists) {
      throw new Error(`file already exists: ${relativePath}`);
    }
    await mkdir(dirname(absPath), { recursive: true });
    await writeFile(absPath, content, "utf8");
    this.pushUndoState(relativePath, ""); // undo -> back to "did not exist" is out of scope; undo restores empty.
    return { path: relativePath, content };
  }

  async strReplace(relativePath: string, oldStr: string, newStr: string): Promise<FileEditResult> {
    const absPath = this.resolvePath(relativePath);
    const original = await readFile(absPath, "utf8");

    const firstIndex = original.indexOf(oldStr);
    if (firstIndex === -1) {
      throw new Error("old_str not found in file");
    }
    const lastIndex = original.lastIndexOf(oldStr);
    if (firstIndex !== lastIndex) {
      throw new Error("old_str matches more than once — include more surrounding context to make it unique");
    }

    const updated = original.slice(0, firstIndex) + newStr + original.slice(firstIndex + oldStr.length);
    this.pushUndoState(relativePath, original);
    await writeFile(absPath, updated, "utf8");
    return { path: relativePath, content: updated };
  }

  async insertAtLine(relativePath: string, line: number, content: string): Promise<FileEditResult> {
    const absPath = this.resolvePath(relativePath);
    const original = await readFile(absPath, "utf8");
    const lines = original.split("\n");

    if (line < 1 || line > lines.length + 1) {
      throw new Error(`line ${line} is out of range (file has ${lines.length} lines)`);
    }

    lines.splice(line - 1, 0, content);
    const updated = lines.join("\n");
    this.pushUndoState(relativePath, original);
    await writeFile(absPath, updated, "utf8");
    return { path: relativePath, content: updated };
  }

  async undo(relativePath: string): Promise<FileEditResult> {
    const absPath = this.resolvePath(relativePath);
    const stack = this.undoHistory.get(relativePath);
    const previous = stack?.pop();
    if (previous === undefined) {
      throw new Error(`no edit history for ${relativePath}`);
    }
    await writeFile(absPath, previous, "utf8");
    return { path: relativePath, content: previous };
  }
}
