const stack = ["TypeScript", "Python", "Next.js", "Node.js", "Docker", "GitHub"];

export function StackRow() {
  return (
    <div className="relative z-20 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pb-24">
      {stack.map((item) => (
        <span
          key={item}
          className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground/70"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
