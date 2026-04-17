import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";

function New_arrival() {
  const { data: products = [], isLoading, isError } = useProducts({ category: 'new_arrival' });
  
  // Create safety fallbacks in case DB doesn't have 4 new arrivals yet
  const mainProduct = products[0];
  const topProduct = products[1];
  const bottomLeftProduct = products[2];
  const bottomRightProduct = products[3];

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

      {isError && (
        <div className="w-full text-center py-10 text-red-500 font-medium bg-red-50 rounded-md">
          Failed to load new arrivals. Please try again later.
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full h-[600px] animate-pulse">
          <div className="bg-gray-200 rounded-md h-full w-full"></div>
          <div className="flex flex-col gap-6 h-full">
            <div className="bg-gray-200 rounded-md h-1/2 w-full"></div>
            <div className="flex gap-6 h-1/2">
               <div className="bg-gray-200 rounded-md h-full w-1/2"></div>
               <div className="bg-gray-200 rounded-md h-full w-1/2"></div>
            </div>
          </div>
        </div>
      )}

      {/* 🖼️ Images Grid */}
      {!isLoading && !isError && products.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full h-full">
        
        {/* 🎮 Left Side - Main (Newest) */}
        {mainProduct ? (
          <div className="relative group bg-black rounded-md overflow-hidden h-[350px] sm:h-[450px] md:h-[600px]">
            <img
              src={mainProduct.image || 'https://via.placeholder.com/600'}
              alt={mainProduct.name}
              className="w-full h-full object-contain md:object-cover mt-10 md:mt-0 transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full bg-linear-to-t from-black/80 to-transparent">
              <h3 className="text-white text-2xl font-bold mb-2 truncate">{mainProduct.name}</h3>
              <p className="text-gray-300 text-sm mb-4 line-clamp-2">${mainProduct.price}</p>
              <Link to={`/view_item/${mainProduct._id}`} className="text-white font-medium underline underline-offset-8 hover:text-gray-300 transition-colors">
                 Shop Now
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 rounded-md flex items-center justify-center">No Product</div>
        )}

        {/* 👗 Right Side Container */}
        <div className="flex flex-col gap-6">
          
          {/* Top */}
          {topProduct ? (
            <div className="relative group bg-[#0D0D0D] rounded-md overflow-hidden h-[250px] md:h-72">
              <img
                src={topProduct.image || 'https://via.placeholder.com/400'}
                alt={topProduct.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 p-6 w-full bg-linear-to-t from-black/80 to-transparent">
                <h3 className="text-white text-xl font-bold mb-1 truncate">{topProduct.name}</h3>
                <p className="text-gray-300 text-sm mb-3">${topProduct.price}</p>
                <Link to={`/view_item/${topProduct._id}`} className="text-white font-medium underline underline-offset-8 hover:text-gray-300 transition-colors">
                  Shop Now
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-md h-72"></div>
          )}

          {/* Bottom Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
            {/* Bottom Left */}
            {bottomLeftProduct ? (
              <div className="relative group bg-[#0D0D0D] rounded-md overflow-hidden h-[250px] md:h-72 flex items-center justify-center">
                <img
                  src={bottomLeftProduct.image}
                  alt={bottomLeftProduct.name}
                  className="w-3/4 h-3/4 object-contain transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute bottom-0 left-0 p-6 w-full bg-linear-to-t from-black/60 to-transparent">
                  <h3 className="text-white text-lg font-bold mb-1 truncate">{bottomLeftProduct.name}</h3>
                  <Link to={`/view_item/${bottomLeftProduct._id}`} className="text-white text-sm font-medium underline underline-offset-4 hover:text-gray-300 transition-colors">
                    Shop Now
                  </Link>
                </div>
              </div>
            ) : (
               <div className="bg-gray-100 rounded-md h-72"></div>
            )}

            {/* Bottom Right */}
            {bottomRightProduct ? (
              <div className="relative group bg-[#0D0D0D] rounded-md overflow-hidden h-[250px] md:h-72 flex items-center justify-center">
                <img
                  src={bottomRightProduct.image}
                  alt={bottomRightProduct.name}
                  className="w-3/4 h-3/4 object-contain transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute bottom-0 left-0 p-6 w-full bg-linear-to-t from-black/60 to-transparent">
                  <h3 className="text-white text-lg font-bold mb-1 truncate">{bottomRightProduct.name}</h3>
                  <p className="text-[#FAFAFA] text-[10px] mb-3">${bottomRightProduct.price}</p>
                  <Link to={`/view_item/${bottomRightProduct._id}`} className="text-white text-sm font-medium underline underline-offset-4 hover:text-gray-300 transition-colors">
                    Shop Now
                  </Link>
                </div>
              </div>
            ) : (
               <div className="bg-gray-100 rounded-md h-72"></div>
            )}
          </div>

        </div>
      </div>
      )}
      
      {!isLoading && !isError && products.length === 0 && (
         <div className="w-full text-center py-10 mt-10 text-gray-500 font-medium">
            No new arrivals found.
         </div>
      )}
    </div>
  );
}

export default New_arrival;