import { Github, Sparkle } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="relative z-20 flex justify-center pb-2 pt-10">
      <a
        href="#how-it-works"
        className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur-sm transition-colors hover:border-cyan/40 hover:text-foreground"
      >
        <Sparkle className="h-3 w-3 text-cyan" />
        Connects to a GitHub repo in seconds
        <Github className="h-3 w-3 opacity-60 transition-transform group-hover:translate-x-0.5" />
      </a>
    </div>
  );
}
