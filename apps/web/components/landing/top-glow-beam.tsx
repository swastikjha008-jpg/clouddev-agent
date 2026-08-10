export function TopGlowBeam() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center overflow-hidden">
      <div className="h-px w-[70%] max-w-4xl bg-gradient-to-r from-transparent via-cyan to-transparent" />
      <div className="absolute h-40 w-[70%] max-w-4xl -translate-y-1/2 bg-cyan/20 blur-3xl" />
    </div>
  );
}
