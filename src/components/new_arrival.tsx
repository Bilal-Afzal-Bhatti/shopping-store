// src/components/new_arrival.tsx
import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import type { Product } from "../api/productsApi";

function New_arrival() {
  // ✅ matches exact DB category "New Arrival"
  const { data, isLoading, isError } = useProducts({ category: 'New Arrival' });
  const products: Product[] = data?.products ?? [];

  const mainProduct        = products[0];
  const topProduct         = products[1];
  const bottomLeftProduct  = products[2];
  const bottomRightProduct = products[3];

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-10 mt-20 mb-20">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-5 h-10 bg-gray-200 rounded-sm animate-pulse" />
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-8 w-48 bg-gray-200 rounded mb-8 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[600px] animate-pulse">
        <div className="bg-gray-200 rounded-md h-full" />
        <div className="flex flex-col gap-6 h-full">
          <div className="bg-gray-200 rounded-md h-1/2" />
          <div className="flex gap-6 h-1/2">
            <div className="bg-gray-200 rounded-md h-full w-1/2" />
            <div className="bg-gray-200 rounded-md h-full w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-10 mt-20 mb-20">

      {/* Label */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-5 h-10 bg-[#DB4444] rounded-sm" />
        <span className="text-[#DB4444] font-bold text-sm uppercase tracking-wider">Featured</span>
      </div>

      {/* Header */}
      <h2 className="text-2xl sm:text-4xl font-bold text-black tracking-tight mb-8">
        New Arrival
      </h2>

      {/* Error */}
      {isError && (
        <div className="w-full text-center py-10 text-red-500 font-medium bg-red-50 rounded-md">
          Failed to load new arrivals. Please try again later.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && products.length === 0 && (
        <div className="w-full text-center py-10 text-gray-500 font-medium">
          No new arrivals found.
        </div>
      )}

      {/* Grid */}
      {!isLoading && !isError && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

          {/* ── Left: Main product ────────────────────────────────────── */}
          {mainProduct ? (
            <div className="relative group bg-black rounded-xl overflow-hidden h-[350px] sm:h-[450px] md:h-[600px]">
              <img
                src={mainProduct.image || 'https://placehold.co/600x600?text=No+Image'}
                alt={mainProduct.name}
                className="w-full h-full object-contain md:object-cover mt-10 md:mt-0 transition-transform duration-500 group-hover:scale-105"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x600?text=No+Image'; }}
              />
              {/* Discount badge */}
              {mainProduct.discount && mainProduct.discount !== 'No Discount' && (
                <span className="absolute top-4 left-4 bg-[#DB4444] text-white text-xs font-bold px-2.5 py-1 rounded-md z-10">
                  -{mainProduct.discount.match(/\d+/)?.[0]}%
                </span>
              )}
              <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full bg-linear-to-t from-black/80 to-transparent">
                <h3 className="text-white text-2xl font-bold mb-1 truncate">{mainProduct.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[#DB4444] font-bold">${mainProduct.price.toFixed(2)}</span>
                  {mainProduct.originalPrice && (
                    <span className="text-gray-400 line-through text-sm">${mainProduct.originalPrice.toFixed(2)}</span>
                  )}
                </div>
                <Link
                  to={`/view_item/${mainProduct._id}`}
                  className="text-white font-medium underline underline-offset-8 hover:text-gray-300 transition-colors"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-xl flex items-center justify-center h-[600px] text-gray-400">
              No Product
            </div>
          )}

          {/* ── Right: 3 products ─────────────────────────────────────── */}
          <div className="flex flex-col gap-6">

            {/* Top */}
            {topProduct ? (
              <div className="relative group bg-[#0D0D0D] rounded-xl overflow-hidden h-[250px] md:h-72">
                <img
                  src={topProduct.image || 'https://placehold.co/400x300?text=No+Image'}
                  alt={topProduct.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=No+Image'; }}
                />
                {topProduct.discount && topProduct.discount !== 'No Discount' && (
                  <span className="absolute top-3 left-3 bg-[#DB4444] text-white text-xs font-bold px-2 py-0.5 rounded-md z-10">
                    -{topProduct.discount.match(/\d+/)?.[0]}%
                  </span>
                )}
                <div className="absolute bottom-0 left-0 p-6 w-full bg-linear-to-t from-black/80 to-transparent">
                  <h3 className="text-white text-xl font-bold mb-1 truncate">{topProduct.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[#DB4444] font-bold text-sm">${topProduct.price.toFixed(2)}</span>
                    {topProduct.originalPrice && (
                      <span className="text-gray-400 line-through text-xs">${topProduct.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                  <Link
                    to={`/view_item/${topProduct._id}`}
                    className="text-white font-medium underline underline-offset-8 hover:text-gray-300 transition-colors"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-xl h-72" />
            )}

            {/* Bottom Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Bottom Left */}
              {bottomLeftProduct ? (
                <div className="relative group bg-[#0D0D0D] rounded-xl overflow-hidden h-[250px] md:h-72 flex items-center justify-center">
                  <img
                    src={bottomLeftProduct.image}
                    alt={bottomLeftProduct.name}
                    className="w-3/4 h-3/4 object-contain transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x300?text=No+Image'; }}
                  />
                  {bottomLeftProduct.discount && bottomLeftProduct.discount !== 'No Discount' && (
                    <span className="absolute top-3 left-3 bg-[#DB4444] text-white text-xs font-bold px-2 py-0.5 rounded-md z-10">
                      -{bottomLeftProduct.discount.match(/\d+/)?.[0]}%
                    </span>
                  )}
                  <div className="absolute bottom-0 left-0 p-4 w-full bg-linear-to-t from-black/70 to-transparent">
                    <h3 className="text-white text-base font-bold mb-1 truncate">{bottomLeftProduct.name}</h3>
                    <span className="text-[#DB4444] font-bold text-sm">${bottomLeftProduct.price.toFixed(2)}</span>
                    <Link
                      to={`/view_item/${bottomLeftProduct._id}`}
                      className="block text-white text-xs font-medium underline underline-offset-4 hover:text-gray-300 transition-colors mt-1"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-xl h-72" />
              )}

              {/* Bottom Right */}
              {bottomRightProduct ? (
                <div className="relative group bg-[#0D0D0D] rounded-xl overflow-hidden h-[250px] md:h-72 flex items-center justify-center">
                  <img
                    src={bottomRightProduct.image}
                    alt={bottomRightProduct.name}
                    className="w-3/4 h-3/4 object-contain transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x300?text=No+Image'; }}
                  />
                  {bottomRightProduct.discount && bottomRightProduct.discount !== 'No Discount' && (
                    <span className="absolute top-3 left-3 bg-[#DB4444] text-white text-xs font-bold px-2 py-0.5 rounded-md z-10">
                      -{bottomRightProduct.discount.match(/\d+/)?.[0]}%
                    </span>
                  )}
                  <div className="absolute bottom-0 left-0 p-4 w-full bg-linear-to-t from-black/70 to-transparent">
                    <h3 className="text-white text-base font-bold mb-1 truncate">{bottomRightProduct.name}</h3>
                    <span className="text-[#DB4444] font-bold text-sm">${bottomRightProduct.price.toFixed(2)}</span>
                    <Link
                      to={`/view_item/${bottomRightProduct._id}`}
                      className="block text-white text-xs font-medium underline underline-offset-4 hover:text-gray-300 transition-colors mt-1"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-xl h-72" />
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default New_arrival;



// import { toSlug } from '../utils/slug';

// // anywhere you navigate to product detail:
// navigate(`/product/${toSlug(product.name)}`, {
//   state: { productId: product._id }
// })

// // or as Link:
// <Link to={`/product/${toSlug(product.name)}`} state={{ productId: product._id }}>
//   Shop Now
// </Link>