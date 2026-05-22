import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, CreditCard, Sparkles, Send, Copy, Check, Download, Calendar, ArrowRight } from 'lucide-react';
import { GiftCardDetails } from '../types';
import { bookingStore } from '../utils/bookingStore';

interface GiftCardStudioProps {
  lang?: 'sv' | 'en';
}

export default function GiftCardStudio({ lang = 'sv' }: GiftCardStudioProps) {
  const config = bookingStore.getGiftVoucherConfig();
  const defaultPercentage = config.defaultPercentage;
  const isEnabled = config.isEnabled;

  const [card, setCard] = useState<GiftCardDetails>({
    amount: 1000,
    senderName: '',
    senderEmail: '',
    recipientName: '',
    recipientEmail: '',
    message: '',
    theme: 'classic',
    deliveryDate: new Date().toISOString().split('T')[0]
  });

  const [activeStep, setActiveStep] = useState<'design' | 'success'>('design');
  const [customAmount, setCustomAmount] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Dynamic voucher packages
  const [voucherOptions, setVoucherOptions] = useState(() => {
    return bookingStore.getVoucherBuyingOptions().filter(o => o.isEnabled);
  });
  const [selectedOptionId, setSelectedOptionId] = useState(() => {
    const opts = bookingStore.getVoucherBuyingOptions().filter(o => o.isEnabled);
    return opts[0]?.id || '';
  });

  // Load and refresh available voucher options
  useEffect(() => {
    const list = bookingStore.getVoucherBuyingOptions().filter(o => o.isEnabled);
    setVoucherOptions(list);
    if (list.length > 0 && !list.some(o => o.id === selectedOptionId)) {
      setSelectedOptionId(list[0].id);
    }
  }, [selectedOptionId]);

  const activeOption = voucherOptions.find(o => o.id === selectedOptionId) || voucherOptions[0];
  
  const getActivePercentage = () => {
    if (!card.senderEmail || !card.senderEmail.includes('@')) {
      return defaultPercentage;
    }
    const uType = bookingStore.checkUserType(card.senderEmail);
    return uType === 'first-time'
      ? (config.firstTimePercentage ?? 15)
      : (config.regularPercentage ?? 10);
  };

  const currentPercentage = getActivePercentage();
  const costToPay = activeOption ? activeOption.cost : card.amount;
  const faceValue = activeOption 
    ? Math.round(activeOption.cost * (1 + currentPercentage / 100)) 
    : Math.round(card.amount * (1 + currentPercentage / 100));


  // If gift vouchers are globally disabled in admin side settings
  if (!isEnabled) {
    return (
      <div className="bg-amber-50/40 border border-amber-900/10 rounded-2xl overflow-hidden shadow-xl" id="giftcard-studio">
        <div className="bg-stone-900 px-6 py-6 border-b border-amber-500/10 text-center relative">
          <h3 className="font-serif text-2xl tracking-wide text-amber-100 flex items-center justify-center gap-2">
            <Gift className="w-5 h-5 text-amber-500" />
            <span>{lang === 'sv' ? 'PRESENTKORT STUDION' : 'GIFT VOUCHER STUDIO'}</span>
          </h3>
          <p className="text-stone-400 text-xs mt-1 tracking-wider uppercase font-mono">Digital Gift Cards & Experiences • Pelikan Online Shop</p>
        </div>
        <div className="p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-900/10 rounded-full flex items-center justify-center mx-auto text-amber-900">
            <Gift className="w-8 h-8 text-amber-700" />
          </div>
          <h4 className="font-serif text-lg font-bold text-stone-900">
            {lang === 'sv' ? 'Presentkortsstudion är tillfälligt offline' : 'Gift Voucher Studio Temporarily Offline'}
          </h4>
          <p className="text-stone-600 text-xs leading-relaxed font-mono">
            {lang === 'sv' 
              ? 'Presentkortsstudion har inaktiverats av restaurangens administration för systemunderhåll. Vänligen köp presentkort direkt på plats i Stora Hallen eller kontakta hovmästaren på hovmastare@pelikan.se.' 
              : 'Our digital gift voucher shop is currently offline for system maintenance. Please buy coupons directly at the host stand, or send inquiries to hovmastare@pelikan.se.'}
          </p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCard(prev => ({ ...prev, [name]: value }));
  };

  const [showStripeForm, setShowStripeForm] = useState(false);
  const [cardNo, setCardNo] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardNameInput, setCardNameInput] = useState('');
  const [stripeError, setStripeError] = useState('');

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!card.senderName || !card.recipientName || !card.senderEmail || !card.recipientEmail) return;
    setCardNameInput(card.senderName);
    setStripeError('');
    setShowStripeForm(true);
  };

  const handleStripePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setStripeError('');

    const stripeConfig = bookingStore.getStripeConfig();
    const adminSmtp = bookingStore.getAdminProfile();
    const code = `PEL-${costToPay}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const response = await fetch('/api/stripe/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: costToPay,
          currency: 'SEK',
          recipientEmail: card.recipientEmail,
          recipientName: card.recipientName,
          senderEmail: card.senderEmail,
          senderName: card.senderName,
          voucherCode: code,
          stripeSecretKey: stripeConfig.secretKey
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Payment processing failed');
      }

      // Add to store
      bookingStore.addVoucher({
        id: `VCH-${Math.floor(1000 + Math.random() * 9000)}`,
        code: code,
        amount: costToPay,
        value: faceValue,
        recipientEmail: card.recipientEmail,
        recipientName: card.recipientName,
        createdAt: new Date().toISOString(),
        isEnabled: true
      });

      // Register transaction details
      bookingStore.addTransaction({
        id: data.chargeId || `ch_test_${Math.floor(100000 + Math.random() * 900000)}`,
        voucherCode: code,
        amount: costToPay,
        currency: 'SEK',
        recipientName: card.recipientName,
        recipientEmail: card.recipientEmail,
        senderName: card.senderName,
        senderEmail: card.senderEmail,
        createdAt: new Date().toISOString(),
        status: 'succeeded'
      });

      // Email body text
      const emailBody = `Hej ${card.recipientName}!

