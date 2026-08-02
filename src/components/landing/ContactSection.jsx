import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    problem: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-20 md:py-32 pt-10 md:pt-16">
      <div className="w-full px-6 md:px-8 -mt-16 md:-mt-24">
        <div className="max-w-3xl mx-auto">
          <div
            data-aos="fade-up"
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Stop reading.
            </h2>
            <p className="text-xl md:text-2xl text-gray-400">
              Start solving something{" "}
              <span className="text-white font-medium">real</span>.
            </p>
          </div>

          {!submitted ? (
            <form
              data-aos="fade-up"
              data-aos-delay="200"
              onSubmit={handleSubmit}
              className="bg-[#1a1a1a] p-8 md:p-10 rounded-2xl border border-gray-700 shadow-sm"
            >
              <div className="grid gap-6">
                <div>
                  <textarea
                    placeholder="Describe your main problem"
                    value={formData.problem}
                    onChange={(e) =>
                      setFormData({ ...formData, problem: e.target.value })
                    }
                    required
                    rows={7}
                    style={{ color: "#ffffff" }}
                    className="flex min-h-[180px] w-full rounded-xl border border-gray-700 bg-[#000000] px-4 py-3 !text-white placeholder:text-gray-500 text-lg md:text-xl leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">
                      Name
                    </label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="h-12"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">
                      Company
                    </label>
                    <Input
                      type="text"
                      placeholder="Company name"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      className="h-12"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="h-12"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-full bg-emerald-400 hover:bg-emerald-500 text-black font-semibold text-sm tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  submit challange
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-[#1a1a1a] p-12 rounded-2xl border border-gray-700 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Message received
              </h3>
              <p className="text-gray-400">
                We'll get back to you shortly. Very shortly.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
