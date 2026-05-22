import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, MapPin, Phone, Mail, Share2, Twitter, Facebook, Copy, 
  Check, Menu, X, ChevronRight, ArrowDown, Play, Pause, Volume2, 
  VolumeX, Award, ShieldCheck, Heart, Sparkles, AlertCircle, Shield,
  Instagram, Globe, User
} from 'lucide-react';

import BookingForm from './components/BookingForm';
import GiftCardStudio from './components/GiftCardStudio';
import InteractiveGallery from './components/InteractiveGallery';
import Testimonials from './components/Testimonials';
import HistoryPage from './components/HistoryPage';
import AdminPanel from './components/AdminPanel';
import CustomerDashboard from './components/CustomerDashboard';
import { MENU_ITEMS } from './data/restaurantData';
import { translations } from './utils/translations';
import { bookingStore } from './utils/bookingStore';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenuTab, setActiveMenuTab] = useState<string>('mains');
  const [categories, setCategories] = useState(() => bookingStore.getMenuCategories());
  const [menuItems, setMenuItems] = useState(() => bookingStore.getMenuItems());
  const [isCustomerPortalOpen, setIsCustomerPortalOpen] = useState(false);

  useEffect(() => {
    const syncMenuData = () => {
      setCategories(bookingStore.getMenuCategories());
      setMenuItems(bookingStore.getMenuItems());
    };
    const interval = setInterval(syncMenuData, 2000);
    return () => clearInterval(interval);
  }, []);

  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  
  // Custom Hash Router Setup
  const [currentView, setCurrentView] = useState<'home' | 'history' | 'admin'>('home');

  // Multi-Language State
  const [lang, setLang] = useState<'sv' | 'en'>(() => {
    const saved = localStorage.getItem('pelikan_lang');
    return (saved === 'en' || saved === 'sv') ? saved : 'sv';
  });

  const toggleLang = () => {
    const nextLang = lang === 'sv' ? 'en' : 'sv';
    setLang(nextLang);
    localStorage.setItem('pelikan_lang', nextLang);
  };

  const t = translations[lang];

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#historia') {
        setCurrentView('history');
        window.scrollTo({ top: 0 });
      } else if (hash === '#admin') {
        setCurrentView('admin');
        window.scrollTo({ top: 0 });
      } else {
        setCurrentView('home');
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Real-time Status state
  const [currentLocalTime, setCurrentLocalTime] = useState(new Date());
  const [restaurantStatus, setRestaurantStatus] = useState({ isOpen: false, text: '', color: '' });

  // Contact form submission state
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  // Auto-clock updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentLocalTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update opening times based on real Swedish schedules
  useEffect(() => {
    const day = currentLocalTime.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const hours = currentLocalTime.getHours();
    
    let openHour = 16;
    let closeHour = 23; // default Mon-Thu is 16:00 to 23:00

    if (day === 5 || day === 6) { // Fri/Sat
      openHour = day === 5 ? 16 : 13; // Saturday opens earlier at 13:00
      closeHour = 1; // closes at 01:00 AM
    } else if (day === 0) { // Sunday
      openHour = 13; // opens 13:00
      closeHour = 23; // closes 23:00
    }

    // Determine state
    let open = false;
    let statusText = '';
    let statusColor = 'bg-amber-700 text-amber-50';

    if (closeHour === 1) { // Late night Friday/Saturday logic
      if (hours >= openHour || hours < 1) {
        open = true;
      }
    } else {
      if (hours >= openHour && hours < closeHour) {
        open = true;
      }
    }

    if (open) {
      statusText = '● ÖPPET JUST NU • OPEN NOW';
      statusColor = 'bg-emerald-600/95 text-emerald-50';
    } else {
      let scheduleText = `Öppnar kl. ${openHour}:00 idag`;
      if (day === 6 || day === 0) {
        scheduleText = `Öppnar kl. 13:00 idag`;
      }
      statusText = `● CLOSED • ${scheduleText}`;
      statusColor = 'bg-stone-800 text-stone-300';
    }

    setRestaurantStatus({ isOpen: open, text: statusText, color: statusColor });
  }, [currentLocalTime]);

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setContactLoading(true);
    setTimeout(() => {
      setContactLoading(false);
      setContactSuccess(true);
      setTimeout(() => {
        setContactSuccess(false);
        setContactForm({ name: '', email: '', subject: '', message: '' });
      }, 3000);
    }, 1200);
  };

  const filteredMenuItems = menuItems.filter(it => it.category === activeMenuTab && it.published !== false);

  if (currentView === 'history') {
    return <HistoryPage onBackToHome={() => { window.location.hash = ''; }} />;
  }

  if (currentView === 'admin') {
    return <AdminPanel onBackToHome={() => { window.location.hash = ''; }} />;
  }

  return (
    <div className="min-h-screen bg-[#fcfbfa] text-stone-900 font-sans leading-relaxed selection:bg-amber-900 selection:text-amber-50">
      
      {/* 1. DYNAMIC REAL-TIME ALERT STATUS BANNER */}
      <div className={`w-full ${restaurantStatus.color} px-4 py-2 text-center text-xs font-mono tracking-widest transition-all duration-500 z-50 flex items-center justify-center gap-4 border-b border-white/5`}>
        <span>{restaurantStatus.text.includes('OPN') || restaurantStatus.text.includes('●') ? restaurantStatus.text : (lang === 'sv' ? restaurantStatus.text : restaurantStatus.text.replace('Öppnar', 'Opens').replace('idag', 'today'))}</span>
        <span className="hidden md:inline text-white/40">|</span>
        <span className="hidden md:inline font-mono">
          {t.restaurantStatus.locPrefix} • {t.restaurantStatus.tel}
        </span>
        <span className="hidden xl:inline text-white/40">|</span>
        <span className="hidden xl:inline">
          {t.restaurantStatus.timeLabel}: {currentLocalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* 2. PREMIUM STICKY HEADER */}
      <header className="sticky top-0 bg-[#fcfbfa]/95 backdrop-blur-md z-45 border-b border-stone-200/50 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          
          {/* Logo brand */}
          <a href="#" className="flex flex-col group">
            <h1 className="font-serif text-xl md:text-2xl font-bold tracking-widest text-stone-900 leading-none group-hover:text-amber-800 transition-colors">
              KROG PELIKAN
            </h1>
            <span className="font-mono text-[9px] text-[#a37c44] font-bold tracking-[0.25em] mt-1">
              EST. 1664 • STOCKHOLM
            </span>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-[11px] font-mono tracking-widest font-bold text-stone-600 uppercase">
            <a href="#meny" className="hover:text-amber-900 py-1 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-amber-900 hover:after:w-full after:transition-all">{t.navbar.menu}</a>
            <a href="#bokning" className="hover:text-amber-900 py-1 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-amber-900 hover:after:w-full after:transition-all">{t.navbar.bookTable}</a>
            <a href="#presentkort" className="hover:text-amber-900 py-1 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-amber-900 hover:after:w-full after:transition-all">{t.navbar.voucher}</a>
            <a href="#gallery" className="hover:text-amber-900 py-1 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-amber-900 hover:after:w-full after:transition-all">{t.navbar.gallery}</a>
            <a href="#historia" className="hover:text-amber-900 py-1 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-amber-900 hover:after:w-full after:transition-all">{t.navbar.ourStory}</a>
            <a href="#kontakt" className="hover:text-amber-900 py-1 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-amber-900 hover:after:w-full after:transition-all">{t.navbar.contact}</a>
            <a href="#admin" className="text-amber-800 hover:text-amber-950 py-1 font-extrabold flex items-center gap-1.5 relative transition-all border-b border-transparent hover:border-amber-900">
              <Shield className="w-3.5 h-3.5" /> <span>{t.navbar.admin}</span>
            </a>
          </nav>

          {/* Call to action */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => setIsCustomerPortalOpen(true)}
              className="px-3.5 py-2 border border-amber-900/15 hover:border-[#a37c44] rounded-xl text-[#a37c44] hover:text-amber-900 text-[10px] font-mono font-extrabold transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-widest bg-amber-50/20"
              title={lang === 'sv' ? "Mitt Pelikan - Logga in med E-post OTP" : "My Pelikan - Log in with Email OTP"}
            >
              <User className="w-4 h-4" />
              <span>{lang === 'sv' ? 'Mitt Pelikan' : 'My Pelikan'}</span>
            </button>
            <button
              onClick={toggleLang}
              className="px-3.5 py-2 border border-stone-200 hover:border-amber-950/60 rounded-xl text-stone-600 hover:text-stone-900 text-[10px] font-mono font-extrabold transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-widest bg-stone-50"
              title={lang === 'sv' ? "Sätt språk till engelska" : "Change language to Swedish"}
            >
              <Globe className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>{lang === 'sv' ? 'EN' : 'SV'}</span>
            </button>
            <a 
              href="#bokning" 
              className="bg-stone-900 text-amber-50 hover:bg-amber-900 text-xs font-mono uppercase font-bold tracking-widest px-5 py-2.5 rounded-lg border border-stone-800 transition-all flex items-center justify-center shadow-sm"
            >
              {t.navbar.ctaButton}
            </a>
          </div>

          {/* Mobile menu trigger */}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-stone-700 hover:text-amber-950 transition-colors"
            aria-label="Open menu"
            id="mobile-menu-trigger"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* MOBILE NAV SLIDEOUT DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute top-0 right-0 w-4/5 max-w-sm h-full bg-[#fcfbfa] p-6 shadow-2xl flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-8">
                {/* Close handle */}
                <div className="flex justify-between items-center border-b pb-4">
                  <span className="font-serif text-sm font-semibold tracking-wider text-amber-900">KROG PELIKAN</span>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 border text-stone-400 hover:text-stone-800 rounded-full"
                    id="mobile-menu-close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Links */}
                <nav className="flex flex-col gap-6 text-[13px] font-mono tracking-widest uppercase font-bold text-stone-600">
                  <a href="#meny" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-900 flex items-center justify-between">
                    <span>{t.navbar.menu}</span> <ChevronRight className="w-4 h-4 text-[#a37c44]" />
                  </a>
                  <a href="#bokning" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-900 flex items-center justify-between">
                    <span>{t.navbar.bookTable}</span> <ChevronRight className="w-4 h-4 text-[#a37c44]" />
                  </a>
                  <a href="#presentkort" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-900 flex items-center justify-between">
                    <span>{t.navbar.voucher}</span> <ChevronRight className="w-4 h-4 text-[#a37c44]" />
                  </a>
                  <a href="#gallery" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-900 flex items-center justify-between">
                    <span>{t.navbar.gallery}</span> <ChevronRight className="w-4 h-4 text-[#a37c44]" />
                  </a>
                  <a href="#historia" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-900 flex items-center justify-between">
                    <span>{t.navbar.ourStory}</span> <ChevronRight className="w-4 h-4 text-[#a37c44]" />
                  </a>
                  <a href="#kontakt" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-900 flex items-center justify-between">
                    <span>{t.navbar.contact}</span> <ChevronRight className="w-4 h-4 text-[#a37c44]" />
                  </a>
                  <a href="#admin" onClick={() => setMobileMenuOpen(false)} className="text-[#a37c44] font-extrabold hover:text-amber-950 flex items-center justify-between border-t border-stone-200/50 pt-4 mt-1">
                    <span>{t.navbar.admin}</span> <ChevronRight className="w-4 h-4" />
                  </a>
                  
                  {/* Customer Portal Mobile Access */}
                  <button 
                    onClick={() => { setMobileMenuOpen(false); setIsCustomerPortalOpen(true); }}
                    className="w-full bg-[#a37c44] hover:bg-amber-900 text-[#fcfbfa] px-4 py-3 rounded-lg text-xs font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 mt-2 cursor-pointer transition-all border border-[#a37c44]/10 shadow"
                  >
                    <User className="w-4 h-4" />
                    <span>{lang === 'sv' ? 'Mitt Pelikan (Kundportal)' : 'My Pelikan (Client Portal)'}</span>
                  </button>
                </nav>
              </div>

              {/* Bot Info card */}
              <div className="border-t border-stone-200 pt-6 space-y-4">
                <div className="flex justify-between items-center bg-stone-100 p-2 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Language:
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => { setLang('sv'); localStorage.setItem('pelikan_lang', 'sv'); }}
                      className={`px-3 py-1 text-[10px] font-mono font-bold rounded cursor-pointer ${lang === 'sv' ? 'bg-amber-950 text-amber-100' : 'bg-stone-200 text-stone-600 hover:bg-stone-300'}`}
                    >
                      SV
                    </button>
                    <button
                      onClick={() => { setLang('en'); localStorage.setItem('pelikan_lang', 'en'); }}
                      className={`px-3 py-1 text-[10px] font-mono font-bold rounded cursor-pointer ${lang === 'en' ? 'bg-amber-950 text-amber-100' : 'bg-stone-200 text-stone-600 hover:bg-stone-300'}`}
                    >
                      EN
                    </button>
                  </div>
                </div>
                <p className="text-[10px] font-mono text-stone-500 leading-normal">
                  Blekingegatan 40, Södermalm, Stockholm<br />
                  Telefon: +46 (0)8 556 413 10
                </p>
                <a 
                  href="#bokning"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-amber-900 hover:bg-stone-900 text-amber-50 h-11 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center transition-all"
                >
                  {t.navbar.ctaButton}
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. HERO PARALLAX BANNER SECTION */}
      <section className="relative h-[92vh] flex items-center justify-center overflow-hidden bg-stone-950">
        
        {/* Cinematic Backdrop Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=1600" 
            alt="Krog Pelikan Grand Beer Hall" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-35 object-center scale-102 filter blur-[1px] md:blur-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-stone-950/70"></div>
        </div>

        {/* Content Panel Container */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 text-center text-amber-50 space-y-6">
          
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-400/30 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-mono tracking-widest text-amber-300 uppercase"
          >
            <Award className="w-3.5 h-3.5" />
            <span>{t.hero.subtitle}</span>
          </motion.div>

          {/* Main Display Headings */}
          <div className="space-y-4">
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="font-serif text-5xl md:text-8xl tracking-wider leading-none"
            >
              HUSMANSKOST
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-serif italic text-lg md:text-2xl text-stone-300 max-w-3xl mx-auto font-light leading-relaxed"
            >
              "{t.hero.title}"
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="h-[1px] w-24 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mx-auto"
          ></motion.div>

          {/* Information markers */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs font-mono tracking-widest text-[#c29c5a]"
          >
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> BLEKINGEGATAN 40
            </span>
            <span className="text-stone-700 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {lang === 'sv' ? 'ÖPPET ALLA DAGAR FRÅN 16:00' : 'OPEN SEVEN DAYS FROM 16:00'}
            </span>
          </motion.div>

          {/* Action Callouts */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-6 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a 
              href="#bokning" 
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-stone-950 font-serif text-sm font-bold tracking-widest px-8 py-4 rounded-xl shadow-lg transform transition hover:scale-102 flex items-center justify-center gap-2 uppercase cursor-pointer"
            >
              {t.booking.submitStep2}
              <ChevronRight className="w-4 h-4 stroke-[3px]" />
            </a>
            <a 
              href="#meny" 
              className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-amber-50 border border-stone-800 font-mono text-xs font-bold tracking-widest px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2 uppercase cursor-pointer"
            >
              {t.navbar.ctaButton}
            </a>
          </motion.div>
        </div>

        {/* Scroll down indicator */}
        <div className="absolute bottom-6 left-0 right-0 text-center animate-bounce z-10">
          <a href="#meny" className="inline-flex p-2 rounded-full border border-stone-800 text-[#a37c44] hover:text-amber-400 hover:border-amber-400 transition-all">
            <ArrowDown className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* 4. HISTORICAL LEGACY STORY SECTION ("SAGA") */}
      <section id="historia" className="py-20 md:py-28 bg-[#fcfbfa] border-b border-stone-200 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Box: Text Saga */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-mono tracking-widest text-[#a37c44] font-bold uppercase block">{lang === 'sv' ? 'Vår anrika historia • Our Heritage' : 'Our Rich History • Historical Legacy'}</span>
              <h3 className="font-serif text-3xl md:text-5xl text-stone-900 tracking-wide font-bold leading-tight">
                {lang === 'sv' ? 'Från Slussens "Blå Pelikan" (1664) till dagens Södermalm (1910)' : 'From Slussen\'s "Blue Pelican" (1664) to Södermalm (1910)'}
              </h3>
              
              <div className="h-[2px] w-16 bg-[#a37c44]"></div>

              <div className="text-sm md:text-base text-stone-700 space-y-4 leading-relaxed font-sans">
                {lang === 'sv' ? (
                  <>
                    <p>
                      Krog Pelikan är en av Stockholms tveklöst äldsta restauranger med anor dokumenterade ända tillbaka till <strong className="text-stone-950 font-semibold font-serif">1664</strong>. Det hela började då den tyskfödde bryggaren Hans-Georg Kühn slog upp dörrarna till källaren <em>”Blå Pelikanen”</em> i Gamla stan, nära Slussen. Det var ett tillhåll för skeppare, handelsmän och levnadsglada Stockholmare.
                    </p>
                    <p>
                      Efter mer än tvåhundra år i Slussens virrvarr flyttade verksamheten <strong className="text-stone-950 font-semibold">1910</strong> till sin nuvarande adress på Blekingegatan 40 på Södermalm. Här ritades en storslagen, katedralliknande ölhall i Jugendstil med imponerande takhöjd, pelare och vackert snidade möblemang av mörk ek. Denna unika krogmiljö har bevarats intakt och är i dag statligt skyddad som ett unikt stycke kulturhistoria.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      Krog Pelikan is undoubtedly one of Stockholm's oldest restaurants with a documented legacy tracing back to <strong className="text-stone-950 font-semibold font-serif">1664</strong>. It began when German brewer Hans-Georg Kühn opened the cellar tavern <em>"The Blue Pelican"</em> in Gamla Stan, near Slussen. It became a favorite haven for mariners, merchants, and local Stockholmers alike.
                    </p>
                    <p>
                      In <strong className="text-stone-950 font-semibold">1910</strong>, after two centuries of operating in Slussen's busy docks, Krog Pelikan moved to its current home on Blekingegatan 40, Södermalm. Here, a magnificent, cathedral-like beer hall was sketched in Art Nouveau style with a dizzying vault height, sturdy columns, and custom dark oak benches. This unique interior has been proudly preserved under heritage protection laws to this day.
                    </p>
                  </>
                )}
                <p>
                  {t.story.quote}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-stone-250">
                <div className="text-center md:text-left">
                  <span className="font-serif text-3xl md:text-4xl text-amber-900 font-bold block">1664</span>
                  <span className="text-[10px] font-mono tracking-widest text-stone-500 uppercase block mt-1">{t.story.yearLabel}</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="font-serif text-3xl md:text-4xl text-amber-900 font-bold block">115+</span>
                  <span className="text-[10px] font-mono tracking-widest text-stone-500 uppercase block mt-1 font-semibold">{t.story.capacityLabel}</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="font-serif text-3xl md:text-4xl text-amber-900 font-bold block">100%</span>
                  <span className="text-[10px] font-mono tracking-widest text-stone-500 uppercase block mt-1">{t.story.recipesLabel}</span>
                </div>
              </div>
            </div>

            {/* Right Box: Historic Frame Illustration */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-2 bg-gradient-to-tr from-amber-800 to-amber-500 rounded-2xl opacity-10 blur-xl"></div>
              <div className="border border-stone-200 bg-white p-4 rounded-2xl shadow-xl relative z-10 max-w-sm mx-auto">
                <div className="aspect-[3/4] bg-stone-150 overflow-hidden rounded-xl relative group">
                  <img 
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800" 
                    alt="Pelikan Original 1910 atmosphere layout" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-stone-950/80 backdrop-blur-md p-4 text-amber-50 text-center font-mono">
                    <p className="text-[11px] uppercase tracking-widest text-amber-300 font-bold">{t.story.envTitle}</p>
                    <p className="text-[9px] text-stone-400 mt-1 leading-tight">
                      {lang === 'sv' 
                        ? 'Målningar, mörkt trä och tidlös Art Nouveau skyddas av kulturlagen.' 
                        : 'Paintings, deep wood, and Art Nouveau ornaments protected by cultural preservation laws.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. AESTHETIC SIGNATURE MENU SECTION */}
      <section id="meny" className="py-20 md:py-28 bg-[#f5f3f0] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          {/* Menu header tag */}
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-mono tracking-widest text-[#a37c44] font-bold uppercase block">{lang === 'sv' ? 'Utsökt Svensk Tradition • The Menu' : 'Scrumptious Swedish Heritage • The Menu'}</span>
            <h3 className="font-serif text-3xl md:text-5xl text-stone-900 font-bold tracking-wide">{t.menu.title}</h3>
            <div className="h-[2px] w-12 bg-amber-800 mx-auto"></div>
            <p className="text-stone-600 text-xs md:text-sm font-sans max-w-md mx-auto">
              {lang === 'sv' 
                ? 'Tillagad på lokala nordiska råvaror efter sekelsgamla recept. Prisangivelser i Svenska kronor (SEK).' 
                : 'Prepared using local Nordic ingredients based on century-old recipes. Prices quoted in Swedish Krona (SEK).'}
            </p>
          </div>

          {/* Tab Selection */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 max-w-lg mx-auto mb-12">
            {categories.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMenuTab(tab.id)}
                className={`flex-1 min-w-[90px] md:min-w-[110px] py-3.5 px-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center cursor-pointer ${
                  activeMenuTab === tab.id 
                    ? 'bg-stone-900 border-stone-900 text-amber-100 scale-[1.02] shadow-sm' 
                    : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400'
                }`}
              >
                <span className="text-xs md:text-sm font-semibold font-serif block">
                  {lang === 'sv' ? tab.name : tab.swedishName}
                </span>
                <span className="text-[9px] md:text-[10px] font-mono uppercase opacity-70 mt-0.5 tracking-wider block">
                  {tab.id}
                </span>
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="menu-items-grid">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMenuTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 col-span-2"
              >
                {filteredMenuItems.map((dish) => (
                  <div
                    key={dish.id}
                    className="p-5 bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row gap-5 hover:border-[#a37c44] transition-all group"
                  >
                    {/* Dish picture if exist */}
                    <div className="w-full md:w-1/3 aspect-[4/3] md:aspect-square bg-stone-100 rounded-lg overflow-hidden shrink-0 relative">
                      <img 
                        src={dish.imageUrl} 
                        alt={dish.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-350"
                      />
                      {dish.signature && (
                        <span className="absolute top-2 left-2 bg-amber-900 text-[8px] text-amber-50 px-1.5 py-0.5 rounded font-mono font-bold tracking-wider uppercase">
                          Klassiker
                        </span>
                      )}
                    </div>

                    {/* Dish Details */}
                    <div className="flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        {/* Title & price */}
                        <div className="flex justify-between items-baseline gap-2">
                          <h4 className="font-serif text-base font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
                            {dish.name}
                          </h4>
                        </div>
                        <span className="text-[11px] font-serif italic text-stone-500 font-semibold block mt-0.5">
                          {dish.swedishName}
                        </span>

                        <span className="font-mono text-sm font-bold text-[#a37c44] mt-1.5 block">
                          {dish.price} kr
                        </span>

                        <p className="text-stone-600 text-xs mt-2.5 leading-relaxed font-sans font-light">
                          {dish.description}
                        </p>
                      </div>

                      {/* Badges details */}
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {dish.dietary.map((diet, i) => (
                          <span 
                            key={i} 
                            className="bg-stone-50 border border-stone-200/60 font-mono text-[8px] tracking-wide text-stone-500 py-0.5 px-2 rounded"
                          >
                            {diet}
                          </span>
                        ))}
                        {dish.id === 'main-1' && (
                          <span className="bg-amber-100 text-[#6d4d1e] text-[8.5px] font-mono px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1 font-bold">
                            <Heart className="w-3.5 h-3.5 fill-current" /> Rekommenderas
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Fast recommendation snack info banner */}
          <div className="mt-12 p-4 bg-amber-500/10 border border-amber-900/10 rounded-xl text-center max-w-xl mx-auto text-xs text-stone-800 flex items-center justify-center gap-2">
            <Heart className="w-4 h-4 text-amber-900 shrink-0" />
            <p>
              Pröva gärna vår ikoniska <strong>SOS tallrik</strong> tillsammans med en kall <strong>Pelikan Södermalm Pilsner</strong> och en kyld akvavit för den ultimata upplevelsen!
            </p>
          </div>

        </div>
      </section>

      {/* 6. INTERACTIVE TABLE RESERVATION SECTION */}
      <section id="bokning" className="py-20 md:py-28 bg-[#fcfbfa] border-b border-stone-200 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Column A: Booking details */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              <span className="text-xs font-mono tracking-widest text-[#a37c44] font-bold uppercase block">Bordsreservation • Table Reservations</span>
              <h3 className="font-serif text-3xl md:text-5xl text-stone-900 font-bold tracking-wide">Upplev atmosfären i ölhallen</h3>
              <div className="h-[2px] w-12 bg-amber-800"></div>
              
              <div className="text-stone-600 text-sm space-y-4 font-sans font-light leading-relaxed">
                <p>
                  Vänligen reservera ert bord i förväg för att säkra platser i vår historiska ölhall. Det går utmärkt att boka online upp till 8 personer direkt till höger.
                </p>
                <p>
                  För större sällskap över 8 personer, bröllopsfester eller företagskonferenser – vänligen skicka en förfrågan i vårt kontaktformulär längst ner eller maila oss direkt på <strong className="text-stone-900 font-semibold font-mono">info@pelikan.se</strong>.
                </p>
              </div>

              {/* Guarantees column */}
              <div className="space-y-3 pt-4 border-t border-stone-200">
                {[
                  { text: 'Direkt digital bokningsbekräftelse', sub: 'Instant confirmation receipt via Email' },
                  { text: 'Sittningstid är generösa 2.5 timmar', sub: 'Extended tables for dynamic dining experience' },
                  { text: 'Kostnadsfri avbokning', sub: 'Free cancellation up to 4 hours in advance' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start text-xs text-stone-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-stone-800 font-bold">{item.text}</strong>
                      <span className="text-[10px] text-stone-500 font-mono tracking-wide mt-0.5 block">{item.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column B: Real interactive wizard */}
            <div className="lg:col-span-8">
              <BookingForm />
            </div>

          </div>
        </div>
      </section>

      {/* 7. DIGITAL GIFT CARDS SECTION */}
      <section id="presentkort" className="py-20 md:py-28 bg-stone-50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Column A: Interactive Studio */}
            <div className="lg:col-span-8 order-2 lg:order-1">
              <GiftCardStudio lang={lang} />
            </div>

            {/* Column B: Gift Information */}
            <div className="lg:col-span-4 order-1 lg:order-2 space-y-6 lg:sticky lg:top-24">
              <span className="text-xs font-mono tracking-widest text-[#a37c44] font-bold uppercase block">
                {lang === 'sv' ? 'Gåva & Upplevelse • Presentkort Shop' : 'Gifts & Experiences • Voucher Store'}
              </span>
              <h3 className="font-serif text-3xl md:text-5xl text-stone-900 font-bold tracking-wide">
                {lang === 'sv' ? 'Ge bort en smakrik matgåva' : 'Share a genuine Swedish feast'}
              </h3>
              <div className="h-[2px] w-12 bg-amber-800"></div>

              <div className="text-stone-600 text-sm space-y-4 font-sans font-light leading-relaxed">
                <p>
                  {lang === 'sv' 
                    ? 'Ett presentkort på Krog Pelikan är den perfekta presenten till födelsedagar, julfirande, jubileum eller som omtanke till familj och kollegor. Mottagaren bjuds på anrika traditioner och legendarisk Husmanskost.' 
                    : 'A Krog Pelikan gift voucher is the perfect tribute for birthdays, holiday celebrations, anniversaries, or showing appreciation to colleagues. Give the gift of unforgettable culinary heritage.'}
                </p>
                <p>
                  {lang === 'sv' 
                    ? 'Välj belopp och skräddarsy designen i studion direkt till vänster. Du får presentkortet med en vacker utskrivbar design samt en unik kod skickad omgående via e-post på önskat datum.' 
                    : 'Choose your desired amount and refine your card layout in our live studio creator on the left. Receive a premium printable coupon instantly via email on your chosen day.'}
                </p>
              </div>

              {/* Quick parameters */}
              <div className="space-y-4 pt-4 border-t border-stone-200 text-xs">
                <div className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/10 text-[#a37c44] flex items-center justify-center font-bold font-mono">1</span>
                  <p className="text-stone-700 leading-normal">
                    {lang === 'sv' ? 'Giltigt i' : 'Valid for'} <strong className="text-stone-900">{lang === 'sv' ? 'två (2) år' : 'two (2) years'}</strong> {lang === 'sv' ? 'på mat & dryck.' : 'for food & drinks.'}
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/10 text-[#a37c44] flex items-center justify-center font-bold font-mono">2</span>
                  <p className="text-stone-700 leading-normal">
                    {lang === 'sv' ? 'Skickas direkt digitalt eller schemalägg till mottagaren.' : 'Sent as digital voucher instantly or scheduled for later.'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. MEDIA GALLERY & VIRTUAL AMBIENCE TOUR SECTION */}
      <section id="gallery" className="py-20 md:py-28 bg-[#fdfdfd] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-mono tracking-widest text-[#a37c44] font-bold uppercase block">Bilder & Upplevelser • Media tour</span>
            <h3 className="font-serif text-3xl md:text-5xl text-stone-900 font-bold tracking-wide">Ölhallens estetik & kokkonst</h3>
            <div className="h-[2px] w-12 bg-amber-800 mx-auto"></div>
            <p className="text-stone-600 text-xs md:text-sm font-sans">
              Ta en guidad fotografisk tur genom Pelikans storslagna bar och anrika matsal.
            </p>
          </div>

          {/* VIRTUAL VIDEO TOUR WIDGET */}
          <div className="max-w-4xl mx-auto bg-stone-950 border-4 border-amber-800/15 p-1 rounded-2xl overflow-hidden shadow-2xl relative group">
            
            {/* Visual brass overlay brackets */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-500/40 m-2 group-hover:m-1 transition-all"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-500/40 m-2 group-hover:m-1 transition-all"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-500/40 m-2 group-hover:m-1 transition-all"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-500/40 m-2 group-hover:m-1 transition-all"></div>

            <div className="aspect-[16/9] w-full relative bg-stone-900 overflow-hidden" id="video-tour-player">
              
              {/* Cinematic Video Source Placeholder Loops */}
              <AnimatePresence>
                {isPlayingVideo ? (
                  <motion.div 
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.05 }}
                    transition={{ repeat: Infinity, repeatType: 'reverse', duration: 15 }}
                    className="absolute inset-0"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=1600" 
                      alt="Virtual loop" 
                      className="w-full h-full object-cover brightness-[0.4]"
                    />
                  </motion.div>
                ) : (
                  <div className="absolute inset-0">
                    <img 
                      src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=1600" 
                      alt="Virtual static" 
                      className="w-full h-full object-cover brightness-[0.25]"
                    />
                  </div>
                )}
              </AnimatePresence>

              {/* Subtitle Telemetries */}
              <div className="absolute top-4 left-6 font-mono text-[9px] text-amber-500/80 tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                LIVE CULINARY TOUR • PLAYING MOOD LOOP
              </div>

              {/* Bottom subtitles block */}
              <div className="absolute bottom-6 left-6 right-6 text-center z-10 transition-all pointer-events-none">
                <span className="bg-black/80 px-4 py-2 border border-white/5 text-amber-100 text-xs md:text-sm font-serif italic rounded-lg tracking-wide inline-block max-w-lg shadow-md">
                  {isPlayingVideo ? (
                    isMuted 
                      ? '"Cozy, nostalgic murmurs and glasses clink softly under 1910 Jugendstil arched columns..."' 
                      : '"Tidlös svensk musik spelar ljuvt i bakgrunden till doften av hemgjorda köttbullar..."'
                  ) : (
                    '"Video Paused. Explore the surrounding visual photo album below."'
                  )}
                </span>
              </div>

              {/* Controller buttons */}
              <div className="absolute inset-0 flex items-center justify-center gap-4 z-10 opacity-75 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                  className="w-16 h-16 rounded-full bg-amber-900/90 border border-amber-500/20 text-amber-50 hover:bg-stone-900 hover:text-white flex items-center justify-center transition-all shadow-xl hover:scale-105"
                  aria-label={isPlayingVideo ? 'Pause Tour' : 'Play Tour'}
                >
                  {isPlayingVideo ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                </button>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-12 h-12 rounded-full bg-stone-900/90 border border-white/10 text-stone-200 hover:bg-stone-850 hover:text-white flex items-center justify-center transition-all shadow-xl"
                  aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

            </div>
          </div>

          {/* Filterable Image Grid Gallery mount */}
          <InteractiveGallery />

        </div>
      </section>

      {/* 9. TESTIMONIALS & SOCIAL MEDIA DIRECT LINK */}
      <section className="py-20 md:py-28 bg-[#f5f3f0] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-mono tracking-widest text-[#a37c44] font-bold uppercase block">Social Proof & Sharing</span>
            <h3 className="font-serif text-3xl md:text-5xl text-stone-900 font-bold tracking-wide">Vad våra gäster säger</h3>
            <div className="h-[2px] w-12 bg-amber-800 mx-auto"></div>
          </div>

          {/* Mounting Testimonials */}
          <Testimonials />

          {/* SOCIAL MEDIA INTEGRATION - SHARING PANEL */}
          <div className="max-w-2xl mx-auto border border-stone-200 bg-white p-6 md:p-8 rounded-2xl shadow-sm text-center space-y-6">
            <span className="text-[10px] font-mono tracking-widest text-[#a37c44] font-bold uppercase block">PREMIUM SHARING ENGINE</span>
            
            <div className="space-y-2">
              <h4 className="font-serif text-xl font-bold text-stone-900">Bjud in nära och kära till Pelikan</h4>
              <p className="text-stone-500 text-xs max-w-sm mx-auto font-sans">
                Planerar ni en gemensam herremiddag eller familjesammankomst? Dela länken direkt och slutför planerandet.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center items-center">
              {/* Sharing button A: Simulated Copy link */}
              <button
                onClick={handleCopyShareLink}
                className="bg-stone-950 hover:bg-[#a37c44] text-amber-50 px-4 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 shadow-sm"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {isCopied ? 'Länk kopierad!' : 'Kopiera webblänk'}
              </button>

              {/* Sharing button B: Simulated Twitter */}
              <a
                href="https://twitter.com/intent/tweet?text=Boka%20ett%20bord%20med%20mig%20p%C3%A5%20Krog%20Pelikan%20i%20Stockholm!"
                target="_blank"
                rel="noreferrer"
                className="bg-[#1da1f2] hover:bg-[#1a91da] text-white px-4 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-1.5"
              >
                <Twitter className="w-4 h-4 fill-current" />
                Dela på X
              </a>

              {/* Sharing button C: Simulated Facebook */}
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noreferrer"
                className="bg-[#1877f2] hover:bg-[#166fe5] text-white px-4 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-1.5"
              >
                <Facebook className="w-4 h-4 fill-current" />
                Dela på Facebook
              </a>
            </div>

            <p className="text-[9px] font-mono text-stone-400 uppercase tracking-widest">
              Est. 1664 • Blekingegatan 40, Södermalm, Stockholm
            </p>
          </div>

        </div>
      </section>

      {/* 10. INFORMATION FOOTER WITH DOUBLE-COLUMN INQUIRY FORM */}
      <footer id="kontakt" className="bg-stone-950 text-stone-250 py-16 md:py-24 relative overflow-hidden border-t-2 border-amber-600/35">
        
        {/* Subtle glowing lines */}
        <div className="absolute top-0 left-0 right-0 h-[10px] bg-gradient-to-b from-amber-600/10 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Box A: Official coordinates & weekly hours */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex flex-col">
                <h4 className="font-serif text-amber-200 text-xl tracking-wider font-bold">KROG PELIKAN</h4>
                <p className="font-mono text-[9px] text-[#a37c44] uppercase font-bold tracking-widest mt-1">Svensk ölhall sedan 1910</p>
              </div>

              {/* Hours chart container */}
              <div className="space-y-4">
                <h5 className="font-mono text-xs font-bold text-amber-100 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#a37c44]" />
                  Öppettider • Opening Hours
                </h5>
                <div className="space-y-2 text-xs font-mono text-stone-400">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>MÅNDAG - TORSDAG:</span>
                    <span className="text-amber-200">16:00 - 24:00</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>FREDAG:</span>
                    <span className="text-amber-200 font-bold">16:00 - 01:00</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>LÖRDAG:</span>
                    <span className="text-amber-200 font-bold">13:00 - 01:00</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>SÖNDAG:</span>
                    <span className="text-amber-200 font-bold">13:00 - 23:00</span>
                  </div>
                  <p className="text-[10px] text-stone-500 italic mt-3 leading-normal">
                    * Köket stänger kl 22:00 på vardagar och söndagar, samt kl 23:00 på fredagar och lördagar.
                  </p>
                </div>
              </div>

              {/* Core Physical values */}
              <div className="space-y-4 pt-4">
                <h5 className="font-mono text-xs font-bold text-amber-100 uppercase tracking-widest border-b border-white/5 pb-2">
                  Kontaktuppgifter • Coordinates
                </h5>
                <div className="space-y-2.5 text-xs text-stone-400 font-sans leading-relaxed">
                  <p className="flex items-start gap-2.5">
                    <MapPin className="w-4.5 h-4.5 text-[#a37c44] shrink-0" />
                    <span>Blekingegatan 40, 116 56 Stockholm, Sweden (Södermalm district, subway Skanstull)</span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[#a37c44] shrink-0" />
                    <span className="font-mono">+46 (0)8 556 413 10</span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[#a37c44] shrink-0" />
                    <span className="font-mono">info@pelikan.se</span>
                  </p>
                </div>
              </div>

            </div>

            {/* Box B: Physical Coordinates Map Drawer UI */}
            <div className="lg:col-span-4 space-y-6">
              <h5 className="font-mono text-xs font-bold text-amber-100 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#a37c44]" />
                {lang === 'sv' ? 'Hitta till Blekingegatan 40' : 'Find Krog Pelikan'}
              </h5>

              {/* Real Google Maps interactive embed */}
              <div className="bg-stone-900 border border-white/10 rounded-xl overflow-hidden aspect-[4/3] relative shadow-lg">
                <iframe
                  title="Krog Pelikan Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2036.0820015091728!2d18.0725350!3d59.3101140!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x465f77ee290bf525%3A0xe10435df2b6ca4ef!2sKrog%20Pelikan!5e0!3m2!1sen!2sse!4v1716300000000!5m2!1sen!2sse"
                  className="w-full h-full border-0 brightness-[0.8] contrast-[1.1] hover:brightness-100 transition-all"
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              {/* Social Media Links section */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#a37c44] font-bold block">
                  {lang === 'sv' ? 'Sociala medier • Connect' : 'Follow us • Social channels'}
                </span>
                <div className="flex gap-2.5">
                  <a href="https://instagram.com/krogpelikan" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-amber-900 border border-white/10 text-amber-100 hover:text-white flex items-center justify-center transition-all cursor-pointer">
                    <Instagram className="w-4.5 h-4.5" />
                  </a>
                  <a href="https://facebook.com/krogpelikan" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-amber-900 border border-white/10 text-amber-100 hover:text-white flex items-center justify-center transition-all cursor-pointer">
                    <Facebook className="w-4.5 h-4.5" />
                  </a>
                  <a href="https://twitter.com/krogpelikan" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-amber-900 border border-white/10 text-amber-100 hover:text-white flex items-center justify-center transition-all cursor-pointer">
                    <Twitter className="w-4.5 h-4.5" />
                  </a>
                  <a href="https://tripadvisor.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-amber-900 border border-white/10 text-amber-100 hover:text-white flex items-center justify-center transition-all cursor-pointer font-serif font-bold text-[10px]">
                    TA
                  </a>
                </div>
              </div>

              <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl text-xs text-stone-400 font-sans flex items-start gap-2 max-w-sm">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {lang === 'sv' 
                    ? 'Södermalm har begränsat med car parkeringsplatser. Vi rekommenderar buss nr 3, 4 eller tunnelbanan direkt till Skanstull (3 minuters gångavstånd).' 
                    : 'Parking is limited around Södermalm. We recommend subway to Skanstull or bus 3/4 (3-minute casual walk).'}
                </p>
              </div>
            </div>

            {/* Box C: Dynamic inquire list form */}
            <form onSubmit={handleContactSubmit} className="lg:col-span-4 space-y-4" id="footer-contact-form">
              <h5 className="font-mono text-xs font-bold text-amber-100 uppercase tracking-widest border-b border-white/5 pb-2">
                Kontakta oss • Instant Inquiries
              </h5>

              {contactSuccess && (
                <p className="text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 p-3 rounded-lg text-xs font-mono">
                  ✓ Tack! Ditt meddelande har skickats till bokningsansvarig. Vi återkopplar inom 24 timmar.
                </p>
              )}

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Namn • Your Name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-stone-900 text-stone-200 border border-white/10 rounded-lg p-3 text-xs focus:outline-none focus:border-amber-500"
                  required
                />
                <input
                  type="email"
                  placeholder="E-post • Your Email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full bg-stone-900 text-stone-200 border border-white/10 rounded-lg p-3 text-xs focus:outline-none focus:border-amber-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Ämne • Subject (t.ex. Fest, Julbord, Frågor)"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(p => ({ ...p, subject: e.target.value }))}
                  className="w-full bg-stone-900 text-stone-200 border border-white/10 rounded-lg p-3 text-xs focus:outline-none focus:border-amber-500"
                />
                <textarea
                  placeholder="Skriv ditt meddelande..."
                  rows={3}
                  value={contactForm.message}
                  onChange={(e) => setContactForm(p => ({ ...p, message: e.target.value }))}
                  className="w-full bg-stone-900 text-stone-200 border border-white/10 rounded-lg p-3 text-xs focus:outline-none focus:border-amber-500"
                  required
                ></textarea>

                <button
                  type="submit"
                  disabled={contactLoading || contactSuccess}
                  className="w-full bg-amber-900 hover:bg-amber-800 text-amber-50 font-serif font-bold text-xs py-3 rounded-lg uppercase tracking-wide transition-all disabled:opacity-50"
                >
                  {contactLoading ? 'Skickar meddelande...' : 'Skicka Förfrågan'}
                </button>
              </div>
            </form>

          </div>

          {/* Extreme bottom line */}
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-stone-500 text-[10px] font-mono gap-4 uppercase tracking-widest text-center">
            <p>© 2026 KROG PELIKAN AB. ALL RIGHTS RESERVED. REGISTERED TRADEMARK.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-amber-400">Integritetspolicy</a>
              <span>•</span>
              <a href="#" className="hover:text-amber-400">Cookieinställningar</a>
              <span>•</span>
              <a href="#" className="hover:text-[#a37c44]">Blekingegatan 40 Stockholm</a>
            </div>
          </div>

        </div>
      </footer>

      {/* CUSTOMER PORTAL OVERLAY HUB */}
      <CustomerDashboard
        isOpen={isCustomerPortalOpen}
        onClose={() => setIsCustomerPortalOpen(false)}
        lang={lang}
      />

    </div>
  );
}
