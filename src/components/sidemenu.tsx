import { useState } from "react";
import { ChevronDown } from "lucide-react";
import vector from "../assets/image.png"; // Adjust path

function SideMenu() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const menuItems = [
    {
      label: "Woman’s Fashion",
      options: ["Dresses", "Shoes", "Bags", "Accessories"],
    },
    {
      label: "Men's Fashion",
      options: ["Shirts", "Jeans", "Jackets", "Shoes"],
    },
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
    <div className="  flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-start 
 w-98 lg:w-auto mb-0 ml-0 mx-auto mt-0 py-4">
      {/* 🧭 Side Menu + Vertical Line */}
      <div className="flex flex-row items-start justify-center lg:justify-start">
        {/* Menu List */}
        <ul className="flex flex-col gap-4 pr-6 lg:pr-10 lg:ml-20   mb-20   relative">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className="text-base text-black cursor-pointer pr-20 mr-0 sm:ml-6 -ml-17 whitespace-nowrap relative"
            >
              <div
                className="flex justify-between items-center hover:text-gray-700"
                onClick={() => index < 2 && toggleDropdown(index)}
              >
                <span>{item.label}</span>
                {index < 2 && (
                  <ChevronDown
                    size={18}
                    className={`text-gray-700 transform transition-transform duration-300 ${openIndex === index ? "rotate-180" : "rotate-0"
                      }`}
                  />
                )}
              </div>

              {/* 🔽 Dropdown for first two items */}
              {index < 2 && (
                <div
                  className={`transition-all duration-500 overflow-hidden ${openIndex === index ? "max-h-40 mt-2" : "max-h-0"
                    }`}
                >
                  <ul className="ml-4 text-sm text-gray-600 flex flex-col gap-2">
                    {item.options?.map((opt, i) => (
                      <li
                        key={i}
                        className="hover:text-black transition cursor-pointer"
                      >
                        {opt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}

          {/* ↑ Vertical line extended upward */}
          <div className="absolute left-full -top-3.5 md:mt-0 h-[calc(100%+53px)] w-px bg-gray-300"></div>
        </ul>
      </div>

      {/* 📷 Image (right side of line) */}
      <div className="-mt-10 w-full lg:w-auto  sm:ml-110 sm:-mt-102 ml-0 flex justify-center lg:block  overflow-hidden">
        <img
          src={vector}
          alt="Vector"
          className="w-full max-w-[330px] sm:max-w-[780px]  md:max-w-[320px] lg:max-w-[600px] xl:max-w-[900px] h-auto object-contain transition-all duration-300"
        />
      </div>

    </div>
  );
}

export default SideMenu;
