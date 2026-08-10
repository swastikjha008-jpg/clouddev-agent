import { Bot, User, CheckCircle2, Loader2, Terminal } from "lucide-react";

export function LivePreviewSection() {
  return (
    <section className="relative border-t border-border/60 py-28">
      <div className="container">
        <div className="mb-14 max-w-xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">Not a black box</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Watch it think, not just wait.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every plan, command, and file edit streams to you live — the same workspace you&apos;d get from a teammate screen-sharing their terminal.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-black/40">
          {/* fake window chrome */}
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
            <span className="ml-3 font-mono text-[11px] text-muted-foreground">clouddev.app/agent</span>
          </div>

          <div className="grid md:grid-cols-2">
            {/* mock chat */}
            <div className="space-y-4 border-b border-border/60 p-6 md:border-b-0 md:border-r">
              <div className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-foreground">
                  <User className="h-3.5 w-3.5" />
                </span>
                <div className="rounded-2xl rounded-tl-sm bg-accent px-3.5 py-2 text-sm">
                  Add rate limiting to the /api/upload route.
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Bot className="h-3.5 w-3.5" />
                </span>
                <div className="rounded-2xl rounded-tl-sm bg-primary/10 px-3.5 py-2 text-sm text-foreground/90">
                  On it. Adding a sliding-window limiter and a test that hits the route 20x — one sec.
                </div>
              </div>
              <div className="flex gap-3 opacity-70">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Bot className="h-3.5 w-3.5" />
                </span>
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-primary/10 px-3.5 py-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  running tests…
                </div>
              </div>
            </div>

            {/* mock terminal + activity */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2">
                <Terminal className="h-3 w-3 text-muted-foreground" />
                <span className="font-mono text-[11px] text-muted-foreground">shell — sandbox-7f2a</span>
              </div>
              <div className="flex-1 space-y-1.5 bg-[#030303] p-4 font-mono text-[12px] leading-relaxed">
                <p className="text-primary">$ npm test -- rate-limit</p>
                <p className="text-foreground/70">PASS  routes/upload.test.ts</p>
                <p className="text-foreground/70">  ✓ blocks after 20 requests/min (412ms)</p>
                <p className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> 1 passed, 0 failed
                </p>
                <p className="mt-3 text-primary">$ git commit -m &quot;add rate limiting to upload route&quot;</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
