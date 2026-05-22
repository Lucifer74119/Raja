import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, X, Image as ImageIcon, Map, Utensils, Info } from 'lucide-react';
import { GALLERY_ITEMS } from '../data/restaurantData';
import { GalleryItem } from '../types';

export default function InteractiveGallery() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'interior' | 'cuisine' | 'history'>('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const filterButtons = [
    { id: 'all', label: 'Visa Alla / All', icon: ImageIcon },
    { id: 'interior', label: 'Matsalen / The Hall', icon: Map },
    { id: 'cuisine', label: 'Mat & Dryck / Cuisine', icon: Utensils },
    { id: 'history', label: 'Historia / Heritage', icon: Info }
  ];

  const filteredItems = activeFilter === 'all' 
    ? GALLERY_ITEMS 
    : GALLERY_ITEMS.filter(item => item.category === activeFilter);

  return (
    <div id="interactive-gallery" className="space-y-8">
      {/* Visual Navigation filters */}
      <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto border-b border-amber-900/10 pb-4">
        {filterButtons.map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.id}
              onClick={() => setActiveFilter(btn.id as any)}
              className={`px-4 py-2 text-xs font-mono rounded-lg border transition-all flex items-center gap-1.5 uppercase font-medium ${
                activeFilter === btn.id
                  ? 'bg-amber-950 border-amber-950 text-amber-100 shadow-md scale-[1.02]'
                  : 'bg-white border-stone-200 text-stone-600 hover:border-amber-900 hover:text-stone-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* Grid rendering */}
      <motion.div 
        layout 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full hover:border-amber-900"
            >
              {/* Image Section */}
              <div className="relative overflow-hidden aspect-[4/3] bg-stone-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Visual hover screen */}
                <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="p-3 bg-white/20 backdrop-blur-md text-amber-50 rounded-full border border-white/20 transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg">
                    <Maximize2 className="w-5 h-5" />
                  </span>
                </div>

                {/* Category label badge */}
                <span className="absolute bottom-3 left-3 px-3 py-1 bg-stone-950/80 backdrop-blur-md text-[10px] uppercase font-bold tracking-wider rounded border border-white/10 text-amber-200">
                  {item.category === 'interior' ? 'The Beer Hall' : item.category === 'cuisine' ? 'Cuisine' : 'History'}
                </span>
              </div>

              {/* Title Section */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif text-stone-900 font-bold tracking-wide group-hover:text-[#a37c44] transition-colors">{item.title}</h4>
                  <p className="text-stone-500 text-xs mt-1.5 leading-relaxed">{item.description}</p>
                </div>
                <span className="text-[10px] font-mono text-[#a37c44] font-bold uppercase mt-4 block tracking-widest flex items-center gap-1">
                  Krog Pelikan • Blekingegatan 40
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-950/95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            {/* Close trigger button */}
            <button 
              className="absolute top-6 right-6 p-2 bg-stone-900/80 border border-white/10 rounded-full text-stone-200 hover:text-white hover:bg-stone-800 transition-all shadow-lg"
              onClick={() => setSelectedItem(null)}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Container */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-stone-900 rounded-2xl max-w-4xl w-full border border-white/5 overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col md:flex-row text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Column: Huge High Impact Image */}
              <div className="md:w-3/5 bg-black flex items-center justify-center max-h-[50vh] md:max-h-full">
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Right Column: Historical details card */}
              <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-between space-y-4 bg-stone-950">
                <div className="space-y-4">
                  <span className="text-[10px] font-mono tracking-widest text-[#c29c5a] font-black uppercase bg-white/5 border border-white/10 px-2 py-1 rounded inline-block">
                    {selectedItem.category === 'interior' ? 'Stora Hallen 1910' : selectedItem.category === 'cuisine' ? 'Traditionell Mat' : 'Södermalm Kulturarv'}
                  </span>
                  
                  <h3 className="font-serif text-2xl text-amber-100 tracking-wide leading-tight">
                    {selectedItem.title}
                  </h3>

                  <div className="h-[2px] w-12 bg-gradient-to-r from-[#c29c5a] to-transparent"></div>

                  <p className="text-stone-300 text-xs leading-relaxed font-sans">
                    {selectedItem.description}
                  </p>
                  
                  <p className="text-stone-400 text-xs leading-relaxed font-sans pt-2">
                    {selectedItem.category === 'interior' && (
                      'The high ceilings and towering pillars of Pelikan represent one of the absolute finest examples of Art Nouveau/Jugendstil dining spaces in northern Europe, strictly protected by the state as cultural heritage.'
                    )}
                    {selectedItem.category === 'cuisine' && (
                      'Every single plate of Husmanskost served is prepared from scratch with certified Nordic beef, local cream dairy products, and organic wild-foraged berries following historical manuals and cooking traditions.'
                    )}
                    {selectedItem.category === 'history' && (
                      'Krog Pelikan originally originated as "Blå Pelikanen" in Gamla Stan / Slussen as early as 1664 before relocating to Blekingegatan 40 on Södermalm in 1910, maintaining its cultural heart throughout centuries.'
                    )}
                  </p>
                </div>

                <div className="border-t border-white/5 pt-4">
                  <p className="text-[10px] font-mono text-stone-500 uppercase tracking-widest block leading-none">
                    Restaurant: Krog Pelikan
                  </p>
                  <p className="text-[10px] font-mono text-[#c29c5a] uppercase font-bold tracking-widest block mt-1.5">
                    Blekingegatan 40, Stockholm, Sweden
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
