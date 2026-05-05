import React, { useState, useEffect, useRef } from "react";

const STATS = [
  { value: 500, suffix: "+", label: "Active Shops" },
  { value: 40, suffix: "%", label: "Less Downtime" },
  { value: 99, suffix: "%", label: "System Uptime" },
  { value: 50, suffix: "+", label: "Active Features" },
];

function AnimatedNumber({ target, suffix }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = Math.max(1, Math.floor(target / 40));
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setVal(target); clearInterval(timer); }
          else setVal(start);
        }, 30);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

export default function StatsSection() {
  return (
    <section id="stats" style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {STATS.map(({ value, suffix, label }) => (
          <div key={label} className="text-center">
            <p className="text-5xl lg:text-6xl font-extrabold mb-2" style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              <AnimatedNumber target={value} suffix={suffix} />
            </p>
            <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
