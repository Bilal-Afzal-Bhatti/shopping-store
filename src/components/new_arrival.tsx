import playstation from "../assets/playstation.png";
import speaker from "../assets/speaker.png";
import women_collection from "../assets/women_collection.png";
import gucci_perfume from "../assets/gucci_perfume.png";

function New_arrival() {
  return (
    <div className="p-6 sm:p-8 md:p-10  bg-white mt-8 ml-2 sm:ml-4 md:ml-16">
      {/* 🔴 Label */}
      <div className="inline-block bg-red-500 text-white text-xs px-3 py-1 rounded-md mb-3">
        Featured
      </div>

      {/* 🏷️ Section Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold font-sans text-gray-900 tracking-wide">
          New Arrival
        </h2>
      </div>

      {/* 🖼️ Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* 🎮 Left Side - PlayStation */}
        <div className="relative w-full h-[300px] sm:h-[450px] md:h-[700px]">
          <img
            src={playstation}
            alt="PlayStation"
            className="w-full h-full object-cover rounded-xl hover:scale-95 transition-transform duration-300"
          />
        </div>

        {/* 👗 Right Side */}
        <div className="flex flex-col gap-6 w-full">
          {/* Women Collection */}
          <div className="relative w-full h-[200px] sm:h-[260px] md:h-[310px]">
            <img
              src={women_collection}
              alt="Women's Collection"
              className="w-full h-full object-cover rounded-xl hover:scale-95 transition-transform duration-300"
            />
          </div>

          {/* Speaker + Perfume row (desktop), stacked (mobile) */}
          <div className="flex flex-col sm:flex-row gap-6 w-full">
            {/* Speaker */}
            <div className="relative w-full sm:w-1/2 h-[220px] sm:h-[280px] md:h-[360px]">
              <img
                src={speaker}
                alt="Speaker"
                className="w-full h-full object-cover rounded-xl hover:scale-95 transition-transform duration-300"
              />
            </div>

            {/* Perfume */}
            <div className="relative w-full sm:w-1/2 h-[220px] sm:h-[280px] md:h-[360px]">
              <img
                src={gucci_perfume}
                alt="Perfume"
                className="w-full h-full object-cover rounded-xl hover:scale-95 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default New_arrival;

