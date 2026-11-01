import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import heroBg from "../../../images/matrix home.png";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-contain bg-center bg-no-repeat bg-black"
        style={{
          backgroundImage: `url(${heroBg})`,
          transform: "scaleX(-1)",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="w-full relative z-10 px-6 md:px-8 h-full min-h-screen flex flex-col pt-32 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1
            data-aos="fade-up"
            data-aos-duration="700"
            className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight text-white leading-[1.05] mb-2"
          >
            shorTest
          </h1>

          <p
            data-aos="fade-up"
            data-aos-delay="150"
            className="text-lg md:text-xl lg:text-2xl text-white/90 font-light"
          >
            Discover the right problem<br className="sm:hidden" /> before you invest
          </p>
        </div>

        <div className="flex-1" />

        <div className="max-w-4xl mx-auto text-center mb-[10vh]">
          <p
            data-aos="fade-up"
            data-aos-delay="200"
            className="text-xl md:text-2xl lg:text-3xl text-white/80 font-light uppercase tracking-widest mb-3"
          >
            ​
          </p>

          <div
            data-aos="fade-up"
            data-aos-delay="400"
            className="flex flex-row gap-12 sm:gap-16 md:gap-20 justify-center items-center mt-2 md:mt-4"
          >
            <a
              href="#problem"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("problem")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-3 text-sm md:text-base border border-blue-500/40 bg-blue-500/5 backdrop-blur-sm text-white hover:bg-blue-500/15 rounded-full transition-all duration-300 font-medium"
            >
              AI FOR SPEED
            </a>
            <a
              href="#change-reality"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("change-reality")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-3 text-sm md:text-base border border-red-500/40 bg-red-500/5 backdrop-blur-sm text-white hover:bg-red-500/15 rounded-full transition-all duration-300 font-medium"
            >
              AI FOR CHANGE
            </a>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="w-5 h-5 text-white/70" />
        </motion.div>
      </motion.div>
    </section>
  );
};
