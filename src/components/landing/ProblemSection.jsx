import { motion } from "framer-motion";
import { Target, Lightbulb, CheckCircle2 } from "lucide-react";



export const ProblemSection = () => {
  return (
    <section
      id="problem"
      className="section-padding bg-background pt-10 md:pt-14 pb-2 md:pb-4"
    >
      <div className="w-full px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div
            data-aos="fade-up"
            className="text-center mb-12"
          >
            <p className="text-sm md:text-base uppercase tracking-widest text-emerald-400 mb-6">
              The hard problem
            </p>
            <p id="sentence-1" className="text-2xl md:text-3xl lg:text-4xl font-normal text-foreground max-w-none mx-auto scroll-mt-20">
              <a
                href="#footnote-1"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("footnote-1")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="hover:text-emerald-400 transition-colors cursor-pointer"
              >
                More Speed, Less Change
              </a>
              <sup className="text-emerald-400 text-sm md:text-base ml-0.5">
                1
              </sup>
            </p>
            <p className="text-lg md:text-xl text-foreground/70 italic max-w-none mx-auto mt-2">
              For people and organizations
            </p>
          </div>

          <div
            data-aos="zoom-in"
            data-aos-delay="200"
            className="max-w-3xl mx-auto bg-card rounded-2xl shadow-sm border-border border overflow-hidden"
          >
            <div className="w-full aspect-[16/10] overflow-hidden">
              <video
                src="/runner-fast.mp4"
                autoPlay
                loop
                muted
                playsInline
                controls={false}
                onContextMenu={(e) => e.preventDefault()}
                onMouseDown={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="w-full h-full object-cover scale-125 pointer-events-none"
                style={{ WebkitUserSelect: "none", userSelect: "none" }}
              />
            </div>
          </div>

          <div
            data-aos="fade-up"
            data-aos-delay="300"
            className="text-center mt-10"
          >
            <p className="text-2xl md:text-3xl lg:text-4xl text-foreground max-w-3xl mx-auto leading-snug">
              Training and innovation remain isolated. Passive use of AI
              reinforces our habits
            </p>
          </div>

          <div
            data-aos="zoom-in"
            data-aos-delay="200"
            className="max-w-3xl mx-auto mt-10 bg-card rounded-2xl shadow-sm border-border border overflow-hidden"
          >
            <div className="w-full aspect-[16/9] overflow-hidden">
              <video
                src="/kling_20260628_VIDEO_mantenendo_5286_0.mp4"
                autoPlay
                loop
                muted
                playsInline
                controls={false}
                onContextMenu={(e) => e.preventDefault()}
                onMouseDown={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="w-full h-full object-cover pointer-events-none"
                style={{ WebkitUserSelect: "none", userSelect: "none" }}
              />
            </div>
          </div>

          <div
            data-aos="fade-up"
            data-aos-delay="300"
            className="text-center mt-10"
          >
            <h2 className="text-[1.75rem] md:text-[2.75rem] lg:text-[3.5rem] leading-[1.1] text-foreground font-bold tracking-tight">
              <span className="text-emerald-400">shorTest</span> turns change
              into a habit
            </h2>
            <p className="text-2xl md:text-3xl lg:text-4xl text-foreground mt-6 max-w-3xl mx-auto">
              Powered by Critical AI™ to help people think better{" "}
              <span className="text-emerald-400 inline-flex items-center">
                <span className="inline-flex ml-1.5" aria-hidden="true">
                  <motion.span
                    className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-400 mx-0.5"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      delay: 0,
                    }}
                  />
                  <motion.span
                    className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-400 mx-0.5"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      delay: 0.2,
                    }}
                  />
                  <motion.span
                    className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-400 mx-0.5"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      delay: 0.4,
                    }}
                  />
                </span>
              </span>
            </p>
          </div>

          <div
            data-aos="fade-up"
            data-aos-delay="400"
            className="flex justify-center gap-14 md:gap-28 mt-16 md:mt-20 max-w-3xl mx-auto"
          >
            {[
              { icon: Target, label: "Better Problems." },
              { icon: Lightbulb, label: "Better Solutions." },
              { icon: CheckCircle2, label: "Better Decisions." },
            ].map((item, i) => (
              <div
                key={i}
                data-aos="zoom-in"
                data-aos-delay={String(450 + i * 150)}
                className="flex flex-col items-center gap-4"
              >
                <div className="w-14 h-14 rounded-full border-2 border-emerald-400 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-emerald-400" strokeWidth={2} />
                </div>
                <p className="text-lg md:text-xl text-white font-semibold">
                  {item.label}
                </p>
              </div>
            ))}
          </div>


        </div>
      </div>
    </section>
  );
};
