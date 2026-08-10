const stats = [
  { label: "Isolated", detail: "fresh container per task" },
  { label: "Observable", detail: "every command, streamed live" },
  { label: "Reviewable", detail: "always ships as a PR, not a push" },
  { label: "Yours", detail: "runs against your own infra" },
];

export function StatsBar() {
  return (
    <section className="border-t border-border/60 py-16">
      <div className="container grid grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center md:text-left">
            <p className="font-display text-lg font-semibold text-foreground">{s.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
