import React from "react";

const Tophead: React.FC = () => {
  return (
  <header className="bg-black text-white py-2 px-4
                   w-full  sm:w-full
                   flex flex-col md:flex-row items-center justify-between
                   landscape:flex-row landscape:w-full landscape:justify-between landscape:px-8
                   md:px-10">
      {/* Left Text */}
      <h1 className="text-xs sm:text-sm font-medium text-center md:text-left leading-snug md:ml-16
                     landscape:text-sm landscape:ml-8">
        Summer Sale For All Swim Suits And Free Express Delivery -{" "}
        <span className="font-semibold">OFF 50%!</span>
        <span className="text-blue-300 underline cursor-pointer ml-2 hover:text-blue-400 transition-colors">
          SHOP NOW
        </span>
      </h1>

      {/* Language Selector */}
      <div className="mt-2 md:mt-0 md:mr-10 landscape:mt-0 landscape:mr-8">
        <select
          className="bg-black text-white border border-gray-600 text-xs sm:text-sm px-2 py-1 rounded cursor-pointer
                     focus:outline-none hover:border-blue-400 transition"
          defaultValue="en"
        >
          <option value="en">English</option>
          <option value="ur">Urdu</option>
          <option value="fr">French</option>
          <option value="es">Spanish</option>
        </select>
      </div>
    </header>
  );
};

export default Tophead;