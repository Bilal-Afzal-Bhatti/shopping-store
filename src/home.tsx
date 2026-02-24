import SideMenu from './components/sidemenu'
import Flash_sales from './components/flash_sales'
import BrowseByCategory from './components/search_cartegories'
import Bestselling from './components/best_selling_prod'
import Our_products from './components/our_products'
import frame_600 from './assets/frame_600.png'
import New_arrival from './components/new_arrival'

function Home() {
  return (
    // Changed to overflow-x-hidden to prevent accidental horizontal scroll
    <div className='m-0 p-0 overflow-x-hidden bg-white'>

      {/* Hero Section */}
      <SideMenu />

      {/* Sections Wrapper to maintain consistent padding */}
      <div className="space-y-10 md:space-y-20">
        
        <Flash_sales />
        
        <BrowseByCategory />
        
        <Bestselling />

        {/* 🖼️ Big Promo Banner Section */}
        <div className="w-full flex justify-center items-center px-4 sm:px-10 md:px-16">
          <div className="relative group overflow-hidden w-full max-w-7xl flex justify-center">
            <img
              src={frame_600}
              alt="Promotion Banner"
              className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

        <Our_products />
        
        <New_arrival />
        
        {/* Added a little bottom padding for cleaner finish */}
        <div className="pb-10 md:pb-20"></div>
      </div>
    </div>
  )
}

export default Home