import einstein from "../../../images/Screenshot 2026-06-28 alle 19.01.46.png";

export const MissionSection = () => {
  return (
    <section className="pt-4 pb-20 bg-black">
      <div className="w-full px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div
            data-aos="fade-up"
            className="text-center mb-6"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-white">
              Problem first.
            </h2>
          </div>

          <p
            data-aos="fade-up"
            data-aos-delay="100"
            className="text-center text-2xl md:text-3xl lg:text-4xl text-white max-w-4xl mx-auto mb-12"
          >
            Every successful change starts with the right problem.
          </p>

          <div
            data-aos="fade-up"
            data-aos-delay="200"
            className="relative rounded-2xl overflow-hidden border border-gray-700 bg-[#1a1a1a] mb-16"
          >
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-10 flex flex-col justify-center order-2 md:order-1">
                <div className="text-emerald-400 text-5xl md:text-6xl leading-none mb-4 font-serif italic">
                  "
                </div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-normal text-white leading-snug mb-6 font-serif italic">
                  If I had one hour to solve a problem, I'd spend 55 minutes
                  defining it.
                </h2>
                <div className="w-12 h-px bg-emerald-400 mb-4" />
                <p className="text-emerald-400 text-sm md:text-base font-medium">
                  A. Einstein
                </p>
              </div>
              <div className="order-1 md:order-2 min-h-[220px] md:min-h-[320px]">
                <img
                  src={einstein}
                  alt="Albert Einstein"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
       </div>
      </div>
    </section>
  );
};
