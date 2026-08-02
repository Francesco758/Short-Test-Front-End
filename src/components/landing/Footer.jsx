import logoHeads from "../../../images/logo-heads.png";

export const Footer = () => {
  return (
    <footer data-aos="fade-up" className="py-8 border-t border-border">
      <div className="w-full px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center">
            <div className="flex items-center gap-3">
              <img
                src={logoHeads}
                alt="shorTest"
                className="w-6 h-6 object-contain opacity-60"
              />
              <span className="text-foreground font-medium">
                shor<span className="text-primary">Test</span>
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">
                Turn time limits into real change.
              </span>
            </div>
          </div>

          <div className="text-center mt-8 space-y-2">
            <p className="text-xs text-muted-foreground max-w-3xl mx-auto">
              <sup className="text-emerald-400 mr-1">1</sup>
              Problem-solving and creative thinking are declining across people
              and organizations. (OECD PISA, McKinsey and others)
            </p>
            <p className="text-xs text-muted-foreground max-w-3xl mx-auto">
              <sup className="text-emerald-400 mr-1">2</sup>
              Built on a design framework refined through ten years of academic
              research and design education.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
