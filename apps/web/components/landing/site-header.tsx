"use client";

import Link from "next/link";
import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-[60] border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Terminal className="h-4 w-4" />
          </span>
          CloudDev
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-foreground">How it works</a>
          <a href="#tools" className="transition-colors hover:text-foreground">Tool surface</a>
        </nav>
        <Button asChild size="sm">
          <Link href="/agent">Launch agent</Link>
        </Button>
      </div>
    </header>
  );
}
