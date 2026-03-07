import React, { useEffect, useState } from 'react';

export default function KPIAnimatedNumber({ value = 0 }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf;
    const start = Date.now();
    function tick() {
      const t = Math.min(1, (Date.now() - start) / 800);
      setN(Math.round(value * t));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    tick();
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <div className="text-4xl font-bold">{n}%</div>;
}
