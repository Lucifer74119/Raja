import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Users, Clock, MapPin, User, Mail, Phone, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { BookingDetails } from '../types';
import { bookingStore } from '../utils/bookingStore';
import { translations } from '../utils/translations';

interface BookingFormProps {
  lang?: 'sv' | 'en';
}

export default function BookingForm({ lang = 'sv' }: BookingFormProps) {
  const t = translations[lang];
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<BookingDetails>({
    name: '',
    email: '',
    phone: '',
    guests: 2,
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // tomorrow
    time: '18:00',
    area: 'Hall',
    specialNotes: '',
    dietaryNotes: ''
  });
  const selectedTable = bookingStore.getDiningTables().find(t => t.id === formData.tableId);
  const [bookingRef, setBookingRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeSlots = [
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'guests' ? parseInt(value) : value
    }));
  };

  const handleGuestChange = (amount: number) => {
    setFormData(prev => ({
      ...prev,
      guests: Math.max(1, Math.min(20, prev.guests + amount))
    }));
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) return;

    setIsSubmitting(true);
    setTimeout(() => {
      // Simulate real-time secure booking system with local storage synchronization
      const ref = `PEL-${formData.date.replace(/-/g, '').substring(2)}-${Math.floor(1000 + Math.random() * 9000)}`;
      setBookingRef(ref);
      
      bookingStore.addBooking({
        ...formData,
        reference: ref,
        status: 'pending' // Initial status is pending, and the admin can confirm/manage
      });

      setIsSubmitting(false);
      setStep(3);
    }, 1200);
  };

  return (
    <div className="bg-amber-50/40 border border-amber-900/10 rounded-2xl overflow-hidden shadow-xl" id="booking-system">
      {/* Visual Header */}
      <div className="bg-stone-900 px-6 py-6 border-b border-amber-500/10 text-center relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
        <h3 className="font-serif text-2xl tracking-wide text-amber-100 flex items-center justify-center gap-2">
          <span>{t.booking.title.toUpperCase()}</span>
        </h3>
        <p className="text-stone-400 text-xs mt-1 tracking-wider uppercase font-mono">Table Booking System • Blekingegatan 40</p>
        
        {/* Step Progress Tracker */}
        <div className="flex justify-center items-center mt-6 gap-2 max-w-xs mx-auto">
          <div className="flex items-center">
            <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center border font-mono ${step >= 1 ? 'bg-amber-500 border-amber-500 text-stone-950 font-bold' : 'border-stone-700 text-stone-400'}`}>1</span>
            <span className="text-xs ml-1 text-stone-300 font-medium">{lang === 'sv' ? 'Bord' : 'Table'}</span>
          </div>
          <div className="h-[1px] w-8 bg-stone-700"></div>
          <div className="flex items-center">
            <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center border font-mono ${step >= 2 ? 'bg-amber-500 border-amber-500 text-stone-950 font-bold' : 'border-stone-700 text-stone-400'}`}>2</span>
            <span className="text-xs ml-1 text-stone-400 font-medium">{lang === 'sv' ? 'Kontakt' : 'Contact'}</span>
          </div>
          <div className="h-[1px] w-8 bg-stone-700"></div>
          <div className="flex items-center">
            <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center border font-mono ${step >= 3 ? 'bg-amber-500 border-amber-500 text-stone-950 font-bold' : 'border-stone-700 text-stone-400'}`}>3</span>
            <span className="text-xs ml-1 text-stone-400 font-medium">{lang === 'sv' ? 'Klar' : 'Done'}</span>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <AnimatePresence mode="wait">
          {/* STEP 1: RESTAURANT SPECIFICATION */}
          {step === 1 && (
            <motion.form 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleStep1Submit} 
              className="space-y-6"
              id="booking-form-step-1"
            >
              {/* Part 1: Guests Count */}
              <div className="space-y-2">
                <label className="block text-stone-800 text-sm font-semibold tracking-wide flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-700" />
                  {t.booking.guestsLabel}
                </label>
                <div className="flex items-center p-1 bg-stone-100 rounded-lg max-w-sm border border-stone-200">
                  <button 
                    type="button" 
                    onClick={() => handleGuestChange(-1)}
                    className="w-12 h-10 flex items-center justify-center text-stone-700 hover:bg-stone-200 rounded-md transition-all font-mono text-xl cursor-pointer"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-mono font-bold text-stone-800 text-lg">
                    {formData.guests} {formData.guests === 1 ? (lang === 'sv' ? 'gäst' : 'guest') : (lang === 'sv' ? 'gäster' : 'guests')}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => handleGuestChange(1)}
                    className="w-12 h-10 flex items-center justify-center text-stone-700 hover:bg-stone-200 rounded-md transition-all font-mono text-xl cursor-pointer"
                  >
                    +
                  </button>
                </div>
                {formData.guests > 8 && (
                  <p className="text-amber-800 text-xs italic bg-amber-100/50 p-2 border border-amber-200 rounded-md mt-1">
                    {lang === 'sv' 
                      ? 'För sällskap över 8 personer rekommenderar vi vår fasta Husmansmeny. Kontakta oss direkt på info@pelikan.se.' 
                      : 'For groups larger than 8 guests, we kindly request our set Swedish heritage menu. Please contact us on info@pelikan.se.'}
                  </p>
                )}
              </div>

              {/* Part 2: Seating Zone */}
              <div className="space-y-2">
                <label className="block text-stone-800 text-sm font-semibold tracking-wide flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-700" />
                  {t.booking.zoneLabel}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {bookingStore.getDiningZones().filter(z => z.isActive).map((area) => {
                    const localizedName = lang === 'sv' ? area.name : (area.id === 'Hall' ? 'Great Beer Hall' : area.id === 'Kristallen' ? 'Crystal Bar' : 'Pelikan Terrace');
                    const localizedDesc = lang === 'sv' ? area.desc : (area.id === 'Hall' ? 'Vibrant interior' : area.id === 'Kristallen' ? 'Elegant corner' : 'Cozy open air');
                    return (
                      <motion.button
                        key={area.id}
                        type="button"
                        whileHover={{ 
                          scale: 1.03, 
                          boxShadow: "0 0 10px rgba(217, 119, 6, 0.25)",
                          borderColor: "#d97706" 
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData(p => ({ ...p, area: area.id }))}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all zone-button cursor-pointer ${
                          formData.area === area.id 
                            ? 'bg-amber-950 text-amber-100 border-amber-950 shadow-md' 
                            : 'bg-white text-stone-700 border-stone-200 hover:border-amber-500/50'
                        }`}
                      >
                        <span className="text-xs font-bold font-serif">{localizedName}</span>
                        <span className="text-[10px] opacity-75 mt-0.5 leading-tight">{localizedDesc}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Part 2.5: Select Table with Image */}
              <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-150 shadow-xs">
                <div className="flex justify-between items-center">
                  <label className="block text-stone-800 text-sm font-semibold tracking-wide flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                    {lang === 'sv' ? 'Välj specifikt bord (valfritt)' : 'Choose a specific table (optional)'}
                  </label>
                  {formData.tableId && (
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, tableId: undefined }))}
                      className="text-[10px] text-amber-800 underline uppercase tracking-wider font-mono cursor-pointer font-bold"
                    >
                      {lang === 'sv' ? 'Rensa val' : 'Clear selection'}
                    </button>
                  )}
                </div>
                
                <p className="text-[11px] text-stone-500 font-mono">
                  {lang === 'sv' 
                    ? 'Se bilder och välj din favoritplats i den valda zonen för kvällen.' 
                    : 'View real table photos and reserve your favorite seating below.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[290px] overflow-y-auto pr-1">
                  {bookingStore.getDiningTables().filter(t => t.zoneId === formData.area && t.isActive !== false).map((table) => {
                    const isSelected = formData.tableId === table.id;
                    return (
                      <div
                        key={table.id}
                        onClick={() => setFormData(p => ({ ...p, tableId: table.id }))}
                        className={`group border rounded-lg overflow-hidden cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected 
                            ? 'border-amber-600 bg-amber-50/25 ring-2 ring-amber-500/30' 
                            : 'border-stone-200 bg-white hover:border-stone-400'
                        }`}
                      >
                        <div className="relative aspect-[16/9] bg-stone-100 overflow-hidden">
                          <img 
                            src={table.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80"} 
                            alt={table.tableName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute top-1.5 right-1.5 px-2 py-0.5 bg-stone-900/80 text-white font-mono text-[9px] font-bold rounded">
                            {table.capacity} p
                          </div>
                        </div>
                        <div className="p-2.5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-center">
                              <h4 className="font-serif text-xs font-bold text-stone-900">{table.tableName}</h4>
                              {isSelected && (
                                <span className="w-2.5 h-2.5 bg-amber-600 rounded-full flex items-center justify-center p-0.5">
                                  <Check className="w-2 h-2 text-white stroke-[3px]" />
                                </span>
                              )}
                            </div>
                            {table.description && (
                              <p className="text-[10px] text-stone-500 mt-0.5 leading-snug line-clamp-2">{table.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {bookingStore.getDiningTables().filter(t => t.zoneId === formData.area && t.isActive !== false).length === 0 && (
                    <div className="col-span-2 text-center p-4 text-xs text-stone-500 font-mono">
                      {lang === 'sv' ? 'Inga bord inlagda i denna zon för tillfället.' : 'No tables configured in this area yet.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Part 3: Date & Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-stone-800 text-sm font-semibold tracking-wide flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-700" />
                    {t.booking.dateLabel}
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={handleInputChange}
                    className="w-full bg-white text-stone-800 border border-stone-200 rounded-lg p-3 font-mono text-sm focus:outline-none focus:border-amber-900 focus:ring-1 focus:ring-amber-900"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-stone-800 text-sm font-semibold tracking-wide flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-700" />
                    {t.booking.timeLabel}
                  </label>
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full bg-white text-stone-800 border border-stone-200 rounded-lg p-3 font-mono text-sm focus:outline-none focus:border-amber-900 focus:ring-1 focus:ring-amber-900 cursor-pointer"
                  >
                    {timeSlots.map(tOption => (
                      <option key={tOption} value={tOption}>{tOption}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 1 Control */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-stone-900 hover:bg-amber-950 text-amber-100 py-4 px-6 rounded-xl font-bold font-serif tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 uppercase text-sm cursor-pointer"
                >
                  {lang === 'sv' ? 'Gå vidare till kontakt • Next step' : 'Proceed to personal details'}
                  <ChevronRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-stone-500 text-center mt-3 tracking-wide">
                  {lang === 'sv' 
                    ? 'Sittningstiden är 2.5 timmar om inget annat avtalas.' 
                    : 'Dining seating is limited to 2.5 hours unless agreed otherwise.'}
                </p>
              </div>
            </motion.form>
          )}

          {/* STEP 2: PERSONAL CONTACTS */}
          {step === 2 && (
            <motion.form 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleFinalSubmit} 
              className="space-y-5"
              id="booking-form-step-2"
            >
              {/* Review summary indicator */}
              <div className="p-3 bg-amber-500/10 border border-amber-900/10 rounded-xl flex flex-wrap justify-between items-center text-xs text-stone-800">
                <div className="flex gap-4">
                  <span className="font-semibold flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-amber-800" />
                    {formData.guests} {lang === 'sv' ? 'gäster' : 'guests'}
                  </span>
                  <span className="font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-800" />
                    {formData.date}
                  </span>
                  <span className="font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-800" />
                    {lang === 'sv' ? 'Kl.' : 'At'} {formData.time}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 xs:mt-0">
                  <span className="font-serif italic font-bold text-amber-900 text-[10px] border border-amber-900/20 px-1.5 py-0.5 rounded uppercase bg-white shadow-xs">
                    {formData.area === 'Hall' ? (lang === 'sv' ? 'Stora Hallen' : 'Beer Hall') : formData.area === 'Kristallen' ? (lang === 'sv' ? 'Kristallen' : 'Crystal') : (lang === 'sv' ? 'Terrassen' : 'Terrace')}
                  </span>
                  {selectedTable && (
                    <span className="font-mono text-[10px] bg-amber-200 text-amber-950 font-bold px-1.5 py-0.5 rounded uppercase shadow-sm">
                      {selectedTable.tableName}
                    </span>
                  )}
                </div>
              </div>

              {/* Input: Full Name */}
              <div className="space-y-2">
                <label className="block text-stone-800 text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-stone-500" />
                  {t.booking.nameLabel}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={lang === 'sv' ? 'Skriv fullständigt namn...' : 'Type full name...'}
                  className="w-full bg-white text-stone-800 border border-stone-200 rounded-lg p-3 text-sm focus:outline-none focus:border-amber-900 focus:ring-1 focus:ring-amber-900"
                  required
                />
              </div>

              {/* Input: Contact Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-stone-800 text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-stone-500" />
                    {t.booking.emailLabel}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@domain.com"
                    className="w-full bg-white text-stone-800 border border-stone-200 rounded-lg p-3 text-sm focus:outline-none focus:border-amber-900 focus:ring-1 focus:ring-amber-900"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-stone-800 text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-500" />
                    {t.booking.phoneLabel}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+46 800-00 00"
                    className="w-full bg-white text-stone-800 border border-stone-200 rounded-lg p-3 text-sm focus:outline-none focus:border-amber-900 focus:ring-1 focus:ring-amber-900"
                    required
                  />
                </div>
              </div>

              {/* Special dietary needs */}
              <div className="space-y-2">
                <label className="block text-stone-800 text-xs font-semibold tracking-wider uppercase">
                  {t.booking.dietaryLabel}
                </label>
                <input
                  type="text"
                  name="dietaryNotes"
                  value={formData.dietaryNotes || ''}
                  onChange={handleInputChange}
                  placeholder={lang === 'sv' ? 't.ex. Glutenfri, laktosfri, vegetarian...' : 'e.g. Gluten-free, vegetarian, allergies...'}
                  className="w-full bg-white text-stone-800 border border-stone-200 rounded-lg p-3 text-sm focus:outline-none focus:border-amber-900 focus:ring-1 focus:ring-amber-900"
                />
              </div>

              {/* Special notes */}
              <div className="space-y-2">
                <label className="block text-stone-800 text-xs font-semibold tracking-wider uppercase">
                  {t.booking.specialNotesLabel}
                </label>
                <textarea
                  name="specialNotes"
                  value={formData.specialNotes || ''}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder={lang === 'sv' ? 't.ex. Barnstol, rullstolsanpassat bord...' : 'e.g. High chair, specific window table, wheelchair...'}
                  className="w-full bg-white text-stone-800 border border-stone-200 rounded-lg p-3 text-sm focus:outline-none focus:border-amber-900 focus:ring-1 focus:ring-amber-900"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-stone-100 border border-stone-200 text-stone-700 py-3 px-4 rounded-xl font-bold transition-all flex items-center gap-1.5 hover:bg-stone-200 text-xs uppercase cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t.booking.backBtn}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-amber-900 hover:bg-stone-900 text-amber-100 py-4 px-6 rounded-xl font-bold font-serif tracking-wider shadow-md transition-all flex items-center justify-center gap-2 uppercase text-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-amber-100" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t.booking.submitting}
                    </span>
                  ) : (
                    <>
                      {t.booking.submitBtn}
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}

          {/* STEP 3: BOOKING CONFIRMATION */}
          {step === 3 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
              id="booking-confirmation"
            >
              <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-emerald-700" />
              </div>
              <h4 className="font-serif text-2xl text-stone-900 tracking-wide font-bold">{t.booking.successTitle}</h4>
              <p className="text-stone-500 text-xs mt-1 uppercase tracking-wider">{t.booking.successSub}</p>

              {/* High precision ticket */}
              <div className="bg-white border border-dashed border-stone-200 rounded-xl p-6 mt-6 max-w-md mx-auto text-left relative shadow-sm">
                <div className="absolute top-0 right-0 p-2 bg-amber-500/15 text-[10px] text-amber-950 rounded font-bold font-mono tracking-wide">
                  SECURE DEPOSIT
                </div>
                
                <h5 className="font-mono text-xs font-bold text-stone-400 mb-4 border-b pb-2 uppercase tracking-widest">
                  {t.booking.receiptTitle}
                </h5>

                <div className="space-y-2 text-stone-800 text-xs font-mono">
                  <div className="flex justify-between border-b border-stone-100 pb-1.5">
                    <span className="text-stone-400">{t.booking.refLabel}:</span>
                    <span className="font-bold text-amber-900">{bookingRef}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 pb-1.5">
                    <span className="text-stone-400">{t.booking.guestsReceipt}:</span>
                    <span className="font-bold">{formData.guests} {formData.guests === 1 ? (lang === 'sv' ? 'person' : 'person') : (lang === 'sv' ? 'personer' : 'people')}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 pb-1.5">
                    <span className="text-stone-400">{t.booking.dateReceipt}:</span>
                    <span className="font-bold">{formData.date}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 pb-1.5">
                    <span className="text-stone-400">{t.booking.timeReceipt}:</span>
                    <span className="font-bold">Kl. {formData.time}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 pb-1.5">
                    <span className="text-stone-400">{t.booking.zoneReceipt}:</span>
                    <span className="font-bold text-amber-950">
                      {formData.area === 'Hall' ? (lang === 'sv' ? 'Matsal Stora Hallen' : 'Great Beer Hall') : formData.area === 'Kristallen' ? (lang === 'sv' ? 'Kristallen Bar' : 'Crystal Bar') : (lang === 'sv' ? 'Pelikan Terrassen' : 'Pelikan Terrace')}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 pb-1.5">
                    <span className="text-stone-400">{t.booking.nameReceipt}:</span>
                    <span className="font-bold">{formData.name}</span>
                  </div>
                  {selectedTable && (
                    <div className="flex justify-between border-b border-stone-100 pb-1.5 items-center">
                      <span className="text-stone-400">{lang === 'sv' ? 'Valt bord:' : 'Selected table:'}</span>
                      <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-900/10 flex items-center gap-1">
                        {selectedTable.tableName}
                      </span>
                    </div>
                  )}
                  {formData.dietaryNotes && (
                    <div className="flex justify-between border-b border-stone-100 pb-1.5">
                      <span className="text-stone-400">{t.booking.dietReceipt}:</span>
                      <span className="font-bold text-amber-800">{formData.dietaryNotes}</span>
                    </div>
                  )}
                </div>

                {selectedTable && (
                  <div className="mt-4 p-2 bg-stone-50 border border-stone-100 rounded-lg flex items-center gap-3">
                    <div className="w-20 h-14 rounded overflow-hidden border border-stone-200 shrink-0">
                      <img 
                        src={selectedTable.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80"} 
                        alt={selectedTable.tableName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-[10px] font-mono leading-tight text-stone-600">
                      <p className="font-bold text-stone-850">{selectedTable.tableName}</p>
                      <p className="text-[9px] text-stone-500 mt-0.5">{selectedTable.description || (lang === 'sv' ? 'Exklusiv matplats' : 'Premium dining spot')}</p>
                    </div>
                  </div>
                )}

                {/* Important notice */}
                <div className="mt-4 p-3 bg-stone-50 border border-stone-100 rounded-lg text-[11px] text-stone-500 leading-normal font-mono">
                  {lang === 'sv' ? (
                    <>
                      • En bekräftelse har skickats till <span className="font-bold text-stone-700">{formData.email}</span>.<br />
                      • Bokningen är aktiv fram till kl. <span className="font-bold text-stone-700">{formData.time.split(':')[0]}:15</span>. Vänligen anmäl dig i receptionen i Stora Hallen.
                    </>
                  ) : (
                    <>
                      • A secure confirmation email has been sent to <span className="font-bold text-stone-700">{formData.email}</span>.<br />
                      • We hold tables for up to <span className="font-bold text-stone-700">15 minutes</span> after the reservation slot. Please proceed to the host desk upon arrival.
                    </>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      guests: 2,
                      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      time: '18:00',
                      area: 'Hall',
                      specialNotes: '',
                      dietaryNotes: ''
                    });
                    setStep(1);
                  }}
                  className="bg-stone-900 hover:bg-amber-900 border border-stone-800 text-amber-55 px-6 py-3 rounded-lg font-serif text-xs font-bold uppercase transition-all tracking-wider cursor-pointer"
                >
                  {t.booking.doneButton}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
