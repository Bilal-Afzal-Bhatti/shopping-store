import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import vector from "../assets/image.png";

function SideMenu() {
  // Closed by default (null)
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const menuItems = [
    { label: "Woman’s Fashion", options: ["Dresses", "Shoes", "Bags", "Accessories"] },
    { label: "Men's Fashion", options: ["Shirts", "Jeans", "Jackets", "Shoes"] },
    { label: "Electronics" },
    { label: "Home & Life Style" },
    { label: "Medicine" },
    { label: "Sports & Outdoor" },
    { label: "Baby’s & Toys" },
    { label: "Groceries & Pets" },
    { label: "Health & Beauty" },
  ];

  const toggleDropdown = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center lg:items-start pt-10 px-4 sm:px-10 overflow-hidden">
      
      {/* 🧭 Side Menu Container */}
      <div className="relative flex flex-col items-center lg:items-start w-full lg:w-60 shrink-0">
        <ul className="flex flex-col gap-4 w-full pr-0 lg:pr-10 pb-8 lg:pb-0">
          {menuItems.map((item, index) => (
            <li key={index} className="text-base text-black cursor-pointer group w-full">
              {/* Change: justify-start and gap-2 puts the arrow beside the text */}
              <div
                className="flex justify-start items-center gap-2 hover:text-[#DB4444] transition-colors"
                onClick={() => index < 2 && toggleDropdown(index)}
              >
                <span className="whitespace-nowrap font-medium">{item.label}</span>
                {index < 2 && (
                  <ChevronRight
                    size={16}
                    className={`transition-transform duration-300 ${
                      openIndex === index ? "rotate-90 text-[#DB4444]" : "text-black"
                    }`}
                  />
                )}
              </div>

              <AnimatePresence>
                {index < 2 && openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <ul className="ml-4 mt-2 text-sm text-gray-600 flex flex-col gap-3 border-l-2 border-gray-100 pl-4 py-1">
                      {item.options?.map((opt, i) => (
                        <li key={i} className="hover:text-[#DB4444] transition cursor-pointer">
                          {opt}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>

        {/* 📏 Vertical line */}
        <div className="absolute right-0 top-0 h-full w-px bg-gray-200 lg:h-[calc(100%+40px)]"></div>
      </div>

      {/* 📷 Hero Image Area - Perfectly Centered on Mobile */}
      <div className="w-full lg:flex-1 lg:pl-10 flex justify-center items-center mt-6 lg:mt-0">
        <div className="w-full max-w-[892px] bg-black flex items-center justify-center overflow-hidden">
           <img
            src={vector}
            alt="Hero Promotion"
            className="w-full h-auto block object-contain transition-all duration-500 hover:scale-105"
          />
        </div>
      </div>
      
    </div>
  );
}

export default SideMenu;