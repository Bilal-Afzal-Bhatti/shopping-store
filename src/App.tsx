import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Signup from "./signup";
import Home from "./home";
import Login from "./login";
// inside <Routes>
import Tophead from "./components/tophead";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import ScrollToTop from './components/scrolltop'
import About from "./about";
import Contact from "./contact";
import MyAccount from "./myaccount"
import Cart from "./cart"
import Checkout from "./check_out"
import Viewitem from "./view_item";
import PaymentSuccess from "./paymentsuccess";
import OrderTracking from "./orderTracking";
import MyOrders from "./myOrder";
import OAuthLogin from "./OAuthLogin";
import Wishlist from "./wishlist";

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      {/* Global header shown on all pages */}
    
      <Tophead />
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/myaccount" element={<MyAccount />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/check_out" element={<Checkout />} />
        {/* <Route path="/view_item/:id" element={<Viewitem />} /> */}
        <Route path="/product/:slug" element={<Viewitem />} />
        <Route path="/success" element={<PaymentSuccess />} />
       
        <Route path="/order/tracking" element={<OrderTracking />} />
         {/* <Route path="/orderTracking/:id" element ={<OrderTracking/>}/> */}
        <Route path="/myOrder" element ={<MyOrders/>}/>
        <Route path="/OAuthLogin" element={<OAuthLogin/>}/>
        <Route path="/wishlist" element={<Wishlist/>}/> 
      </Routes>
      <ScrollToTop />
      <Footer />
    </Router >
  );
}
