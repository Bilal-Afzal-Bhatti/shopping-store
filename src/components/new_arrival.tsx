import playstation from "../assets/playstation.png";
import speaker from "../assets/speaker.png";
import women_collection from "../assets/women_collection.png";
import gucci_perfume from "../assets/gucci_perfume.png";
import { Link } from "react-router-dom";

function New_arrival() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-10 mt-20 mb-20">
      {/* 🔴 Label */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-5 h-10 bg-[#DB4444] rounded-sm"></div>
        <span className="text-[#DB4444] font-bold text-sm uppercase tracking-wider">Featured</span>
      </div>

      {/* 🏷️ Section Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <h2 className="text-2xl sm:text-4xl font-bold text-black tracking-tight">
          New Arrival
        </h2>
      </div>

      {/* 🖼️ Images Grid */}
      {/* Reduced height from 700px to 600px for a tighter look */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full h-full">
        
        {/* 🎮 Left Side - PlayStation */}
        <div className="relative group bg-black rounded-md overflow-hidden h-[350px] sm:h-[450px] md:h-[600px]">
          <img
            src={playstation}
            alt="PlayStation 5"
            className="w-full h-full object-contain md:object-cover mt-10 md:mt-0 transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full bg-linear-to-t from-black/80 to-transparent">
           
            <Link to="/shop" className="text-white font-medium underline underline-offset-8 hover:text-gray-300 transition-colors">
           
            </Link>
          </div>
        </div>

        {/* 👗 Right Side Container */}
        <div className="flex flex-col gap-6">
          
          {/* Top: Women Collection */}
          <div className="relative group bg-[#0D0D0D] rounded-md overflow-hidden h-[250px] md:h-72">
            <img
              src={women_collection}
              alt="Women's Collection"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 p-6 w-full bg-linear-to-t from-black/80 to-transparent">
             
              <Link to="/shop" className="text-white font-medium underline underline-offset-8 hover:text-gray-300 transition-colors">
              
              </Link>
            </div>
          </div>

          {/* Bottom Row: Speaker + Perfume */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
            {/* Speaker */}
            <div className="relative group bg-[#0D0D0D] rounded-md overflow-hidden h-[250px] md:h-72 flex items-center justify-center">
              <img
                src={speaker}
                alt="Speakers"
                className="w-3/4 h-3/4 object-contain transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute bottom-0 left-0 p-6 w-full bg-linear-to-t from-black/60 to-transparent">
              
                <Link to="/shop" className="text-white text-sm font-medium underline underline-offset-4 hover:text-gray-300 transition-colors">
                
                </Link>
              </div>
            </div>

            {/* Perfume */}
            <div className="relative group bg-[#0D0D0D] rounded-md overflow-hidden h-[250px] md:h-72 flex items-center justify-center">
              <img
                src={gucci_perfume}
                alt="Perfume"
                className="w-3/4 h-3/4 object-contain transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute bottom-0 left-0 p-6 w-full bg-linear-to-t from-black/60 to-transparent">
                <h3 className="text-white text-lg font-bold mb-1">Perfume</h3>
                <p className="text-[#FAFAFA] text-[10px] mb-3">GUCCI INTENSE TUDUD</p>
                <Link to="/shop" className="text-white text-sm font-medium underline underline-offset-4 hover:text-gray-300 transition-colors">
                
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default New_arrival;