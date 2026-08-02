import logoHeads from "../../../images/logo-heads.png";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Link } from "react-router-dom";

export const StickyHeader = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="opacity-80 hover:opacity-100 transition-opacity">
              <img
                src={logoHeads}
                alt="shorTest logo"
                className="w-12 h-12 object-contain"
              />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="max-w-sm bg-card/95 backdrop-blur-sm"
          >
            <p className="text-sm leading-relaxed">
              We are <span className="font-semibold">shorTest</span>, an{" "}
              <span className="font-semibold text-primary">
                Augmented Intelligence
              </span>{" "}
              company: we study and design interaction between artificial and
              human intelligence to enhance both.
            </p>
            <p className="text-sm leading-relaxed mt-2">
              shorTest is the synthesis of our long journey between
              neuro-scientific research and management of end-to-end
              communication and innovation projects for main organizations.
            </p>
          </TooltipContent>
        </Tooltip>

        <Link to="/login" className="text-sm font-semibold transition-colors">
          <span className="text-emerald-400 hover:text-emerald-300">Sign</span>
          <span className="text-white/80 hover:text-white"> in</span>
        </Link>
      </div>
    </div>
  );
};
