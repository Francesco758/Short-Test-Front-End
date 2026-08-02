import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Check, Sparkles, Users, Building2 } from "lucide-react";

const tiers = [
  {
    name: "shorTest",
    icon: Sparkles,
    price: "Free",
    period: "/for 6 months",
    description: "Early Adopters",
    features: [
      "Universities & research",
      "Pilot projects",
      "Grant-backed initiatives",
      "Limited shorTests",
    ],
    cta: "Start Free",
    highlight: true,
  },
  {
    name: "shorTeam",
    icon: Users,
    price: "€29 ",
    period: " / 6 months",
    description: "Team, school, SME",
    features: [
      "Unlimited shorTests",
      "20 shorters involved",
      "Team dashboard",
      "Basic analytics",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "shorTerprise",
    icon: Building2,
    price: "€ustom ",
    period: "/ contact us",
    description: "Enterprise, Universities, PA",
    features: [
      "Unlimited shorTests",
      "200 shorters involved",
      "First observatory of applied change",
      "Advanced Change KPI analytics",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

export const PricingModal = ({ open, onOpenChange, onSelect }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-border p-4 sm:p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl font-bold text-center mb-2">
            Choose your <span className="text-primary">shorTest</span> plan
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-6 border ${
                tier.highlight
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border bg-background"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Popular
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    tier.highlight ? "bg-primary/20" : "bg-secondary/50"
                  }`}
                >
                  <tier.icon
                    className={`w-5 h-5 ${
                      tier.highlight ? "text-primary" : "text-foreground"
                    }`}
                  />
                </div>
                <span className="font-bold text-lg text-foreground">
                  {tier.name}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                {tier.description}
              </p>

              <div className="mb-6">
                <span className="text-3xl font-bold text-foreground">
                  {tier.price}
                </span>
                <span className="text-muted-foreground text-sm">
                  {tier.period}
                </span>
              </div>

              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <Check
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        tier.highlight
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={tier.highlight ? "hero" : "outline"}
                className="w-full"
                onClick={() => onSelect && onSelect(tier.name)}
              >
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
