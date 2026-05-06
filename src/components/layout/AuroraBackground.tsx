import { motion } from "framer-motion";

export const AuroraBackground = () => (
  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-background" />
    <motion.div
      className="absolute -top-40 -left-40 h-[60vmax] w-[60vmax] rounded-full blur-3xl opacity-60"
      style={{ background: "radial-gradient(circle, hsl(var(--accent-blue) / 0.5), transparent 60%)" }}
      animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute -bottom-40 -right-40 h-[55vmax] w-[55vmax] rounded-full blur-3xl opacity-50"
      style={{ background: "radial-gradient(circle, hsl(var(--accent-violet) / 0.55), transparent 60%)" }}
      animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
      transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute top-1/3 left-1/2 h-[45vmax] w-[45vmax] -translate-x-1/2 rounded-full blur-3xl opacity-30"
      style={{ background: "radial-gradient(circle, hsl(var(--accent-cyan) / 0.4), transparent 60%)" }}
      animate={{ scale: [1, 1.15, 1] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
    />
    {/* Particle field */}
    <div className="absolute inset-0">
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-foreground/40"
          style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%` }}
          animate={{ y: [0, -20, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 4 + (i % 5), repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
        />
      ))}
    </div>
    {/* Grid overlay */}
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    />
  </div>
);
