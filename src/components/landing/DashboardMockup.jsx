import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

const AnimatedNumber = ({ value, duration = 2 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) =>
    Math.round(latest).toLocaleString()
  );

  useEffect(() => {
    if (inView) {
      const controls = animate(count, value, { duration, ease: "easeOut" });
      return controls.stop;
    }
  }, [inView, value, duration, count]);

  return (
    <motion.span ref={ref}>
      <motion.span>{rounded}</motion.span>
    </motion.span>
  );
};

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-emerald-400 rounded-2xl p-5 md:p-6 text-slate-900 font-montserrat ${className}`}
  >
    {children}
  </div>
);

export const DashboardMockup = () => {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-2xl overflow-hidden font-montserrat">
      <div className="hidden md:flex px-5 md:px-7 py-4 items-center justify-between flex-wrap gap-3">
        <div className="text-xs md:text-sm font-semibold tracking-widest text-slate-900 font-montserrat">
          DASHBOARD{" "}
          <span className="text-emerald-500">{">"} OBSERVATORY</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold tracking-widest font-montserrat">
          <span className="px-3 py-1.5 border border-slate-900 rounded text-slate-900">
            MANAGE PEOPLE
          </span>
          <span className="px-3 py-1.5 bg-slate-900 text-white rounded">
            LAUNCH SHORTEST
          </span>
        </div>
      </div>

      <div className="px-6 md:px-7 pt-6 md:pt-7 pb-6 md:pb-7 grid grid-cols-2 gap-4">
        <Card className="flex items-center justify-center md:justify-between gap-4 text-center md:text-left">
          <div>
            <div className="text-sm md:text-base font-bold tracking-widest mb-2 font-montserrat">
              CHANGE KPI
            </div>
            <div className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-none font-montserrat">
              <AnimatedNumber value={85} />
            </div>
            <div className="hidden md:block text-[10px] md:text-xs text-slate-900/70 mt-2 font-medium font-montserrat">
              ↑ 3 vs week
            </div>
          </div>
          <div className="hidden md:block space-y-2 text-[10px] md:text-xs font-medium text-slate-900 min-w-[140px] font-montserrat">
            <div className="flex items-center justify-between gap-4">
              <span>Critical Thinking</span>
              <span className="opacity-70">82</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Creativity</span>
              <span className="opacity-70">75</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Feasibility</span>
              <span className="opacity-70">88</span>
            </div>
          </div>
        </Card>

        <Card className="flex items-center justify-center md:justify-between gap-4 text-center md:text-left">
          <div>
            <div className="text-sm md:text-base font-bold tracking-widest mb-2 font-montserrat">
              SHORTERS INVOLVED
            </div>
            <div className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-none font-montserrat">
              <AnimatedNumber value={1731} duration={2.2} />
            </div>
            <div className="hidden md:block text-[10px] md:text-xs text-slate-900/70 mt-2 font-medium font-montserrat">
              ↑ 12 vs week
            </div>
          </div>
          <div className="hidden md:block space-y-2 text-[10px] md:text-xs font-medium text-slate-900 min-w-[140px] font-montserrat">
            <div className="flex items-center justify-between gap-4">
              <span>abcd123</span>
              <span className="opacity-70">CKPI 89</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>adan1</span>
              <span className="opacity-70">CKPI 88</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>nvbgl</span>
              <span className="opacity-70">CKPI 87</span>
            </div>
          </div>
        </Card>

        <Card className="flex items-center justify-center md:justify-between gap-4 text-center md:text-left">
          <div>
            <div className="text-sm md:text-base font-bold tracking-widest mb-2 font-montserrat">
              EMERGING PROBLEMS
            </div>
            <div className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-none font-montserrat">
              <AnimatedNumber value={33} />
            </div>
            <div className="hidden md:block text-[10px] md:text-xs text-slate-900/70 mt-2 font-medium font-montserrat">
              ↓ 2 vs week
            </div>
          </div>
          <div className="hidden md:block space-y-2 text-[10px] md:text-xs font-medium text-slate-900 min-w-[140px] font-montserrat">
            <div className="flex items-center justify-between gap-4">
              <span>internal_comm</span>
              <span className="opacity-70">20</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>onboarding_gap</span>
              <span className="opacity-70">6</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>tool_friction</span>
              <span className="opacity-70">3</span>
            </div>
          </div>
        </Card>

        <Card className="flex items-center justify-center md:justify-between gap-4 text-center md:text-left">
          <div>
            <div className="text-sm md:text-base font-bold tracking-widest mb-2 font-montserrat">
              TOP SOLUTIONS
            </div>
            <div className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-none font-montserrat">
              <AnimatedNumber value={405} duration={2} />
            </div>
            <div className="hidden md:block text-[10px] md:text-xs text-slate-900/70 mt-2 font-medium font-montserrat">
              ↑ 8 vs week
            </div>
          </div>
          <div className="hidden md:block space-y-2 text-[10px] md:text-xs font-medium text-slate-900 min-w-[140px] font-montserrat">
            <div>peer mentoring</div>
            <div>async standups</div>
            <div>shared playbooks</div>
          </div>
        </Card>
      </div>

      <div className="hidden md:flex mx-5 md:mx-7 mb-5 md:mb-7 border border-slate-300 rounded-xl px-4 py-3 items-center gap-3">
        <span className="text-[10px] md:text-xs font-bold tracking-widest text-slate-900 shrink-0 font-montserrat">
          TRANSFORMACHINE {">"}
        </span>
        <span className="text-[10px] md:text-xs tracking-wider text-slate-500 flex-1 truncate font-montserrat">
          turn data into action
        </span>
        <button className="text-[10px] md:text-xs font-bold tracking-widest text-slate-400 border border-slate-300 rounded px-4 py-1.5 shrink-0 font-montserrat">
          SEND
        </button>
      </div>
    </div>
  );
};
