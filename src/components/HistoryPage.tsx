import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Award, Clock, ArrowRight, Shield, Heart, Sparkles, AlertCircle, Quote } from 'lucide-react';

interface HistoryPageProps {
  onBackToHome: () => void;
}

export default function HistoryPage({ onBackToHome }: HistoryPageProps) {
  const [activeEra, setActiveEra] = useState<string>('1664');

  const eras = [
    {
      year: '1664',
      title: 'Blå Pelikanen i Gamla Stan',
      location: 'Södra Benickebrinken, Slussen',
      description: 'Den tyskfödde källarmästaren Hans-Georg Kühn erhåller officiella rättigheter från Magistraten att koka samt utskänka öl och brännvin under namnet ”Den Blå Pelikanen”. Krogen låg strategiskt placerad nära hamnen där skeppare, sjömän, och hantverkare ständigt anlöpte staden.',
      legacy: 'Detta markerar starten på vad som skulle bli en av Stockholms med tiden mest ikoniska nöjesinstitutioner.',
      image: 'https://images.unsplash.com/photo-1511018556340-d16986a1c194?auto=format&fit=crop&q=80&w=800'
    },
    {
      year: '1720',
      title: 'Fredmans Tid: Trubadurer & stop',
      location: 'Slussen & Skeppsbron',
      description: 'Under 1700-talet blir krogen ett centralt tillhåll för tidens bohemer, skalder och musiker. Carl Michael Bellman sägs ha frekventerat omgivningen och skrivit epistlar inspirerade av dofterna, ölet och de bullriga skratten som ekade ut från källaren på krogen.',
      legacy: 'Hela seklet präglas av mustiga rätter, salt sill och det stadiga flödet av kryddad snaps.',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800'
    },
    {
      year: '1910',
      title: 'Flytten till Blekingegatan',
      location: 'Blekingegatan 40, Södermalm',
      description: 'I och med Slussens nydaning tvingas krogen lämna Gamla Stan. Arkitekten Sam Kjellberg anlitas för att rita en monumental, katedral-liknande ölhall i Jugendstil på Södermalm. Med pelare, böljande takvinklar, enorm rymd och snidat ekträ skapas en av de vackraste folkliga samlingsplatserna i Sverige.',
      legacy: 'Ölhallen står än idag i exakt samma skrud och är klassad som kulturhistoriskt byggnadsminne.',
      image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=800'
    },
    {
      year: '1969',
      title: 'Bevarandet av Husmanskosten',
      location: 'Stora Hallen',
      description: 'Under en tid då det franska köket dominerar internationellt tar Krog Pelikan ställning. Krogen profilerar sig stenhårt som husmanskostens sista utpost. Recept som fläsklägg, gräddsåser och handrullade köttbullar kodifieras och förfinas till absolut perfektion på det anrika viset.',
      legacy: 'Detta räddar flera hotade svenska matrecept från glömskan.',
      image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&q=80&w=800'
    },
    {
      year: 'Nu',
      title: 'Det levande arvet',
      location: 'Södermalms hjärta',
      description: 'Idag drivs Krog Pelikan med samma okuvliga passion för traditioner. De tunga ekborden, den immiga pilsnern och doften av nystekt strömming välkomnar dagligen nya generationer av matälskare från hela världen. Här möts historia och nutid på precis samma sätt som för tre hundra år sedan.',
      legacy: 'Sveriges odiskutabla nationalscen för traditionellt mathantverk.',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800'
    }
  ];

  const currentEraData = eras.find(e => e.year === activeEra) || eras[2];

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-stone-900 pb-20">
      
      {/* Editorial Header */}
      <div className="relative py-16 md:py-24 bg-stone-950 text-[#FAF6F0] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1600" 
            alt="Vintage Swedish Beer Hall background" 
            className="w-full h-full object-cover filter sepia brightness-50"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent"></div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center space-y-4">
          <button 
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-amber-400 hover:text-amber-300 uppercase transition-all mb-4 px-3 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Tillbaka till förstasidan / Home</span>
          </button>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-[10px] font-mono tracking-widest text-amber-300 uppercase">
            <Award className="w-3" /> Etablerat 1664 i Stockholm
          </div>
          
          <h1 className="font-serif text-4xl md:text-7xl font-bold tracking-tight text-amber-50">
            PELIKANS SAGA
          </h1>
          <p className="font-serif italic text-base md:text-xl text-stone-300 max-w-2xl mx-auto font-light leading-relaxed">
            "Berättelsen om trehundrasextio år av ölhallskultur, hantverk och okuvlig mattradition på Södermalm."
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 md:mt-16">
        
        {/* Timelines and Narrative Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Era Navigator / Left Column (4 Cols) */}
          <div className="lg:col-span-4 bg-white/70 backdrop-blur border border-stone-200 p-6 md:p-8 rounded-2xl shadow-sm space-y-6 lg:sticky lg:top-24">
            <h3 className="font-serif text-lg font-bold text-stone-800 tracking-wide border-b pb-3 uppercase">
              Tidsresa / Timeline eras
            </h3>
            <p className="text-stone-500 text-xs font-sans leading-relaxed">
              Klicka på ett årtal nedan för att utforska Krog Pelikans levande historia från stormaktstid till nutid:
            </p>

            <div className="flex flex-col gap-3">
              {eras.map(era => (
                <button
                  key={era.year}
                  onClick={() => setActiveEra(era.year)}
                  className={`w-full p-4 rounded-xl text-left border transition-all flex items-center justify-between ${
                    activeEra === era.year 
                      ? 'bg-amber-950 text-amber-50 border-amber-950 scale-[1.02] shadow-md' 
                      : 'bg-white text-stone-700 border-stone-200/80 hover:border-stone-400 hover:bg-stone-50'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold tracking-wider opacity-75 uppercase block">Epok</span>
                    <span className="font-serif text-xl font-bold tracking-tight">{era.year}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-mono tracking-wider font-semibold uppercase block ${activeEra === era.year ? 'text-amber-300' : 'text-stone-500'}`}>
                      {era.title.split(' ')[0]}
                    </span>
                    <span className="text-[9px] opacity-70 block mt-0.5">{era.location.split(',')[0]}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl text-center">
              <span className="text-[10px] font-mono text-[#a37c44] tracking-widest uppercase font-bold block mb-1">
                Kulturhistoriskt skydd
              </span>
              <p className="text-[10px] text-stone-600 font-sans leading-normal">
                Både panelerna, takmålningarna och möblerna på Blekingegatan 40 skyddas lagligt som kulturarv.
              </p>
            </div>
          </div>

          {/* Era Content Detail / Right Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Active Era Card */}
            <motion.div
              key={activeEra}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm hover:border-stone-300/80 transition-all p-6 md:p-10 space-y-6"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-100 pb-5">
                <div className="space-y-1">
                  <span className="font-mono text-[10px] font-bold tracking-widest text-amber-700 uppercase block">Epok-översikt / Historic Era</span>
                  <h2 className="font-serif text-2xl md:text-4xl text-stone-900 font-bold tracking-tight">
                    {currentEraData.title}
                  </h2>
                </div>
                <div className="bg-amber-100 text-amber-950 px-4 py-2 font-serif font-extrabold text-2xl md:text-3xl rounded-xl border border-amber-200">
                  {currentEraData.year}
                </div>
              </div>

              {/* Image Frame */}
              <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-stone-100 border relative group">
                <img 
                  src={currentEraData.image} 
                  alt={currentEraData.title} 
                  className="w-full h-full object-cover grayscale brightness-95 group-hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-stone-950/80 backdrop-blur-md text-amber-200 text-[10px] font-mono px-3 py-1.5 rounded-lg border border-white/5 uppercase tracking-wider font-bold">
                  Plats: {currentEraData.location}
                </div>
              </div>

              {/* Text Narrative */}
              <div className="space-y-4 font-sans text-stone-700 leading-relaxed text-sm md:text-base">
                <p className="first-letter:text-4xl first-letter:font-serif first-letter:font-extrabold first-letter:float-left first-letter:mr-2 first-letter:text-[#a37c44]">
                  {currentEraData.description}
                </p>
                <div className="bg-[#FAF6F0] border-l-4 border-amber-800 p-4 rounded-r-xl italic font-serif text-stone-800">
                  <strong>Arv & Sensation:</strong> {currentEraData.legacy}
                </div>
              </div>
            </motion.div>

            {/* Editorial Feature - Historical Recipe Secrets */}
            <div className="bg-stone-950 rounded-3xl p-8 md:p-12 text-[#FAF6F0] relative overflow-hidden shadow-xl border border-amber-600/25">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-15 pointer-events-none translate-x-12 -translate-y-12">
                <Sparkles className="w-full h-full text-amber-400" />
              </div>
              <div className="space-y-6">
                <div className="inline-block bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest text-[#d4af37] uppercase">
                  Husman hantverk • Recipe Secrets
                </div>
                <h3 className="font-serif text-xl md:text-3xl font-bold tracking-wide">
                  Hemligheten bakom vår anrika köttbulle-gravy
                </h3>
                <p className="text-stone-300 text-xs md:text-sm leading-relaxed font-sans font-light">
                  På Pelikan mäts ingenting i milliliter eller gram; allt görs på känsla efter de gamla handskrivna receptböckerna i källararkivet. Vår ikoniska gräddsås baseras på en reducerad, fyllig hemgjord kalvfond som kokar i sextio timmar med rostade rotfrukter, färska örter och porteröl. Det hemliga tillskottet är en stänk av husets hemgjorda slånbärsgelé, vilket balanserar gräddens sötma och ger den unika lystern.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs font-mono">
                  <div className="space-y-1">
                    <span className="text-amber-300 font-bold uppercase block">Ingredienser</span>
                    <span className="text-stone-400 block">Nötkött/Fläskfärs, ekologisk vispgrädde, Västerbottenbröd, kryddpeppar, lök, smör.</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-amber-300 font-bold uppercase block">Koktid kalvfond</span>
                    <span className="text-stone-400 block">Minst 60 timmar av tålmodig långsam sjudning.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quotes from Swedish folklore */}
            <div className="bg-amber-500/5 border border-amber-900/15 rounded-3xl p-6 md:p-8 space-y-4">
              <Quote className="w-8 h-8 text-[#a37c44] opacity-40 shrink-0" />
              <blockquote className="font-serif italic text-stone-800 text-sm md:text-base leading-relaxed">
                "Klimatet ändras, spårvagnarna elektrifieras och konungar faller, men på Pelikan är köttbullarna alltid exakt lika stora, pilsnern lika immigt kall, och rökfyllda skratt lika varma."
              </blockquote>
              <div className="flex items-center gap-3 border-t pt-3 border-stone-200">
                <div className="w-9 h-9 rounded-full bg-amber-950 text-amber-100 flex items-center justify-center font-bold text-xs">
                  SÖ
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-900 block font-serif">Stig "Slas" Claesson</span>
                  <span className="text-[10px] text-stone-500 font-mono block">Legendarisk svensk författare & konstnär</span>
                </div>
              </div>
            </div>

            {/* Back Button layout */}
            <div className="pt-6 text-center">
              <button 
                onClick={onBackToHome}
                className="bg-stone-900 hover:bg-amber-900 text-amber-50 px-8 py-4 rounded-xl font-serif text-sm font-bold tracking-widest transition-all uppercase inline-flex items-center gap-2 shadow-md"
              >
                Tillbaka till restaurangen
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
