import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, RadialBar, RadialBarChart } from "recharts";

const flow = Array.from({ length: 14 }).map((_, i) => ({
  day: `D${i + 1}`,
  minutes: 30 + Math.round(Math.sin(i * 0.7) * 40 + (i % 3) * 25 + 60),
}));

const mastery = [
  { name: "Algebra", value: 82, fill: "hsl(218 100% 66%)" },
  { name: "Quantum", value: 64, fill: "hsl(268 90% 70%)" },
  { name: "ML", value: 48, fill: "hsl(188 95% 60%)" },
  { name: "Macro", value: 71, fill: "hsl(156 78% 55%)" },
];

export const AnalyticsView = () => (
  <div className="flex flex-col gap-4">
    <div className="grid gap-4 md:grid-cols-3">
      {[
        { l: "Total focus · 30d", v: "42h 18m", d: "+18% vs prev" },
        { l: "Concepts mastered", v: "127", d: "+12 this week" },
        { l: "Consistency", v: "94%", d: "17-day streak" },
      ].map((m, i) => (
        <motion.div key={m.l} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} className="glass rounded-2xl p-5 shadow-soft">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{m.l}</div>
          <div className="mt-1 font-display text-3xl">{m.v}</div>
          <div className="text-xs text-accent-emerald">{m.d}</div>
        </motion.div>
      ))}
    </div>

    <div className="grid gap-4 lg:grid-cols-3">
      <div className="glass rounded-2xl p-5 shadow-soft lg:col-span-2">
        <div className="mb-3 text-[11px] uppercase tracking-widest text-muted-foreground">Daily flow · 14 days</div>
        <div className="h-64">
          <ResponsiveContainer>
            <AreaChart data={flow}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Area type="monotone" dataKey="minutes" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 shadow-soft">
        <div className="mb-3 text-[11px] uppercase tracking-widest text-muted-foreground">Mastery by subject</div>
        <div className="h-64">
          <ResponsiveContainer>
            <RadialBarChart innerRadius="30%" outerRadius="100%" data={mastery} startAngle={90} endAngle={-270}>
              <RadialBar background={{ fill: "hsl(var(--secondary))" }} dataKey="value" cornerRadius={8} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
          {mastery.map((m) => (
            <div key={m.name} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: m.fill }} />
              <span className="text-muted-foreground">{m.name}</span>
              <span className="ml-auto">{m.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
