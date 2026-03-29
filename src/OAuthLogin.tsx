import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { ShieldCheck, LayoutGrid, ArrowRight } from 'lucide-react';

const OAuthLogin: React.FC = () => {
  
  const handleSuccess = async (credentialResponse: any) => {
    console.log("Token Received:", credentialResponse.credential);
    try {
      // Logic for backend update will go here later
      // const res = await axios.post('.../api/auth/google', { token: credentialResponse.credential });
      alert("Login Success! Backend sync coming next.");
    } catch (err) {
      console.error("Auth Error", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
      >
        
        {/* Left Side: Branding/Visual (Hidden on Mobile) */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-black text-white relative overflow-hidden">
          <div className="z-10">
            <div className="flex items-center gap-2 mb-8">
              <LayoutGrid size={32} className="text-blue-400" />
              <span className="text-2xl font-black uppercase tracking-tighter">Vault.Store</span>
            </div>
            <h1 className="text-6xl font-black uppercase italic leading-none tracking-tighter">
              Access <br /> The <span className="text-blue-400">Limited</span> <br /> Drops.
            </h1>
          </div>
          
          <div className="z-10 flex items-center gap-4 bg-white/10 p-4 border border-white/20 backdrop-blur-md">
            <ShieldCheck className="text-green-400" size={24} />
            <p className="text-[10px] uppercase font-bold tracking-widest">
              Verified Secure OAuth 2.0 Connection
            </p>
          </div>

          {/* Decorative Background Element */}
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600 rounded-full blur-[100px] opacity-50" />
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black uppercase italic text-black leading-none">Identify Yourself</h2>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Enter the store ecosystem</p>
          </div>

          {/* Google Button Wrapper - Custom Styled to match theme */}
          <div className="space-y-6">
            <div className="relative group">
               <div className="absolute -inset-1 bg-blue-500 rounded-none opacity-25 group-hover:opacity-100 transition duration-200 blur"></div>
               <div className="relative flex justify-center bg-white border-2 border-black p-2">
                  <GoogleLogin 
                    onSuccess={handleSuccess} 
                    onError={() => console.log('Login Failed')}
                    useOneTap
                    shape="square"
                    width="100%"
                    theme="filled_black"
                    text="continue_with"
                  />
               </div>
            </div>

            <div className="flex items-center gap-4 my-8">
              <div className="h-0.5 bg-gray-100 grow" />
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Or Secure Link</span>
              <div className="h-0.5 bg-gray-100 grow" />
            </div>

            {/* Manual Email Placeholder (Optional/Visual) */}
            <div className="space-y-4">
               <input 
                 type="email" 
                 placeholder="STORE_ID@EMAIL.COM" 
                 className="w-full p-4 border-2 border-black font-black uppercase text-xs focus:bg-blue-50 outline-none transition-colors placeholder:text-gray-300"
               />
               <button className="w-full bg-black text-white p-4 font-black uppercase italic text-sm flex items-center justify-center gap-3 hover:bg-blue-600 transition-all active:translate-y-1">
                 Continue <ArrowRight size={18} />
               </button>
            </div>
          </div>

          <p className="mt-12 text-[9px] text-center text-gray-400 font-bold uppercase leading-relaxed">
            By logging in, you agree to our <span className="text-black underline cursor-pointer">Terms of Service</span> <br className="hidden sm:block" /> and the <span className="text-black underline cursor-pointer">Protocol Privacy Policy</span>.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default OAuthLogin;