import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquare, Quote, Eye, Check, PenSquare, ArrowRight } from 'lucide-react';
import { TESTIMONIALS } from '../data/restaurantData';
import { Testimonial } from '../types';

export default function Testimonials() {
  const [reviews, setReviews] = useState<Testimonial[]>(TESTIMONIALS);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    rating: 5,
    comment: '',
    visitReason: 'Heritage Dinner',
    source: 'Google' as const
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successSubmit, setSuccessSubmit] = useState(false);

  const handleNextReview = () => {
    setActiveReviewIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrevReview = () => {
    setActiveReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewReview(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) {
      setErrorMsg('Vänligen fyll i både namn och kommentar • Please fill out name and comment.');
      return;
    }
    setErrorMsg('');

    const submitted: Testimonial = {
      id: `review-${reviews.length + 1}`,
      name: `${newReview.name} (${newReview.source === 'Google' ? 'Google Review' : newReview.source === 'TripAdvisor' ? 'TripAdvisor' : 'Stammis'})`,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0],
      source: newReview.source,
      visitReason: newReview.visitReason
    };

    setReviews(prev => [submitted, ...prev]);
    setSuccessSubmit(true);
    setTimeout(() => {
      setSuccessSubmit(false);
      setShowAddForm(false);
      setNewReview({
        name: '',
        rating: 5,
        comment: '',
        visitReason: 'Heritage Dinner',
        source: 'Google'
      });
      setActiveReviewIndex(0);
    }, 1500);
  };

  const currentReview = reviews[activeReviewIndex];

  return (
    <div id="social-proof-system" className="max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {!showAddForm ? (
          // TESTIMONIAL DISPLAY CAROUSEL
          <motion.div
            key="display-reviews"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-stone-900 border border-amber-500/10 rounded-2xl p-6 md:p-10 text-center relative shadow-xl overflow-hidden"
          >
            {/* Ambient visual background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <Quote className="w-12 h-12 text-[#a37c44] opacity-25 mx-auto mb-6" />

            <div className="min-h-[160px] " id="review-slider-window">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentReview.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Star Rating */}
                  <div className="flex justify-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < currentReview.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-700'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-stone-200 font-serif text-base md:text-lg leading-relaxed italic max-w-2xl mx-auto">
                    "{currentReview.comment}"
                  </p>

                  {/* Reviewer Details */}
                  <div className="pt-2">
                    <h5 className="font-mono text-[#a37c44] text-xs font-bold uppercase tracking-wider">
                      {currentReview.name}
                    </h5>
                    <p className="text-stone-500 text-[10px] mt-1 uppercase font-mono tracking-widest">
                      Reason: <span className="text-stone-400">{currentReview.visitReason}</span> • Sourced via {currentReview.source} ({currentReview.date})
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pagination Sliders */}
            <div className="flex justify-between items-center mt-8 border-t border-white/5 pt-6">
              <button
                onClick={() => setShowAddForm(true)}
                className="text-amber-300 hover:text-amber-100 flex items-center gap-1.5 text-xs font-mono font-medium uppercase tracking-widest"
              >
                <PenSquare className="w-3.5 h-3.5" />
                Skriv omdöme • Write review
              </button>

              <div className="flex items-center gap-4">
                <button
                  onClick={handlePrevReview}
                  className="w-8 h-8 rounded-full border border-stone-700 flex items-center justify-center text-stone-400 hover:bg-stone-800 hover:text-white transition-all font-mono"
                >
                  ‹
                </button>
                <span className="text-stone-500 font-mono text-xs">
                  {activeReviewIndex + 1} / {reviews.length}
                </span>
                <button
                  onClick={handleNextReview}
                  className="w-8 h-8 rounded-full border border-stone-700 flex items-center justify-center text-stone-400 hover:bg-stone-800 hover:text-white transition-all font-mono"
                >
                  ›
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          // USER WRITE SERVICE FORM
          <motion.form
            key="form-reviews"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleAddReview}
            className="bg-stone-900 border border-amber-500/15 rounded-2xl p-6 md:p-8 space-y-5 text-left shadow-xl"
            id="review-write-form"
          >
            <h4 className="font-serif text-lg text-amber-200 uppercase tracking-widest border-b border-white/5 pb-3">
              Dela din upplevelse • Write a Review
            </h4>

            {errorMsg && (
              <p className="text-red-400 bg-red-950/40 p-3 rounded-lg text-xs border border-red-900/30 font-mono">
                {errorMsg}
              </p>
            )}

            {successSubmit && (
              <p className="text-emerald-400 bg-emerald-950/40 p-3 rounded-lg text-xs border border-emerald-900/30 font-mono flex items-center gap-2">
                <Check className="w-4 h-4" />
                Omdöme tillagt! Tack för din feedback...
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-stone-400 font-mono text-[10px] uppercase tracking-widest">
                  Ditt Namn • Reviewer Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newReview.name}
                  onChange={handleFormInputChange}
                  placeholder="T.ex. Johan S. (Stockholm)"
                  className="w-full bg-stone-950 text-stone-200 border border-stone-800 rounded-lg p-3 text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-stone-400 font-mono text-[10px] uppercase tracking-widest">
                  Betyg • Rating Star Scale
                </label>
                <select
                  name="rating"
                  value={newReview.rating}
                  onChange={handleFormInputChange}
                  className="w-full bg-stone-950 text-stone-200 border border-stone-800 rounded-lg p-3 text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 - Utmärkt)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 - Mycket bra)</option>
                  <option value={3}>⭐⭐⭐ (3 - Medel)</option>
                  <option value={2}>⭐⭐ (2 - Mindre bra)</option>
                  <option value={1}>⭐ (1 - Behöver förbättras)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-stone-400 font-mono text-[10px] uppercase tracking-widest">
                  Anledning till besök • Visit Occasion
                </label>
                <select
                  name="visitReason"
                  value={newReview.visitReason}
                  onChange={handleFormInputChange}
                  className="w-full bg-stone-950 text-stone-200 border border-stone-800 rounded-lg p-3 text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="Heritage Dinner">Historisk Middag / Heritage Dinner</option>
                  <option value="Regular Family Friday">Fredagsmys / Regular Dinner</option>
                  <option value="Culinary Tour">Kulinarisk Resa / Foodie Tour</option>
                  <option value="Celebration">Firande / Celebration</option>
                  <option value="Quick Pint & SOS">Barmeny / Drink & Snacks</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-stone-400 font-mono text-[10px] uppercase tracking-widest">
                  Omdömesserie • Source Platform
                </label>
                <select
                  name="source"
                  value={newReview.source}
                  onChange={handleFormInputChange}
                  className="w-full bg-stone-950 text-stone-200 border border-stone-800 rounded-lg p-3 text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="Google">Google Review</option>
                  <option value="TripAdvisor">TripAdvisor</option>
                  <option value="Local Legend">Local Stammis (Krogvän)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-stone-400 font-mono text-[10px] uppercase tracking-widest">
                Dela upplevelse • Commentary
              </label>
              <textarea
                name="comment"
                value={newReview.comment}
                onChange={handleFormInputChange}
                rows={3}
                placeholder="Berätta om maten, servicen och miljön..."
                className="w-full bg-stone-950 text-stone-200 border border-stone-800 rounded-lg p-3 text-xs focus:outline-none focus:border-amber-500"
                required
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-stone-800 rounded-lg text-stone-400 hover:text-white transition-all text-xs font-mono uppercase"
              >
                Avbryt
              </button>
              <button
                type="submit"
                disabled={successSubmit}
                className="px-5 py-2.5 bg-amber-900 hover:bg-amber-800 text-amber-50 rounded-lg font-serif font-bold text-xs uppercase flex items-center gap-1.5 tracking-wide disabled:opacity-50"
              >
                Skicka omdöme
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
