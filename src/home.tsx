import SideMenu from './components/sidemenu'
import Flash_sales from './components/flash_sales'
import BrowseByCategory from './components/search_cartegories'
import Bestselling from './components/best_selling_prod'
import Our_products from './components/our_products'
import frame_600 from './assets/frame_600.png'
import New_arrival from './components/new_arrival'


function Home() {
  return (
    <div className='m-0 p-0'>

      <SideMenu />
      <Flash_sales />
      <BrowseByCategory />
      <Bestselling />
      <div className="relative group flex justify-center items-center bg-white ml-1 w-full mt-36 mr-0 sm:-ml-10 md:mr-20 lg:mr-16">
        <img
          src={frame_600} // use imported variable
          alt="frame_600"
          className="w-full max-w-[350px] sm:max-w-[200px] md:max-w-[800px] lg:max-w-[1200px] h-auto sm:h-[250px] md:h-[400px] lg:h-[650px] cursor-pointer object-contain transition-transform duration-300 group-hover:scale-90 filter brightness-105 contrast-95"
        />
      </div>



      <Our_products />
      <New_arrival />



    </div>



  )
}

export default Home
