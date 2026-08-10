"use client";

import { FileCode2 } from "lucide-react";

/**
 * The backend doesn't compute or expose file diffs yet — there's no diff
 * tool in Phase 1 (see the backend README's build order). This is an
 * honest empty state rather than fabricated demo content, so it's clear
 * what's real and what isn't.
 */
export function DiffViewer() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
      <FileCode2 className="h-5 w-5 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground">Diffs aren&apos;t available yet</p>
      <p className="max-w-xs text-xs text-muted-foreground">
        File changes happen through str_replace / create_file tool calls — check the Activity tab to see them as they happen. A
        proper diff view is planned for a later phase.
      </p>
    </div>
  );
}
