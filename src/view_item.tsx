import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Heart } from "lucide-react";
import product1 from "./assets/joystickright.png";
import product2 from "./assets/joystickfront.png";
import product3 from "./assets/joystickleft.png";
import product4 from "./assets/mainimage.png";

const Viewitem: React.FC = () => {
  const product = {
    name: "Wireless Headphones",
    price: 120,
    stock: "In Stock",
    description:
      "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
    images: [product1, product2, product3, product4],
  };

  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);

  const handleQuantity = (type: "inc" | "dec") => {
    setQuantity((prev) =>
      type === "inc" ? prev + 1 : prev > 1 ? prev - 1 : 1
    );
  };

  // Adjust image size slightly based on selected size
  const sizeScale = selectedSize === "S" ? "scale-40" : selectedSize === "M" ? "scale-60" : selectedSize === "L" ? "scale-80" : "scale-100";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 px-6 md:px-20 py-12">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6 ml-2 md:ml-8">
        <Link to="/myaccount" className="hover:text-blue-600 font-medium">
          My Account
        </Link>{" "}
        / <span className="text-blue-600 font-semibold">{product.name}</span>
      </div>

    {/* Main Layout - Recommended */}
<div className="grid grid-cols-1 lg:grid-cols-[96px_1fr_360px] gap-6 bg-white shadow-lg rounded-2xl p-8 mx-auto max-w-7xl">
  {/* Left Thumbnails (fixed width ~96px) */}
  <div className="flex lg:flex-col gap-4 justify-start items-start">
    {product.images.map((img, idx) => (
      <div
        key={idx}
        onClick={() => setSelectedImage(img)}
        className={`p-2 bg-gray-100 rounded-xl cursor-pointer transition ${selectedImage === img ? "ring-2 ring-blue-400" : ""}`}
      >
        <img src={img} alt={`thumb-${idx}`} className="w-20 h-20 object-contain rounded-md" />
      </div>
    ))}
  </div>

  {/* Center - MAIN IMAGE (flexible center column) */}
  <div className="flex justify-center items-center mb-10">
    <div className="bg-gray-100 rounded-2xl p-6 w-full h-[430px] flex justify-center items-center shadow-md transition-all duration-300 hover:shadow-lg">
     <img
  src={selectedImage}
  alt="Selected Product"
  className={`object-contain max-w-[92%] max-h-[92%] rounded-xl transition-transform duration-300 ${sizeScale} hover:scale-105`}
  style={{
    filter:
      selectedColor === "red"
        ? "hue-rotate(190deg) saturate(2)"
        : selectedColor === "blue"
        ? "hue-rotate(0deg) saturate(2)"
        : selectedColor === "green"
        ? "hue-rotate(180deg) saturate(1)"
        : selectedColor === "black"
        ? "grayscale(1) brightness(0.4)"
        : "none",
    transition: "filter 0.4s ease",
  }}
/>
    
 
    </div>
  </div>
      

        {/* Right: Product Info */}
        <div className="space-y-5 mb-8">
          <h1 className="text-3xl font-semibold">{product.name}</h1>

          <div className="flex items-center gap-3">
            <div className="flex text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="currentColor" />
              ))}
            </div>
            <span className="text-green-600 font-medium">{product.stock}</span>
          </div>

          <p className="text-3xl font-bold text-blue-700">${product.price}</p>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          <hr className="my-4" />
<div className="flex gap-3">
  {["red", "blue", "green", "black"].map((color) => (
    <button
      key={color}
      onClick={() => setSelectedColor(color)}
      className={`w-8 h-8 rounded-full border-2 transition ${
        selectedColor === color ? "ring-2 ring-blue-500" : "border-gray-300"
      }`}
      style={{ backgroundColor: color }}
    />
  ))}
</div>

          {/* Size */}
          <div>
            <p className="font-medium mb-2">Size:</p>
            <div className="flex gap-3">
              {["S", "M", "L", "XL"].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-1 border rounded-md text-sm transition ${
                    selectedSize === size
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity + Buttons */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => handleQuantity("dec")}
                className="px-3 py-1 text-lg hover:bg-gray-100"
              >
                −
              </button>
              <span className="px-4">{quantity}</span>
              <button
                onClick={() => handleQuantity("inc")}
                className="px-3 py-1 text-lg hover:bg-gray-100"
              >
                +
              </button>
            </div>

            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
              Buy Now
            </button>

            <button
              onClick={() => setFavorite(!favorite)}
              className={`p-2 rounded-md ${
                favorite ? "bg-red-100 text-red-600" : "bg-gray-100"
              }`}
            >
              <Heart
                size={22}
                fill={favorite ? "red" : "none"}
                className="transition"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Viewitem;
