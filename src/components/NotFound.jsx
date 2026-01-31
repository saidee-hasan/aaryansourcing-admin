import React from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { Link } from "react-router-dom";

const Page404 = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00261C] to-[#00543A] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#ffffff10] rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#ffffff05] rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 boxShadow px-10 w-full max-w-4xl flex items-center flex-col justify-center py-20 rounded-3xl bg-[#00543A] border-2 border-[#ffffff20] transform transition-all duration-500 hover:border-[#ffffff30]">
        {/* Floating illustration */}
        <img 
          src="https://i.ibb.co/LvLq6d3/Group-29.png" 
          alt="404 illustration"
          className="w-full lg:w-[500px] transform hover:-translate-y-2 transition-all duration-300 animate-float"
          style={{ animation: 'float 6s ease-in-out infinite' }}
        />

        {/* Glitch text effect */}
        <div className="relative mt-8 group">
          <p className="text-[#fff] text-2xl lg:text-3xl text-center font-medium opacity-0 animate-fadeInUp animate-delay-1000">
            Oops! You've discovered uncharted territory
          </p>
          <div className="absolute inset-0 flex items-center justify-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-[#ff4444] text-4xl absolute -left-4 animate-glitch">404</span>
            <span className="text-[#44ff88] text-4xl absolute -right-4 animate-glitch delay-100">404</span>
          </div>
        </div>

        {/* Animated button */}
        <Link to={'/'} className="mt-8 group">
          <button className="py-4 px-8 sm:px-10 rounded-full bg-white/90 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3 relative overflow-hidden">
            <span className="absolute inset-0 bg-gradient-to-r from-[#44ff8810] to-[#ff444410] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <FaArrowLeftLong className="transform group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-semibold tracking-wide">Back to Safety</span>
          </button>
        </Link>

        {/* Additional decorative elements */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-3 bg-[#ffffff20] blur-md rounded-full animate-pulse"></div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }

        @keyframes glitch {
          0% { transform: translate(0); opacity: 0.8; }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); opacity: 0; }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-glitch {
          animation: glitch 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }

        .delay-100 {
          animation-delay: 100ms;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-float, .animate-glitch, .animate-pulse {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Page404;