import React from "react";

// Footer.jsx
// Responsive footer built with Tailwind CSS to match the provided screenshot

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-6 md:py-8">
          {/* Left: logo + title */}
          <div className="flex items-center gap-3">
            {/* circular logo with ST */}
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-blue-600 text-white font-semibold shadow-sm">
              <span className="text-sm">ST</span>
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-sm md:text-base font-semibold text-gray-800">shorTest</span>
              <span className="text-xs md:text-sm text-gray-500">Conversational Assessment Platform</span>
            </div>
          </div>

          {/* Right: copyright + links */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-sm text-gray-500">
            <div className="text-xs sm:text-sm">© 2024 shorTest. All rights reserved.</div>

            <div className="hidden sm:flex items-center gap-4 ml-4">
              <a href="#" className="text-xs sm:text-sm hover:underline">Privacy</a>
              <a href="#" className="text-xs sm:text-sm hover:underline">Terms</a>
              <a href="#" className="text-xs sm:text-sm hover:underline">Support</a>
            </div>

            {/* On extra-small screens show links stacked under text */}
            <div className="flex flex-row sm:hidden items-center gap-4">
              <a href="#" className="text-xs hover:underline">Privacy</a>
              <a href="#" className="text-xs hover:underline">Terms</a>
              <a href="#" className="text-xs hover:underline">Support</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
