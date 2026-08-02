import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TooltipProvider } from "../components/ui/tooltip";
import { StickyHeader } from "../components/landing/StickyHeader";
import { Hero } from "../components/landing/Hero";
import { ProblemSection } from "../components/landing/ProblemSection";
import { SolutionSection } from "../components/landing/SolutionSection";
import { MissionSection } from "../components/landing/MissionSection";
import { ContactSection } from "../components/landing/ContactSection";
import { Footer } from "../components/landing/Footer";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  const handlePlanSelect = (planName) => {
    navigate("/register", { state: { selectedPlan: planName } });
  };

  return (
    <TooltipProvider>
      <StickyHeader />
      <main className="min-h-screen bg-background text-foreground">
        <Hero />
        <ProblemSection />
        <SolutionSection onPlanSelect={handlePlanSelect} />
        <MissionSection />
        <ContactSection />
        <Footer />
      </main>
    </TooltipProvider>
  );
}
