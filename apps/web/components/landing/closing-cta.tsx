"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ClosingCta() {
  return (
    <section className="relative overflow-hidden border-t border-border/60 py-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="container relative flex flex-col items-center gap-6 text-center">
        <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Hand off the next ticket.
        </h2>
        <p className="max-w-md text-muted-foreground">
          Connect a repo and give it something real to do. You can watch every command it runs.
        </p>
        <Button asChild size="lg" className="mt-2 group">
          <Link href="/agent">
            Launch the agent
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
        <span>CloudDev — an autonomous engineer for your repo.</span>
        <span className="font-mono text-xs">built by @swastikjha008</span>
      </div>
    </footer>
  );
}
