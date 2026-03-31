import React, { useEffect, Suspense, useTransition } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

// Lazy loading components
const SideMenu = React.lazy(() => import('./components/sidemenu'));
const Flash_sales = React.lazy(() => import('./components/flash_sales'));
const BrowseByCategory = React.lazy(() => import('./components/search_cartegories'));
const Bestselling = React.lazy(() => import('./components/best_selling_prod'));
const Our_products = React.lazy(() => import('./components/our_products'));
const New_arrival = React.lazy(() => import('./components/new_arrival'));

import frame_600 from './assets/frame_600.png';

// 1. FIXED: Explicitly type the variants as 'Variants' to solve the 'ease' error
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: "easeOut" // TypeScript now knows this is a valid Easing string
    } 
  }
};

function Home() {
  // 2. FIXED: Using isPending to provide visual feedback during transitions
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      if (window.location.hash) {
        const id = window.location.hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth" });
          }, 150);
        }
      }
    });
  }, []);

  return (
    <div className='m-0 p-0 overflow-x-hidden bg-white selection:bg-black selection:text-white'>
      
      {/* 3. OPTIMIZATION: Use isPending for a global loading line (Superior UX) */}
      {isPending && (
        <div className="fixed top-0 left-0 h-1 bg-red-600 z-9999 animate-pulse w-full" />
      )}

      <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100" />}>
        <SideMenu />
      </Suspense>

      <div className="space-y-10 md:space-y-20">
        
        <motion.div 
          id="flash-sales"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <Suspense fallback={<div className="h-64 bg-gray-50" />}>
            <Flash_sales />
          </Suspense>
        </motion.div>

        <motion.div 
          id="search_cartegories"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <Suspense fallback={null}>
            <BrowseByCategory />
          </Suspense>
        </motion.div>

        <motion.div 
          id="best-selling"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <Suspense fallback={null}>
            <Bestselling />
          </Suspense>
        </motion.div>

        {/* PROMO BANNER */}
        <motion.div 
          className="w-full flex justify-center items-center px-4 sm:px-10 md:px-16"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="relative group overflow-hidden w-full max-w-7xl flex justify-center  ]">
            <img
              src={frame_600}
              alt="Exclusive Promotion"
              loading="lazy" 
              decoding="async"
              className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <Suspense fallback={null}>
            <Our_products />
          </Suspense>
        </motion.div>
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <Suspense fallback={null}>
            <New_arrival />
          </Suspense>
        </motion.div>
        
        <div className="pb-10 md:pb-20"></div>
      </div>
    </div>
  );
}

export default Home;