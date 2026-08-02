import { Zap, Target, BarChart3 } from "lucide-react";
import { Button } from "../ui/button";
import { PricingModal } from "./PricingModal";
import { DashboardMockup } from "./DashboardMockup";
import { useState } from "react";
import hourglass from "../../../images/Screenshot 2026-06-29 alle 16.44.43.png";

export const SolutionSection = ({ onPlanSelect }) => {
  const [pricingOpen, setPricingOpen] = useState(false);
  const platformFeatures = [
    {
      icon: Zap,
      title: "Launch short challenges to your team",
    },
    {
      icon: Target,
      title: "Surface  problems and  new solutions",
    },
    {
      icon: BarChart3,
      title: "Turn data into better decisions",
    },
  ];

  return (
    <>
      <section
        id="change-reality"
        className="bg-background pt-10 md:pt-14 pb-2 md:pb-3"
      >
        <div className="w-full px-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div
              data-aos="zoom-in"
              data-aos-delay="100"
              className="max-w-3xl mx-auto mb-8 rounded-2xl overflow-hidden border border-border shadow-sm"
            >
              <img
                src={hourglass}
                alt="Hourglass showing time transforming into a city"
                className="w-full h-auto object-cover"
              />
            </div>

            <h2
              data-aos="fade-up"
              data-aos-delay="200"
              className="text-center text-[1.75rem] md:text-[2.75rem] lg:text-[3.5rem] leading-[1.1] font-bold text-foreground tracking-tight mb-6"
            >
              Turn short time into{" "}
              <span className="text-emerald-400">real</span> change.
            </h2>

            <p
              data-aos="fade-up"
              data-aos-delay="200"
              className="text-center text-xl md:text-2xl lg:text-3xl text-foreground/80 max-w-3xl mx-auto mb-8 leading-relaxed"
            >
              shorTest integrates learning, innovation, and real work in one
              short challenge.
              <sup className="text-emerald-400">2</sup>
            </p>

            <h3
              data-aos="fade-up"
              data-aos-delay="200"
              className="text-emerald-400 text-center text-xl md:text-2xl font-normal tracking-wide uppercase mt-12 md:mt-16 mb-2"
            >
              How it works
            </h3>
          </div>
        </div>
      </section>

      <section id="solution" className="pt-2 md:pt-4 pb-20 md:pb-32 bg-background">
        <div className="w-full px-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {platformFeatures.map((feature, i) => (
                <div
                  key={i}
                  data-aos="fade-up"
                  data-aos-delay={String(300 + i * 100)}
                  className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-6 text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-900/50 flex items-center justify-center mb-4">
                    <feature.icon className="w-5 h-5 text-emerald-400" strokeWidth={2} />
                  </div>
                  <p className="text-white leading-relaxed font-bold text-xl md:text-2xl">
                    {feature.title}
                  </p>
                </div>
              ))}
            </div>

            <div
              data-aos="zoom-in"
              data-aos-delay="300"
              className="mb-10"
            >
              <DashboardMockup />
            </div>

            <div
              data-aos="fade-up"
              data-aos-delay="500"
              className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-8 md:p-12 text-center"
            >
              <h3 className="text-2xl md:text-3xl font-bold mb-6 text-white">
                Build your Change Intelligence Infrastructure
              </h3>
              <ul className="text-white leading-relaxed max-w-3xl mx-auto mb-8 text-xl text-left list-disc pl-6 space-y-2">
                <li>
                  Train Applied Change.
                </li>
                <li>Measure Change KPI.</li>
                <li>Turn problems into actionable solutions.</li>
                <li>Validate change before adoption.</li>
              </ul>
              <button
                onClick={() => setPricingOpen(true)}
                className="h-14 px-12 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-black font-semibold text-base tracking-wide transition-colors cursor-pointer"
              >
                Start for Free
              </button>
            </div>
          </div>
        </div>

        <PricingModal open={pricingOpen} onOpenChange={setPricingOpen} onSelect={onPlanSelect} />
      </section>
    </>
  );
};
