/**
 * Lightweight CSS-only background for the landing page.
 * Avoids framer-motion animation overhead on first paint.
 */
export function StaticBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
      aria-hidden
    >
      <div className="absolute top-[-20%] left-[-10%] h-[50vw] w-[50vw] max-h-[600px] max-w-[600px] animate-ambient-drift rounded-full bg-[#5B6CFF]/15 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40vw] w-[40vw] max-h-[500px] max-w-[500px] animate-ambient-drift-reverse rounded-full bg-[#7C4DFF]/12 blur-[100px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
    </div>
  );
}
