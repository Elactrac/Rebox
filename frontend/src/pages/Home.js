import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  // Handle scroll for navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animate stats on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStatsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    const statsSection = document.getElementById('stats-section');
    if (statsSection) {
      observer.observe(statsSection);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f8f6]">
      <div className="flex h-full grow flex-col">
        {/* TopNavBar */}
        <header className={`sticky top-0 z-50 flex items-center justify-center border-b border-solid border-b-gray-200/50 backdrop-blur-sm px-4 transition-all duration-300 ${scrolled ? 'bg-white/95 shadow-md' : 'bg-[#f6f8f6]/80'}`}>
          <div className="flex items-center justify-between whitespace-nowrap w-full max-w-6xl px-4 py-3">
            <div className="flex items-center gap-4 text-gray-900">
              <div className="w-6 h-6 text-[#13ec13]">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z" fill="currentColor"></path>
                  <path clipRule="evenodd" d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236ZM4.95178 15.2312L21.4543 41.6973C22.6288 43.5809 25.3712 43.5809 26.5457 41.6973L43.0534 15.223C43.0709 15.1948 43.0878 15.1662 43.104 15.1371L41.3563 14.1648C43.104 15.1371 43.1038 15.1374 43.104 15.1371L43.1051 15.135L43.1065 15.1325L43.1101 15.1261L43.1199 15.1082C43.1276 15.094 43.1377 15.0754 43.1497 15.0527C43.1738 15.0075 43.2062 14.9455 43.244 14.8701C43.319 14.7208 43.4196 14.511 43.5217 14.2683C43.6901 13.8679 44 13.0689 44 12.2609C44 10.5573 43.003 9.22254 41.8558 8.2791C40.6947 7.32427 39.1354 6.55361 37.385 5.94477C33.8654 4.72057 29.133 4 24 4C18.867 4 14.1346 4.72057 10.615 5.94478C8.86463 6.55361 7.30529 7.32428 6.14419 8.27911C4.99695 9.22255 3.99999 10.5573 3.99999 12.2609C3.99999 13.1275 4.29264 13.9078 4.49321 14.3607C4.60375 14.6102 4.71348 14.8196 4.79687 14.9689C4.83898 15.0444 4.87547 15.1065 4.9035 15.1529C4.91754 15.1762 4.92954 15.1957 4.93916 15.2111L4.94662 15.223L4.95178 15.2312ZM35.9868 18.996L24 38.22L12.0131 18.996C12.4661 19.1391 12.9179 19.2658 13.3617 19.3718C16.4281 20.1039 20.0901 20.5217 24 20.5217C27.9099 20.5217 31.5719 20.1039 34.6383 19.3718C35.082 19.2658 35.5339 19.1391 35.9868 18.996Z" fill="currentColor" fillRule="evenodd"></path>
                </svg>
              </div>
              <h2 className="text-gray-900 text-lg font-bold leading-tight tracking-[-0.015em]">ReBox</h2>
            </div>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden flex items-center justify-center w-10 h-10 text-gray-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-1 justify-end gap-8">
              <div className="flex items-center gap-9">
                <a className="text-gray-800 text-sm font-medium leading-normal hover:text-[#13ec13] transition-colors" href="#how-it-works">How it Works</a>
                <a className="text-gray-800 text-sm font-medium leading-normal hover:text-[#13ec13] transition-colors" href="#benefits">Benefits</a>
                <a className="text-gray-800 text-sm font-medium leading-normal hover:text-[#13ec13] transition-colors" href="#about">About Us</a>
              </div>
              <div className="flex gap-2">
                {user ? (
                  <Link to="/dashboard" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#13ec13] text-gray-900 text-sm font-bold leading-normal tracking-[0.015em]">
                    <span className="truncate">Dashboard</span>
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#13ec13] text-gray-900 text-sm font-bold leading-normal tracking-[0.015em]">
                      <span className="truncate">List Packaging</span>
                    </Link>
                    <Link to="/marketplace" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-200 text-gray-900 text-sm font-bold leading-normal tracking-[0.015em]">
                      <span className="truncate">Find Packaging</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-[#f6f8f6] border-b border-gray-200 shadow-lg">
              <div className="flex flex-col p-4 gap-4">
                <a 
                  className="text-gray-800 text-sm font-medium leading-normal hover:text-[#13ec13] transition-colors py-2" 
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                >How it Works</a>
                <a 
                  className="text-gray-800 text-sm font-medium leading-normal hover:text-[#13ec13] transition-colors py-2" 
                  href="#benefits"
                  onClick={() => setMobileMenuOpen(false)}
                >Benefits</a>
                <a 
                  className="text-gray-800 text-sm font-medium leading-normal hover:text-[#13ec13] transition-colors py-2" 
                  href="#about"
                  onClick={() => setMobileMenuOpen(false)}
                >About Us</a>
                <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
                  {user ? (
                    <Link 
                      to="/dashboard" 
                      className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#13ec13] text-gray-900 text-sm font-bold leading-normal tracking-[0.015em]"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="truncate">Dashboard</span>
                    </Link>
                  ) : (
                    <>
                      <Link 
                        to="/register" 
                        className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#13ec13] text-gray-900 text-sm font-bold leading-normal tracking-[0.015em]"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="truncate">List Packaging</span>
                      </Link>
                      <Link 
                        to="/marketplace" 
                        className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-200 text-gray-900 text-sm font-bold leading-normal tracking-[0.015em]"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="truncate">Find Packaging</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </header>

        <main className="flex-1">
          {/* HeroSection */}
          <section className="flex flex-1 justify-center py-5 md:py-10 px-4">
            <div className="flex flex-col w-full max-w-6xl flex-1">
              <div>
                <div>
                  <div 
                    className="relative flex min-h-[480px] md:min-h-[600px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-start justify-end px-4 pb-10 md:px-10 md:gap-8 overflow-hidden group"
                    style={{
                      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuDUsN7x1L2jgL3seZSQSDSYBeR5b8w1Xy8yVJYx-uBE-1wNjWfzVrJteSwJgTEy6A31ikInCuKFkCPWdsmb2BsAxIpv12FZmGT7Xr7VxZhhGMX4lWjWj79w6SNQ1N3JEtOp7fK7ryDLmzXzv12us42mz2BBDMslUpCfBVIpuXgrn_3nikxHq7f9WRv1780aRbq_vBI-WEE69NJ6OuOq0cj0nLW_A2dQkJ7VRp2FykXBmX6qpBq0jI3CO-TnbrthHTlFail6plOD0q-0")`
                    }}
                  >
                    {/* Animated background overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    
                    {/* Floating icons animation */}
                    <div className="absolute top-10 right-10 text-white/20 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
                      <span className="material-symbols-outlined text-6xl">package_2</span>
                    </div>
                    <div className="absolute top-32 right-32 text-white/20 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>
                      <span className="material-symbols-outlined text-5xl">recycling</span>
                    </div>
                    <div className="absolute top-20 left-20 text-white/20 animate-bounce hidden md:block" style={{ animationDelay: '2s', animationDuration: '3.5s' }}>
                      <span className="material-symbols-outlined text-5xl">eco</span>
                    </div>

                    <div className="flex flex-col gap-2 text-left z-10 animate-fade-in-up">
                      <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl lg:text-6xl transform transition-all duration-500 hover:scale-105">
                        Give Your Packaging a Second Life
                      </h1>
                      <h2 className="text-white text-sm font-normal leading-normal md:text-base lg:text-lg max-w-2xl opacity-95">
                        Connect with local businesses to recycle and reuse your used packaging, earn rewards, and help the planet.
                      </h2>
                    </div>
                    <div className="flex-wrap gap-3 flex z-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                      <Link 
                        to={user ? "/packages/new" : "/register"} 
                        className="group/btn flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 md:h-12 md:px-5 bg-[#13ec13] text-gray-900 text-sm font-bold leading-normal tracking-[0.015em] md:text-base transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-[#10d010] active:scale-95"
                      >
                        <span className="truncate group-hover/btn:translate-x-[-2px] transition-transform duration-300">List Your Used Boxes</span>
                        <span className="material-symbols-outlined ml-1 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all duration-300 text-lg">arrow_forward</span>
                      </Link>
                      <Link 
                        to={user ? "/marketplace" : "/login"} 
                        className="group/btn flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 md:h-12 md:px-5 bg-gray-100 text-gray-900 text-sm font-bold leading-normal tracking-[0.015em] md:text-base transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-white active:scale-95"
                      >
                        <span className="truncate group-hover/btn:translate-x-[-2px] transition-transform duration-300">Source Sustainable Packaging</span>
                        <span className="material-symbols-outlined ml-1 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all duration-300 text-lg">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FeatureSection - How It Works */}
          <section id="how-it-works" className="flex flex-1 justify-center py-10 md:py-16 px-4">
            <div className="flex flex-col w-full max-w-6xl flex-1">
              <div className="flex flex-col gap-10 px-4 py-10">
                <div className="flex flex-col gap-4 text-center items-center">
                  <h2 className="text-gray-500 text-sm font-bold uppercase tracking-widest">HOW IT WORKS</h2>
                  <h1 className="text-gray-900 tracking-light text-[32px] font-bold leading-tight md:text-4xl md:font-black md:tracking-[-0.033em] max-w-[720px]">A Simple Process for a Greener Planet</h1>
                  <p className="text-gray-700 text-base font-normal leading-normal max-w-[720px]">Getting started with ReBox is easy. Follow these three simple steps to join the circular economy and make a positive impact.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-0">
                  <div className="group flex flex-1 gap-4 rounded-xl border border-gray-200 bg-white p-6 flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-[#13ec13] cursor-pointer">
                    <div className="text-[#13ec13] transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                      <span className="material-symbols-outlined text-4xl">package_2</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-gray-900 text-base font-bold leading-tight group-hover:text-[#13ec13] transition-colors">1. List Your Boxes</h2>
                      <p className="text-gray-600 text-sm font-normal leading-normal">Quickly post details about your available, clean packaging materials on our platform.</p>
                    </div>
                  </div>
                  <div className="group flex flex-1 gap-4 rounded-xl border border-gray-200 bg-white p-6 flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-[#13ec13] cursor-pointer" style={{ animationDelay: '0.1s' }}>
                    <div className="text-[#13ec13] transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                      <span className="material-symbols-outlined text-4xl">group</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-gray-900 text-base font-bold leading-tight group-hover:text-[#13ec13] transition-colors">2. Get Matched</h2>
                      <p className="text-gray-600 text-sm font-normal leading-normal">Our system connects you with local businesses and individuals who need your specific types of boxes.</p>
                    </div>
                  </div>
                  <div className="group flex flex-1 gap-4 rounded-xl border border-gray-200 bg-white p-6 flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-[#13ec13] cursor-pointer" style={{ animationDelay: '0.2s' }}>
                    <div className="text-[#13ec13] transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                      <span className="material-symbols-outlined text-4xl">recycling</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-gray-900 text-base font-bold leading-tight group-hover:text-[#13ec13] transition-colors">3. Earn &amp; Recycle</h2>
                      <p className="text-gray-600 text-sm font-normal leading-normal">Arrange a pickup or drop-off, earn rewards for your contribution, and track your environmental impact.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FeatureSection - Benefits */}
          <section id="benefits" className="flex flex-1 justify-center py-10 md:py-16 px-4 bg-white">
            <div className="flex flex-col w-full max-w-6xl flex-1">
              <div className="flex flex-col gap-10 px-4 py-10">
                <div className="flex flex-col gap-4 text-center items-center">
                  <h2 className="text-gray-500 text-sm font-bold uppercase tracking-widest">BENEFITS</h2>
                  <h1 className="text-gray-900 tracking-light text-[32px] font-bold leading-tight md:text-4xl md:font-black md:tracking-[-0.033em] max-w-[720px]">Join the Circular Economy</h1>
                  <p className="text-gray-700 text-base font-normal leading-normal max-w-[720px]">Whether you're clearing out clutter or sourcing supplies, ReBox makes sustainability simple and rewarding.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="group flex flex-col gap-3 pb-3 cursor-pointer">
                    <div 
                      className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl overflow-hidden"
                      style={{backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDLOuxbvr-cNxG9fhRGgOIY7gtYa8aJuvWTDDmPSmrwq7k7HZYdJc1a6PyjNnB5V1klFCE5xLobB0ouO-mmBcyoCt7xPNO6sH6OES_pehEtKdDzjSAoN9_68YZt8CmnJHmS1hX3Iia7JX7_rnip_0CK1QLKj_CegXinN6GZoFSzjMcRsEifWJgP3rkXRe8tMmdy1J8eAMepMjEDnKeo2HogZ8nGwMgsBCgPnAUwgur3lg5kmS5cK_Q5gzuEnZTUgN2I4ysuXv1uXybP")`}}
                    >
                      <div className="w-full h-full bg-gradient-to-t from-[#13ec13]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <div className="transform transition-all duration-300 group-hover:translate-x-2">
                      <p className="text-gray-900 text-base font-medium leading-normal group-hover:text-[#13ec13] transition-colors">Earn Rewards</p>
                      <p className="text-gray-600 text-sm font-normal leading-normal">Get rewarded for your eco-friendly actions every time your packaging is claimed.</p>
                    </div>
                  </div>
                  <div className="group flex flex-col gap-3 pb-3 cursor-pointer">
                    <div 
                      className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl overflow-hidden"
                      style={{backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBl_jOIMjj4uLCZLc-dT9UUPek25WELyK2JPyRGe2QKg51v18qR2yhPaPyG3j-4mkay2yuK-hJJbHf70iaq_V0qO5TQo4R9ii3tKtblgv3lP2ZmWwT3BRsNgkecY-qbLe2NXH9HcRtzMtsBSvutE5cwM4fKyOHumJ0H4vzGjNXvNw4ACBpIMJmYtllsIeXvIZ70DSd8FuNgd0TtS77wE6qa_H_QAGKCQXqOaq9HBps6_DBCheK-6LNkzI16LqsXNxMwzihkAyO8MZt3")`}}
                    >
                      <div className="w-full h-full bg-gradient-to-t from-[#13ec13]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <div className="transform transition-all duration-300 group-hover:translate-x-2">
                      <p className="text-gray-900 text-base font-medium leading-normal group-hover:text-[#13ec13] transition-colors">Reduce Waste</p>
                      <p className="text-gray-600 text-sm font-normal leading-normal">Divert packaging from landfills and contribute to a healthier planet with every box.</p>
                    </div>
                  </div>
                  <div className="group flex flex-col gap-3 pb-3 cursor-pointer">
                    <div 
                      className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl overflow-hidden"
                      style={{backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCLvsGWNf4R2opj4VWqywNqqpcY2yyLDRw8t9ewIrQwoj5qJryZyvx2xH6kP_B0x96CZhWSDyJ5vifRsemloWKBVwJo1-F_Tgja88gWYYJDw63BeDsj7DFSRLZdmk8PnlFhpPoEXkOa3e1U9gRrLc2MeXY7IGRQE_7mIpgiHUCmyNmRbe9f8UwixnAoo6ndLmpeIiosE-EtxrTM0Y_vuOLBK5LxnRnLJTTEh_imtuhkIQcOpXJIcXjo_XLLGoKqhtHGPEqRdzDjztDK")`}}
                    >
                      <div className="w-full h-full bg-gradient-to-t from-[#13ec13]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <div className="transform transition-all duration-300 group-hover:translate-x-2">
                      <p className="text-gray-900 text-base font-medium leading-normal group-hover:text-[#13ec13] transition-colors">Find Supplies</p>
                      <p className="text-gray-600 text-sm font-normal leading-normal">Access affordable, sustainable packaging materials for your business needs.</p>
                    </div>
                  </div>
                  <div className="group flex flex-col gap-3 pb-3 cursor-pointer">
                    <div 
                      className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl overflow-hidden"
                      style={{backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBymferJxTNfQmU3QdPcRSTs9qRL5JbFzhVNYUR9vsmcpuSIaORc6NsnYWXPrX-nevFVScB5cxnQQN362HGk0Wm1brz5KFYKOTclL1QSR5c6S8mcsN5hs1AUNfORzzO-S_U4BJQfGDyFlzuRLjIYl1-ZmpzXnYB8VDfY1WYFInql9mDr1pEsuIorSf4SBBglVUn-MOHNNtpdiqpHxAXDFFTlGXdsvVp4OAzobMZKz__tWsoq7DwMTZdcKex74atmY4SxBR2s0RbviJ5")`}}
                    >
                      <div className="w-full h-full bg-gradient-to-t from-[#13ec13]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <div className="transform transition-all duration-300 group-hover:translate-x-2">
                      <p className="text-gray-900 text-base font-medium leading-normal group-hover:text-[#13ec13] transition-colors">Track Your Impact</p>
                      <p className="text-gray-600 text-sm font-normal leading-normal">See real-time data on how your contributions are making a positive environmental difference.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Dual Audience Section */}
          <section id="about" className="flex flex-1 justify-center py-10 md:py-16 px-4">
            <div className="flex flex-col w-full max-w-6xl flex-1">
              <div className="flex flex-col gap-10 px-4 py-10">
                <div className="flex flex-col gap-4 text-center items-center">
                  <h1 className="text-gray-900 tracking-light text-[32px] font-bold leading-tight md:text-4xl md:font-black md:tracking-[-0.033em] max-w-[720px]">For Everyone in the Loop</h1>
                  <p className="text-gray-700 text-base font-normal leading-normal max-w-[720px]">ReBox offers unique benefits whether you're giving packaging a new home or looking for sustainable materials.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="stats-section">
                  <div className="group flex flex-col gap-6 p-8 rounded-xl bg-white border border-gray-200 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:border-[#13ec13]">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#13ec13]/20 p-3 rounded-full text-[#13ec13] transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                        <span className="material-symbols-outlined">move_to_inbox</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#13ec13] transition-colors">For Disposers</h3>
                    </div>
                    <p className="text-gray-600">Turn your waste into a resource. Free up space, help the environment, and get rewarded for your used packaging.</p>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-center gap-2 transform transition-all duration-300 group-hover:translate-x-2">
                        <span className="material-symbols-outlined text-[#13ec13]">check_circle</span> Declutter your home or business.
                      </li>
                      <li className="flex items-center gap-2 transform transition-all duration-300 group-hover:translate-x-2" style={{ transitionDelay: '0.05s' }}>
                        <span className="material-symbols-outlined text-[#13ec13]">check_circle</span> Earn points and rewards.
                      </li>
                      <li className="flex items-center gap-2 transform transition-all duration-300 group-hover:translate-x-2" style={{ transitionDelay: '0.1s' }}>
                        <span className="material-symbols-outlined text-[#13ec13]">check_circle</span> Reduce your carbon footprint.
                      </li>
                    </ul>
                    <Link to={user ? "/packages/new" : "/register"} className="group/btn mt-auto flex w-fit cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#13ec13] text-gray-900 text-base font-bold leading-normal tracking-[0.015em] transform transition-all duration-300 hover:bg-[#10d010] hover:shadow-lg hover:scale-105">
                      <span className="truncate group-hover/btn:translate-x-[-2px] transition-transform duration-300">Start Listing Now</span>
                      <span className="material-symbols-outlined ml-1 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all duration-300">arrow_forward</span>
                    </Link>
                  </div>
                  <div className="group flex flex-col gap-6 p-8 rounded-xl bg-white border border-gray-200 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:border-[#13ec13]">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#13ec13]/20 p-3 rounded-full text-[#13ec13] transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                        <span className="material-symbols-outlined">storefront</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#13ec13] transition-colors">For Acquirers</h3>
                    </div>
                    <p className="text-gray-600">Source affordable, eco-friendly packaging from your local community. Perfect for small businesses, movers, and online sellers.</p>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-center gap-2 transform transition-all duration-300 group-hover:translate-x-2">
                        <span className="material-symbols-outlined text-[#13ec13]">check_circle</span> Lower your supply costs.
                      </li>
                      <li className="flex items-center gap-2 transform transition-all duration-300 group-hover:translate-x-2" style={{ transitionDelay: '0.05s' }}>
                        <span className="material-symbols-outlined text-[#13ec13]">check_circle</span> Enhance your brand's green credentials.
                      </li>
                      <li className="flex items-center gap-2 transform transition-all duration-300 group-hover:translate-x-2" style={{ transitionDelay: '0.1s' }}>
                        <span className="material-symbols-outlined text-[#13ec13]">check_circle</span> Support the local circular economy.
                      </li>
                    </ul>
                    <Link to={user ? "/marketplace" : "/login"} className="group/btn mt-auto flex w-fit cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-gray-200 text-gray-900 text-base font-bold leading-normal tracking-[0.015em] transform transition-all duration-300 hover:bg-gray-300 hover:shadow-lg hover:scale-105">
                      <span className="truncate group-hover/btn:translate-x-[-2px] transition-transform duration-300">Find Packaging Today</span>
                      <span className="material-symbols-outlined ml-1 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all duration-300">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="flex flex-1 justify-center py-10 px-4 bg-white border-t border-gray-200">
          <div className="flex flex-col w-full max-w-6xl flex-1 text-gray-600 text-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 text-[#13ec13]">
                    <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z"></path>
                      <path clipRule="evenodd" d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236ZM4.95178 15.2312L21.4543 41.6973C22.6288 43.5809 25.3712 43.5809 26.5457 41.6973L43.0534 15.223C43.0709 15.1948 43.0878 15.1662 43.104 15.1371L41.3563 14.1648C43.104 15.1371 43.1038 15.1374 43.104 15.1371L43.1051 15.135L43.1065 15.1325L43.1101 15.1261L43.1199 15.1082C43.1276 15.094 43.1377 15.0754 43.1497 15.0527C43.1738 15.0075 43.2062 14.9455 43.244 14.8701C43.319 14.7208 43.4196 14.511 43.5217 14.2683C43.6901 13.8679 44 13.0689 44 12.2609C44 10.5573 43.003 9.22254 41.8558 8.2791C40.6947 7.32427 39.1354 6.55361 37.385 5.94477C33.8654 4.72057 29.133 4 24 4C18.867 4 14.1346 4.72057 10.615 5.94478C8.86463 6.55361 7.30529 7.32428 6.14419 8.27911C4.99695 9.22255 3.99999 10.5573 3.99999 12.2609C3.99999 13.1275 4.29264 13.9078 4.49321 14.3607C4.60375 14.6102 4.71348 14.8196 4.79687 14.9689C4.83898 15.0444 4.87547 15.1065 4.9035 15.1529C4.91754 15.1762 4.92954 15.1957 4.93916 15.2111L4.94662 15.223L4.95178 15.2312ZM35.9868 18.996L24 38.22L12.0131 18.996C12.4661 19.1391 12.9179 19.2658 13.3617 19.3718C16.4281 20.1039 20.0901 20.5217 24 20.5217C27.9099 20.5217 31.5719 20.1039 34.6383 19.3718C35.082 19.2658 35.5339 19.1391 35.9868 18.996Z" fillRule="evenodd"></path>
                    </svg>
                  </div>
                  <h2 className="text-gray-900 text-lg font-bold">ReBox</h2>
                </div>
                <p>Giving your packaging a second life.</p>
              </div>
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-gray-900">Company</h3>
                <Link to="/about" className="hover:text-[#13ec13] transition-colors cursor-pointer">About Us</Link>
                <Link to="/careers" className="hover:text-[#13ec13] transition-colors cursor-pointer">Careers</Link>
                <Link to="/press" className="hover:text-[#13ec13] transition-colors cursor-pointer">Press</Link>
              </div>
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-gray-900">Resources</h3>
                <Link to="/faq" className="hover:text-[#13ec13] transition-colors cursor-pointer">FAQ</Link>
                <Link to="/contact" className="hover:text-[#13ec13] transition-colors cursor-pointer">Contact Us</Link>
                <Link to="/help" className="hover:text-[#13ec13] transition-colors cursor-pointer">Help Center</Link>
              </div>
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-gray-900">Legal</h3>
                <Link to="/terms" className="hover:text-[#13ec13] transition-colors cursor-pointer">Terms of Service</Link>
                <Link to="/privacy" className="hover:text-[#13ec13] transition-colors cursor-pointer">Privacy Policy</Link>
              </div>
            </div>
            <div className="mt-10 pt-8 border-t border-gray-200 flex justify-between items-center">
              <p>&copy; 2024 ReBox. All rights reserved.</p>
              <div className="flex gap-4">
                {/* Social icons would go here */}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
