"use client";

import { Globe2 } from "lucide-react";

/**
 * Browser automation (navigate_browser, view_browser, etc.) is a Phase 4
 * tool — not implemented in the backend yet. Honest empty state instead of
 * a fabricated preview.
 */
export function BrowserPreview() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
      <Globe2 className="h-5 w-5 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground">Live browser preview isn&apos;t available yet</p>
      <p className="max-w-xs text-xs text-muted-foreground">
        Browser automation tools land in a later phase, alongside deploy previews.
      </p>
    </div>
  );
}