Du har fått ett digitalt presentkort på restaurang Krog Pelikan från ${card.senderName}!

PERSONLIG HÄLSNING:
"${card.message || 'Njut av en legendarisk kväll med Södermalms bästa husmanskost!'}"

DINA GÅVODETALJER:
• Unik presentkortskod: ${code}
• Inlöst värde: ${faceValue} SEK (Inkluderar extra ${defaultPercentage}% hovmästarbonus!)
• Giltighet: Gäller i 2 år vid bokning på Krog Pelikan i Stockholm.

Uppge bara koden ${code} när du ber om notan i restaurangen.

Varmt välkommen till oss på Blekingegatan 40!
Krog Pelikan, Stockholm`;

      // Dispatch via Express API SMTP Proxy
      try {
        const response = await fetch('/api/smtp/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            to: card.recipientEmail,
            subject: `Presentkort på Krog Pelikan mottaget! (Värde: ${faceValue} kr)`,
            body: emailBody,
            emailType: 'voucher',
            voucherDetails: {
              code: code,
              amount: card.amount,
              value: faceValue,
              percentage: defaultPercentage,
              senderName: card.senderName,
              recipientName: card.recipientName,
              message: card.message
            },
            fromName: `${card.senderName} via Pelikan`,
            fromEmail: adminSmtp.emailAddress,
            smtpHost: adminSmtp.smtpHost,
            smtpPort: adminSmtp.smtpPort,
            smtpUsername: adminSmtp.smtpUsername,
            smtpPassword: adminSmtp.smtpPassword,
            useSsl: adminSmtp.useSsl
          })
        });

        if (response.ok) {
          const data = await response.json();
          // Auto update the stored SMTP settings if credentials were corrected
          if (data && data.updatedUser && data.updatedPass && (data.updatedUser !== adminSmtp.smtpUsername || data.updatedPass !== adminSmtp.smtpPassword)) {
            const correctedProfile = {
              ...adminSmtp,
              smtpUsername: data.updatedUser,
              smtpPassword: data.updatedPass
            };
            bookingStore.saveAdminProfile(correctedProfile);
          }
        }
      } catch (err) {
        console.warn('SMTP failed, fallback locally:', err);
      }

      // Add local simulation email
      bookingStore.addEmail({
        to: card.recipientEmail,
        from: `${card.senderName} via Pelikan <${adminSmtp.emailAddress}>`,
        subject: `Presentkort på Krog Pelikan mottaget! (Värde: ${faceValue} kr)`,
        body: emailBody,
        type: 'voucher',
        voucherCode: code
      });

      setGeneratedCode(code);
      setIsProcessing(false);
      setShowStripeForm(false);
      setActiveStep('success');

    } catch (err: any) {
      console.error(err);
      setStripeError(err.message || 'Payment system error. Please inspect your keys.');
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Custom styling profiles for cards
  const themeStyles = {
    classic: {
      bg: 'bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900',
      border: 'border-amber-500/30',
      text: 'text-amber-100',
      accent: 'text-amber-500',
      label: 'text-stone-400',
      heading: 'font-serif text-amber-200'
    },
    golden: {
      bg: 'bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950',
      border: 'border-amber-400/40',
      text: 'text-amber-50',
      accent: 'text-amber-300',
      label: 'text-amber-200/50',
      heading: 'font-serif text-amber-300'
    },
    winter: {
      bg: 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900',
      border: 'border-cyan-500/25',
      text: 'text-slate-100',
      accent: 'text-cyan-400',
      label: 'text-slate-400',
      heading: 'font-serif text-slate-100'
    }
  };

  const style = themeStyles[card.theme];

  return (
    <div className="bg-amber-50/40 border border-amber-900/10 rounded-2xl overflow-hidden shadow-xl" id="giftcard-studio">
      <div className="bg-stone-900 px-6 py-6 border-b border-amber-500/10 text-center relative">
        <h3 className="font-serif text-2xl tracking-wide text-amber-100 flex items-center justify-center gap-2">
          <Gift className="w-5 h-5 text-amber-500 animate-bounce" />
          <span>{lang === 'sv' ? 'PRESENTKORT STUDION' : 'GIFT VOUCHER STUDIO'}</span>
        </h3>
        <p className="text-stone-400 text-xs mt-1 tracking-wider uppercase font-mono">Digital Gift Cards & Experiences • Pelikan Online Shop</p>
      </div>

      <div className="p-6 md:p-8">
        <AnimatePresence mode="wait">
          {activeStep === 'design' ? (
            <motion.div 
              key="design-step"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Side: Parameters Form */}
              <form onSubmit={handleCheckout} className="lg:col-span-7 space-y-5">
                {/* Option 1: Select Amount */}
                <div className="space-y-2">
                  <label className="block text-stone-800 text-sm font-semibold tracking-wide">
                    {lang === 'sv' ? '1. Välj Presentkort • Select Gift Voucher Package' : '1. Choose Package • Select Gift Voucher Option'}
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {voucherOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedOptionId(opt.id)}
                        className={`w-full text-left p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                          selectedOptionId === opt.id
                            ? 'bg-stone-900 border-[#a37c44] text-amber-100 shadow-md ring-1 ring-amber-500/30'
                            : 'bg-white border-stone-200 text-stone-700 hover:border-amber-900/50 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex justify-between w-full items-center">
                          <span className={`font-serif font-bold text-sm ${selectedOptionId === opt.id ? 'text-amber-200' : 'text-stone-900'}`}>
                            {lang === 'sv' ? opt.name : opt.swedishName}
                          </span>
                          <span className="font-mono font-extrabold text-amber-600">
                            {opt.cost} kr
                          </span>
                        </div>
                        {opt.description && (
                          <p className={`text-[11px] mt-1 font-sans ${selectedOptionId === opt.id ? 'text-stone-300' : 'text-stone-500'}`}>{opt.description}</p>
                        )}
                        <span className="text-[10px] font-mono text-emerald-600 mt-1.5 uppercase tracking-widest block font-bold">
                          {lang === 'sv' ? `Ger värde: ${opt.value} kr` : `Total Value: ${opt.value} kr`}
                        </span>
                      </button>
                    ))}
                    {voucherOptions.length === 0 && (
                      <p className="text-red-500 text-xs font-mono">{lang === 'sv' ? 'Inga aktiva presentkort tillgängliga just nu.' : 'No active gift cards available at this time.'}</p>
                    )}
                  </div>
                </div>

                {/* Option 2: Select Theme */}
                <div className="space-y-2">
                  <label className="block text-stone-800 text-sm font-semibold tracking-wide">
                    {lang === 'sv' ? '2. Välj Design-tema • Choose Card Theme' : '2. Choose Design Theme • Customize Layout'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'classic', text: lang === 'sv' ? 'Anrik Ek' : 'Södermalm Oak', borderClass: 'border-amber-700/50 bg-[#161413]' },
                      { id: 'golden', text: lang === 'sv' ? 'Gyllene Hallen' : 'Gold Velvet', borderClass: 'border-amber-400/50 bg-[#3a1900]' },
                      { id: 'winter', text: lang === 'sv' ? 'Norrsken Frost' : 'Nordic Frost', borderClass: 'border-cyan-500/30 bg-[#161a22]' }
                    ].map((themeOpt) => (
                      <button
                        key={themeOpt.id}
                        type="button"
                        onClick={() => setCard(p => ({ ...p, theme: themeOpt.id as any }))}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all cursor-pointer ${
                          card.theme === themeOpt.id 
                            ? `${themeOpt.borderClass} text-amber-100 ring-2 ring-amber-500/40 relative font-semibold` 
                            : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400'
                        }`}
                      >
                        <span className="text-[11px] uppercase tracking-wide">{themeOpt.text}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Option 3: Recipient & Sender Detail */}
                <div className="space-y-3.5 pt-1 border-t border-stone-100">
                  <label className="block text-stone-800 text-sm font-semibold tracking-wide">
                    {lang === 'sv' ? '3. Detaljer & Leverans • Recipients & Delivery' : '3. Info & Dispatch • Receipts Details'}
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono tracking-widest text-[#a37c44] font-bold block">{lang === 'sv' ? 'TILL / MOTTAGARE' : 'TO / RECIPIENT'}</span>
                      <input
                        type="text"
                        name="recipientName"
                        value={card.recipientName}
                        onChange={handleInputChange}
                        placeholder={lang === 'sv' ? 'Mottagarens namn...' : "Recipient name..."}
                        className="w-full bg-white text-stone-800 border border-stone-200 rounded-lg p-3 text-xs focus:outline-none focus:border-amber-900"
                        required
                      />
                      <input
                        type="email"
                        name="recipientEmail"
                        value={card.recipientEmail}
                        onChange={handleInputChange}
                        placeholder={lang === 'sv' ? 'Mottagarens e-post...' : "Recipient email..."}
                        className="w-full bg-white text-stone-800 border border-stone-200 rounded-lg p-3 text-xs focus:outline-none focus:border-amber-900"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] font-mono tracking-widest text-[#a37c44] font-bold block">{lang === 'sv' ? 'FRÅN / AVSÄNDARE' : 'FROM / SENDER'}</span>
                      <input
                        type="text"
                        name="senderName"
                        value={card.senderName}
                        onChange={handleInputChange}
                        placeholder={lang === 'sv' ? 'Ditt namn...' : 'Your name...'}
                        className="w-full bg-white text-stone-800 border border-stone-200 rounded-lg p-3 text-xs focus:outline-none focus:border-amber-900"
                        required
                      />
                      <input
                        type="email"
                        name="senderEmail"
                        value={card.senderEmail}
                        onChange={handleInputChange}
                        placeholder={lang === 'sv' ? 'Ditt e-post...' : 'Your email...'}
                        className="w-full bg-white text-stone-800 border border-stone-200 rounded-lg p-3 text-xs focus:outline-none focus:border-amber-900"
                        required
                      />
                      {card.senderEmail && card.senderEmail.includes('@') && (
                        <div className="text-[10px] text-amber-800 font-mono flex items-center gap-1 mt-1.5 transition-all">
                          <Sparkles className="w-3 h-3 text-amber-600 animate-pulse" />
                          <span>
                            {bookingStore.checkUserType(card.senderEmail) === 'first-time'
                              ? (lang === 'sv' 
                                  ? `✨ Ny gäst! Du beviljas +${config.firstTimePercentage ?? 15}% extra värde på din kupong.` 
                                  : `✨ New guest bonus! You are awarded +${config.firstTimePercentage ?? 15}% extra value.`)
                              : (lang === 'sv'
                                  ? `👑 Stammis! Du beviljas +${config.regularPercentage ?? 10}% extra stammis-värde.`
                                  : `👑 Regular guest! You are awarded +${config.regularPercentage ?? 10}% extra stammis-value.`)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Option 4: Personal Message */}
                <div className="space-y-2">
                  <label className="block text-stone-700 text-xs font-semibold tracking-wider uppercase">
                    {lang === 'sv' ? 'Skriv Hälsning • Custom Greeting Message (Optional)' : 'Write Personal Message • Specific Greetings'}
                  </label>
                  <textarea
                    name="message"
                    value={card.message}
                    onChange={handleInputChange}
                    rows={2}
                    maxLength={150}
                    placeholder={lang === 'sv' ? 'Grattis på födelsedagen! Njut av Sveriges bästa husmanskost...' : 'Happy birthday! Enjoy the iconic Swedish meatballs in Stockholm...'}
                    className="w-full bg-white text-stone-800 border border-stone-200 rounded-lg p-3 text-xs focus:outline-none focus:border-amber-900"
                  ></textarea>
                  <p className="text-[10px] text-right text-stone-400 font-mono">
                    {(card.message || '').length}/150 {lang === 'sv' ? 'tecken' : 'characters'}
                  </p>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-stone-900 hover:bg-amber-955 hover:bg-[#69481c] text-amber-50 py-4 px-6 rounded-xl font-bold font-serif tracking-widest shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 uppercase text-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-amber-100" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {lang === 'sv' ? 'Genererar presentkort...' : 'Generating coupon...'}
                      </span>
                    ) : (
                      <>
                        {lang === 'sv' ? 'Köp presentkort • Secure checkout' : 'Buy Gift Card • Secure Checkout'}
                        <ArrowRight className="w-4 h-4 text-amber-400" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Right Side: Virtual Card Live Rendering Viewer */}
              <div className="lg:col-span-5 flex flex-col justify-center items-center">
                <span className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-3 block">
                  {lang === 'sv' ? 'Live Förhandsgranskning' : 'Live Preview'}
                </span>

                {/* Elegant Interactive Card Shell */}
                <motion.div 
                  layout
                  className={`w-full max-w-[340px] aspect-[1.58/1] rounded-2xl border-2 p-6 shadow-2xl relative flex flex-col justify-between overflow-hidden transition-all duration-300 ${style.bg} ${style.border}`}
                >
                  {/* Watermark Crest */}
                  <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full border border-stone-100/5 flex items-center justify-center pointer-events-none">
                    <span className="text-[120px] opacity-5 select-none font-serif">P</span>
                  </div>

                  {/* Top: Card Branding */}
                  <div className="flex justify-between items-start z-10">
                    <div>
                      <h4 className="font-serif italic font-semibold text-lg leading-tight uppercase tracking-wider text-amber-100/95">
                        Krog Pelikan
                      </h4>
                      <p className="text-[8px] font-mono tracking-widest text-[#c29c5a] uppercase font-bold">
                        Stockholm • Södermalm
                      </p>
                    </div>
                    <Gift className={`w-5 h-5 ${style.accent}`} />
                  </div>

                  {/* Middle: Interactive recipient and amount banner with percentage bonus included */}
                  <div className="text-center z-10 my-1">
                    <span className={`block font-mono text-[10px] uppercase tracking-widest ${style.label}`}>
                      {lang === 'sv' ? 'GILTIGT VÄRDE BEKRÄFTAT' : 'CONFIRMED TOTAL FACE VALUE'}
                    </span>
                    <h5 className="font-mono text-3xl font-extrabold text-emerald-300 drop-shadow-sm tracking-wide">
                      {faceValue.toLocaleString()} <span className="text-sm font-sans font-medium text-amber-100">SEK</span>
                    </h5>
                    <span className="text-[10px] font-mono text-stone-400 block mt-0.5">
                      {lang === 'sv' ? `Kostar: ${costToPay.toLocaleString()} SEK` : `Price: ${costToPay.toLocaleString()} SEK`}
                    </span>
                  </div>

                  {/* Bottom: Custom Greeting and metadata */}
                  <div className="border-t border-stone-200/10 pt-2 flex justify-between items-end z-10">
                    <div className="max-w-[70%]">
                      <span className={`block text-[8px] font-mono tracking-widest uppercase ${style.label}`}>
                        {lang === 'sv' ? 'Mottagare:' : 'Recipient:'}
                      </span>
                      <span className={`font-serif text-sm block truncate font-medium ${style.text}`}>
                        {card.recipientName || (lang === 'sv' ? 'Ärad mottagare' : 'Recipient Name')}
                      </span>
                      {card.message && (
                        <span className="text-[8px] italic text-stone-300 block truncate leading-tight mt-0.5">
                          "{card.message}"
                        </span>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <span className={`block text-[8px] font-mono tracking-widest uppercase ${style.label}`}>
                        {lang === 'sv' ? 'Från:' : 'From:'}
                      </span>
                      <span className={`text-xs block truncate ${style.text}`}>
                        {card.senderName || (lang === 'sv' ? 'Givare' : 'Sender Name')}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Help guide descriptors */}
                <div className="mt-6 text-center text-stone-500 text-[11px] leading-relaxed max-w-xs font-mono">
                  <span className="text-amber-800 font-bold block mb-1">✓ INSTANT EMAIL DELIVERY</span>
                  {lang === 'sv' 
                    ? 'Presentkortet skickas helt digitalt till mottagarens e-post på önskat datum. Giltigt i två (2) år på Krog Pelikan.' 
                    : 'The voucher is delivered electronically directly to the recipient on the chosen date. Valid two (2) years.'}
                </div>
              </div>
            </motion.div>
          ) : (
            // SUCCESS CHECKOUT SCREEN!
            <motion.div 
              key="success-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-14 h-14 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-emerald-700" />
              </div>
              
              <h4 className="font-serif text-2xl font-bold text-stone-900 tracking-wide">{lang === 'sv' ? 'Betalning slutförd!' : 'Payment Complete!'}</h4>
              <p className="text-stone-500 text-xs mt-1 uppercase tracking-wider">Your digital presentkort is ready</p>

              {/* High Fidelity printable voucher */}
              <div className="bg-stone-955 bg-stone-950 text-stone-100 rounded-2xl max-w-lg mx-auto overflow-hidden shadow-2xl mt-8 border border-amber-500/20 text-left relative">
                {/* Visual top border */}
                <div className="h-2 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600"></div>
                
                <div className="p-6 md:p-8 space-y-6">
                  {/* Brand header */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div>
                      <h5 className="font-serif text-amber-200 text-lg uppercase tracking-wider">Krog Pelikan</h5>
                      <span className="font-mono text-[9px] text-[#c29c5a] uppercase font-bold tracking-widest">Digital Husmanskost Voucher</span>
                    </div>
                    <span className="font-mono text-2xl font-black text-amber-400">{faceValue} SEK</span>
                  </div>

                  {/* Body elements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-stone-500 block text-[9px] uppercase tracking-widest mb-0.5">{lang === 'sv' ? 'Kupongkod:' : 'Voucher Code:'}</span>
                      <div className="flex items-center gap-1.5 bg-white/5 p-2 rounded-lg border border-white/10">
                        <span className="font-bold text-amber-300 flex-1 truncate">{generatedCode}</span>
                        <button 
                          onClick={copyToClipboard}
                          className="p-1 hover:bg-white/10 rounded transition-all text-amber-500 relative group cursor-pointer"
                        >
                          {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-stone-500 block text-[9px] uppercase tracking-widest mb-0.5">{lang === 'sv' ? 'Mottagare:' : 'Recipient:'}</span>
                      <p className="p-2 bg-white/5 rounded-lg border border-white/10 text-stone-200 truncate font-semibold">
                        {card.recipientName} ({card.recipientEmail})
                      </p>
                    </div>
                  </div>

                  {/* Full quote details */}
                  <div className="bg-black/40 p-4 border border-white/5 rounded-xl text-xs space-y-2 leading-relaxed">
                    <p className="text-stone-300 font-serif italic text-sm">
                      "{card.message || (lang === 'sv' ? 'Denna kupong är redo för en fantastisk svensk kulinarisk upplevelse i Södermalm!' : 'Enjoy premium dining at Stockholm highest-rated historical beer hall!')}"
                    </p>
                    <p className="text-stone-500 text-[10px] pt-2 border-t border-white/5">
                      {lang === 'sv' ? 'Från:' : 'From:'} <span className="text-stone-300 font-semibold">{card.senderName}</span> | Epost: {card.senderEmail}
                    </p>
                  </div>

                  {/* Terms footer */}
                  <div className="text-[10px] text-stone-500 text-center font-mono space-y-1">
                    <p>• Licenstagare: Krog Pelikan, Blekingegatan 40, Södermalm, Stockholm.</p>
                    <p>{lang === 'sv' ? '• Kupongen kan lösas in mot mat, dryck och upplevelser över disk genom att ange bekräftat bevis.' : '• Redeemable for food, beverage, and events at Krog Pelikan by displaying code.'}</p>
                  </div>
                </div>
              </div>

              {/* Form redirectors */}
              <div className="mt-8 flex justify-center gap-3">
                <button
                  onClick={copyToClipboard}
                  className="bg-stone-100 hover:bg-stone-200 border text-stone-800 font-mono text-xs px-5 py-3 rounded-xl flex items-center gap-1.5 font-bold uppercase transition-all cursor-pointer"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {isCopied ? (lang === 'sv' ? 'Kopierad' : 'Copied') : (lang === 'sv' ? 'Kopiera kod' : 'Copy Code')}
                </button>
                <button
                  onClick={() => {
                    setCard({
                      amount: 1000,
                      senderName: '',
                      senderEmail: '',
                      recipientName: '',
                      recipientEmail: '',
                      message: '',
                      theme: 'classic',
                      deliveryDate: new Date().toISOString().split('T')[0]
                    });
                    setActiveStep('design');
                  }}
                  className="bg-amber-900 hover:bg-stone-900 text-amber-50 font-serif text-xs px-5 py-3 rounded-xl font-bold uppercase transition-all tracking-wider cursor-pointer"
                >
                  {lang === 'sv' ? 'Köp ett till presentkort' : 'Buy another gift voucher'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* STRIPE PAYMENT GATEWAY SECURE DRAWER MODAL */}
      <AnimatePresence>
        {showStripeForm && (
          <div className="fixed inset-0 bg-stone-955/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-stone-900 border border-amber-900/40 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gold Accent Top Bar */}
              <div className="h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600"></div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowStripeForm(false)}
                className="absolute right-4 top-5 p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="p-6 space-y-5">
                {/* Header branding */}
                <div className="text-center">
                  <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-2 text-amber-500">
                    <CreditCard className="w-5 h-5 animate-pulse" />
                  </div>
                  <h4 className="font-serif text-lg font-bold text-stone-100 uppercase tracking-widest">
                    {lang === 'sv' ? 'Säker Betalning' : 'Secure Checkout'}
                  </h4>
                  <p className="text-stone-400 font-mono text-[10px] uppercase tracking-wider">
                    Stripe TLS Credit Card Portal
                  </p>
                </div>

                {/* Amount segment */}
                <div className="bg-stone-950 border border-stone-850 p-4 rounded-xl flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-stone-500 font-mono uppercase tracking-wider block">Produkt / Digital Gåva</span>
                    <span className="text-stone-300 font-serif text-xs">Presentkort Krog Pelikan</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-500 font-mono uppercase tracking-wider block">Att betala</span>
                    <span className="text-amber-400 font-mono font-bold text-lg">{card.amount} SEK</span>
                  </div>
                </div>

                {/* Gateway credentials alert status */}
                <div className="p-2.5 bg-[#1a1c1d] border border-stone-800 rounded-lg text-[10.5px] font-mono flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-stone-300 truncate">
                    {bookingStore.getStripeConfig().secretKey ? (
                      <span className="text-emerald-400 font-bold">✓ Live Stripe Keys Configuration Active</span>
                    ) : (
                      <span className="text-amber-505 text-amber-500 font-semibold">🧪 Sandbox mode active (Test visa 4242)</span>
                    )}
                  </span>
                </div>

                {stripeError && (
                  <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded-lg text-xs font-mono">
                    ⚠️ {stripeError}
                  </div>
                )}

                {/* Real-time card fields */}
                <form onSubmit={handleStripePaymentSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-stone-300 text-xs font-mono uppercase tracking-wider">Kortinnehavare (Cardholder Name)</label>
                    <input
                      type="text"
                      required
                      value={cardNameInput}
                      onChange={(e) => setCardNameInput(e.target.value)}
                      placeholder="t.ex. Johan Silfver"
                      className="w-full bg-stone-950 border border-stone-850 text-stone-150 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-stone-300 text-xs font-mono uppercase tracking-wider">Kortnummer (Card Number)</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={19}
                        value={cardNo}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          const blocks: string[] = [];
                          for (let i = 0; i < val.length; i += 4) {
                            blocks.push(val.substring(i, i + 4));
                          }
                          setCardNo(blocks.join(' '));
                        }}
                        placeholder="4242 4242 4242 4242"
                        className="w-full bg-stone-950 border border-stone-850 text-stone-150 rounded-lg pl-3 pr-10 py-2.5 text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                      <span className="absolute right-3 top-2.5">
                        <CreditCard className="w-5 h-5 text-amber-500/60" />
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-stone-300 text-xs font-mono uppercase tracking-wider">Giltighetstid (MM/YY)</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        placeholder="12/28"
                        value={cardExpiry}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length > 2) {
                            setCardExpiry(`${val.substring(0, 2)}/${val.substring(2, 4)}`);
                          } else {
                            setCardExpiry(val);
                          }
                        }}
                        className="w-full bg-stone-955 bg-stone-950 border border-stone-850 text-stone-150 rounded-lg px-3 py-2.5 text-xs font-mono text-center focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-stone-300 text-xs font-mono uppercase tracking-wider">Kortkod (CVC / CVV)</label>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        placeholder="123"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-stone-955 bg-stone-950 border border-stone-850 text-stone-150 rounded-lg px-3 py-2.5 text-xs font-mono text-center focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Payment button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3 rounded-xl text-xs font-mono uppercase font-black tracking-widest shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold"
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-slate-955 text-slate-950" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Sänder Transaktion...</span>
                        </span>
                      ) : (
                        <span>🔒 SÄKER BETALNING ({card.amount} SEK)</span>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => setShowStripeForm(false)}
                      className="w-full text-center text-[10.5px] text-stone-500 hover:text-stone-400 font-mono uppercase tracking-wide block mt-3 cursor-pointer"
                    >
                      Avbryt köp
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
