import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, Phone, Lock, CheckCircle2, AlertCircle, LogOut, 
  Trash2, CreditCard, Ticket, Calendar, Clock, RefreshCw, X, 
  Sparkles, ShieldCheck, ChevronRight, Clipboard, Gift
} from 'lucide-react';
import { bookingStore, cookieHelper } from '../utils/bookingStore';
import { BookingDetails, AdminVoucher, StripeTransaction } from '../types';

interface CustomerDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'sv' | 'en';
}

export default function CustomerDashboard({ isOpen, onClose, lang }: CustomerDashboardProps) {
  // Session State
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [step, setStep] = useState<'login' | 'signup' | 'forgot' | 'reset' | 'dashboard'>('login');
  
  // Login & Sign up States
  const [emailForm, setEmailForm] = useState('');
  const [passwordForm, setPasswordForm] = useState('');
  const [nameForm, setNameForm] = useState('');
  const [phoneForm, setPhoneForm] = useState('');
  const [resetCodeForm, setResetCodeForm] = useState('');
  const [newPasswordForm, setNewPasswordForm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dashboard Data States (Loaded after login)
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [coupons, setCoupons] = useState<AdminVoucher[]>([]);
  const [transactions, setTransactions] = useState<StripeTransaction[]>([]);
  
  // Profile editing flag
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Voucher checking/claiming popup states
  const [isClaimPopupOpen, setIsClaimPopupOpen] = useState(false);
  const [claimCodeInput, setClaimCodeInput] = useState('');
  const [checkedVoucherResult, setCheckedVoucherResult] = useState<any | null>(null);
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState('');

  // Password reset OTP state
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  // Initial load check for cookie-based session
  useEffect(() => {
    if (isOpen) {
      const savedSession = cookieHelper.get('pelikan_user_session');
      if (savedSession) {
        setCurrentUserEmail(savedSession);
        setStep('dashboard');
        loadUserData(savedSession);
      } else {
        setStep('login');
      }
    }
  }, [isOpen]);

  // Load user details, bookings, coupons and transactions matching the user's email
  const loadUserData = (email: string) => {
    const emailLower = email.toLowerCase();
    
    // 1. Load Custom Profile Name / Phone or scan existing bookings for defaults
    const profiles = JSON.parse(localStorage.getItem('pelikan_user_profiles') || '{}');
    const userProfile = profiles[emailLower];
    
    // Scan booking store
    const allBookings = bookingStore.getBookings();
    const userBookingsMatch = allBookings.filter(b => b.email.toLowerCase() === emailLower);
    
    // Sort bookings by date descending
    userBookingsMatch.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setBookings(userBookingsMatch);

    let defaultName = '';
    let defaultPhone = '';
    if (userProfile) {
      defaultName = userProfile.name || '';
      defaultPhone = userProfile.phone || '';
    } else if (userBookingsMatch.length > 0) {
      defaultName = userBookingsMatch[0].name;
      defaultPhone = userBookingsMatch[0].phone;
    }

    setProfileName(defaultName);
    setProfilePhone(defaultPhone);
    setEditName(defaultName);
    setEditPhone(defaultPhone);

    // 2. Load coupons
    const allVouchers = bookingStore.getVouchers();
    const userVouchersMatch = allVouchers.filter(v => 
      v.recipientEmail.toLowerCase() === emailLower || 
      v.claimedByEmail?.toLowerCase() === emailLower
    );
    setCoupons(userVouchersMatch);

    // 3. Load transactions
    const allTx = bookingStore.getTransactions();
    const userTxMatch = allTx.filter(t => t.recipientEmail.toLowerCase() === emailLower || t.senderEmail.toLowerCase() === emailLower);
    setTransactions(userTxMatch);
  };

  // Handle Customer Sign Up
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm || !emailForm.includes('@')) {
      setErrorMsg(lang === 'sv' ? 'Vänligen ange en giltig e-postadress.' : 'Please enter a valid email address.');
      return;
    }
    if (!passwordForm || passwordForm.length < 4) {
      setErrorMsg(lang === 'sv' ? 'Lösenordet måste vara minst 4 tecken.' : 'Password must be at least 4 characters.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    setTimeout(() => {
      const res = bookingStore.customerSignUp(nameForm, emailForm, phoneForm, passwordForm);
      if (res.success) {
        setSuccessMsg(lang === 'sv' ? 'Registrering lyckades! Du kan nu logga in.' : 'Registration successful! You may now log in.');
        setStep('login');
      } else {
        setErrorMsg(res.message);
      }
      setLoading(false);
    }, 1000);
  };

  // Handle Customer Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm || !emailForm.includes('@')) {
      setErrorMsg(lang === 'sv' ? 'Vänligen ange en giltig e-postadress.' : 'Please enter a valid email address.');
      return;
    }
    if (!passwordForm) {
      setErrorMsg(lang === 'sv' ? 'Vänligen ange ditt lösenord.' : 'Please enter your password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    setTimeout(() => {
      const res = bookingStore.customerLogin(emailForm, passwordForm);
      if (res.success && res.customer) {
        cookieHelper.set('pelikan_user_session', emailForm, 30);
        setCurrentUserEmail(emailForm);
        setStep('dashboard');
        loadUserData(emailForm);
        setSuccessMsg(lang === 'sv' ? 'Välkommen tillbaka!' : 'Welcome back!');
      } else {
        setErrorMsg(res.message);
      }
      setLoading(false);
    }, 1000);
  };

  // Handle Forgot Password
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm || !emailForm.includes('@')) {
      setErrorMsg(lang === 'sv' ? 'Vänligen ange en giltig e-postadress.' : 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    setTimeout(() => {
      const res = bookingStore.initiatePasswordReset(emailForm);
      if (res.success) {
        setSuccessMsg(
          lang === 'sv'
            ? 'En 6-siffrig återställningskod har skickats till din e-post!'
            : 'A 6-digit verification code has been dispatched to your email!'
        );
        setStep('reset');
        setIsOtpVerified(false);
        setResetCodeForm('');
        setNewPasswordForm('');
      } else {
        setErrorMsg(res.message);
      }
      setLoading(false);
    }, 1000);
  };

  // Handle Verify Reset OTP Code
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCodeForm.trim()) {
      setErrorMsg(lang === 'sv' ? 'Mata in koden (OTP) först.' : 'Please enter the code (OTP) first.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    setTimeout(() => {
      const res = bookingStore.verifyResetCode(emailForm, resetCodeForm);
      if (res.success) {
        setSuccessMsg(
          lang === 'sv'
            ? 'Koden har verifierats! Vänligen fyll i ditt nya maffiga lösenord nedan.'
            : 'Verification code approved! Please specify your new account password below.'
        );
        setIsOtpVerified(true);
      } else {
        setErrorMsg(res.message);
      }
      setLoading(false);
    }, 1000);
  };

  // Handle Reset password with Code (final password submission)
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOtpVerified) {
      setErrorMsg(lang === 'sv' ? 'Verifiera koden (OTP) först.' : 'Please verify the code (OTP) first.');
      return;
    }
    if (!newPasswordForm || newPasswordForm.length < 4) {
      setErrorMsg(lang === 'sv' ? 'Det nya lösenordet måste vara minst 4 tecken.' : 'New password must be at least 4 characters.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    setTimeout(() => {
      const res = bookingStore.resetPasswordWithCode(emailForm, resetCodeForm, newPasswordForm);
      if (res.success) {
        setSuccessMsg(res.message);
        setStep('login');
        setPasswordForm('');
        setResetCodeForm('');
        setNewPasswordForm('');
        setIsOtpVerified(false);
      } else {
        setErrorMsg(res.message);
      }
      setLoading(false);
    }, 1000);
  };

  // Handle Profile Update
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserEmail) return;

    const emailLower = currentUserEmail.toLowerCase();
    const profiles = JSON.parse(localStorage.getItem('pelikan_user_profiles') || '{}');
    profiles[emailLower] = {
      name: editName,
      phone: editPhone
    };
    localStorage.setItem('pelikan_user_profiles', JSON.stringify(profiles));
    
    setProfileName(editName);
    setProfilePhone(editPhone);
    setIsEditingProfile(false);
    setSuccessMsg(lang === 'sv' ? 'Profilen uppdaterades framgångsrikt!' : 'Profile updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCheckVoucherCode = () => {
    setClaimError('');
    setClaimSuccess('');
    if (!claimCodeInput.trim()) {
      setClaimError(lang === 'sv' ? 'Mata in koden först!' : 'Please enter the code first!');
      setCheckedVoucherResult(null);
      return;
    }
    const clean = claimCodeInput.trim().toUpperCase();
    const allV = bookingStore.getVouchers();
    const match = allV.find(v => v.code.toUpperCase().trim() === clean);
    if (!match) {
      setClaimError(lang === 'sv' ? 'Det aktuella presentkortet hittades inte. Kontrollera koden.' : 'Voucher code not found. Please double check.');
      setCheckedVoucherResult(null);
      return;
    }
    if (match.isClaimed) {
      setClaimError(lang === 'sv' ? 'Koden har redan lösts in mot en nota i restaurangen.' : 'This code has already been redeemed here.');
      setCheckedVoucherResult(null);
      return;
    }
    if (!match.isEnabled) {
      setClaimError(lang === 'sv' ? 'Detta presentkort är inaktiverat av administratör.' : 'This voucher has been disabled by an admin.');
      setCheckedVoucherResult(null);
      return;
    }
    setCheckedVoucherResult(match);
  };

  const handleClaimVoucherToAccount = () => {
    if (!checkedVoucherResult || !currentUserEmail) return;
    const updated = {
      ...checkedVoucherResult,
      recipientEmail: currentUserEmail.toLowerCase().trim(),
      claimedByEmail: currentUserEmail.toLowerCase().trim()
    };
    bookingStore.updateVoucher(updated);
    
    bookingStore.addStaffLog('System', `Kopplade presentkod ${updated.code} (${updated.value || updated.amount} kr) till gästen ${profileName || currentUserEmail}`);
    
    setClaimSuccess(lang === 'sv' ? 'Presentkortet har framgångsrikt kopplats till ditt konto!' : 'Successfully claimed and linked voucher to your balance!');
    setCheckedVoucherResult(null);
    loadUserData(currentUserEmail);
  };

  // Cancel live reservation from client side
  const handleCancelReservation = (bookingId: string) => {
    if (!bookingId) return;
    const confirmCancel = window.confirm(
      lang === 'sv' 
        ? 'Är du säker på att du vill avboka denna reservation?' 
        : 'Are you sure you want to cancel this reservation?'
    );
    if (!confirmCancel) return;

    bookingStore.updateBookingStatus(bookingId, 'cancelled');
    if (currentUserEmail) {
      loadUserData(currentUserEmail);
    }
    alert(lang === 'sv' ? 'Reservationen har avbokats och en bekräftelse skickats.' : 'Reservation cancelled successfully.');
  };

  // Log out of My Pelikan
  const handleLogActiveUserOut = () => {
    cookieHelper.delete('pelikan_user_session');
    setCurrentUserEmail(null);
    setEmailForm('');
    setPasswordForm('');
    setNameForm('');
    setPhoneForm('');
    setResetCodeForm('');
    setNewPasswordForm('');
    setBookings([]);
    setCoupons([]);
    setTransactions([]);
    setStep('login');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const totalVoucherBalance = coupons
    .filter(c => c.isEnabled && !c.isClaimed)
    .reduce((sum, c) => sum + (c.value || c.amount), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl bg-[#fcfbfa] border-2 border-stone-200 shadow-2xl rounded-2xl overflow-hidden text-stone-900"
      >
        {/* Modal Header */}
        <div className="bg-stone-900 text-amber-50 px-6 py-5 flex items-center justify-between border-b-2 border-amber-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-900/40 rounded-lg">
              <User className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-serif text-lg tracking-wider font-bold">
                {lang === 'sv' ? 'MITT PELIKAN • GÄSTPORTAL' : 'MY PELIKAN • CUSTOMER PORTAL'}
              </h3>
              <p className="text-[10px] font-mono tracking-widest text-amber-500 uppercase font-bold mt-0.5">
                {lang === 'sv' ? 'Din anrika mötesplats sedan 1664' : 'Your home of Swedish dining since 1664'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 px-2.5 bg-stone-800 hover:bg-stone-700 rounded-lg border border-stone-700 transition-colors text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8">
          
          {/* Notifications Alerts */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-800 rounded-xl text-xs md:text-sm flex items-center gap-2.5 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 rounded-xl text-xs md:text-sm flex items-center gap-2.5 font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0 animate-bounce" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: LOGIN CASE */}
          {step === 'login' && (
            <div className="max-w-md mx-auto py-8 text-center space-y-6">
              <div className="mx-auto w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-900/10">
                <Lock className="w-6 h-6 text-amber-800" />
              </div>
              <div className="space-y-2">
                <h4 className="font-serif text-xl font-bold tracking-tight">
                  {lang === 'sv' ? 'Logga in på Mitt Pelikan' : 'Log in to My Pelikan'}
                </h4>
                <p className="text-stone-500 text-xs md:text-sm">
                  {lang === 'sv' 
                    ? 'Ange din e-postadress och ditt lösenord för att administrera dina bokningar och presentkort.' 
                    : 'Provide your email address and password to manage your reservations and gift vouchers.'}
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 pt-4 text-left">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-widest text-stone-600 mb-1.5">
                    {lang === 'sv' ? 'E-postadress' : 'Email Address'}
                  </label>
                  <input 
                    type="email" 
                    required
                    placeholder="t.ex. gäst@domän.se" 
                    value={emailForm}
                    onChange={(e) => setEmailForm(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-amber-800 text-sm focus:outline-none transition-all outline-none font-medium text-stone-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-widest text-stone-600 mb-1.5">
                    {lang === 'sv' ? 'Lösenord' : 'Password'}
                  </label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••" 
                    value={passwordForm}
                    onChange={(e) => setPasswordForm(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-amber-800 text-sm focus:outline-none transition-all outline-none font-medium text-stone-800 bg-white"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-stone-900 border border-stone-800 text-amber-100 hover:bg-amber-900 hover:border-amber-950 font-mono tracking-widest uppercase font-bold text-xs py-3.5 rounded-xl cursor-pointer shadow-sm transition-all text-center"
                >
                  {loading ? (lang === 'sv' ? 'LOGGAR IN...' : 'LOGGING IN...') : (lang === 'sv' ? 'LOGGA IN' : 'SIGN IN')}
                </button>
              </form>

              <div className="flex flex-col gap-2 pt-2 text-xs text-center select-none font-mono animate-fade-in">
                <button 
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setStep('signup');
                  }}
                  className="text-[#a37c44] hover:text-[#7d5d2e] underline bg-transparent border-0 cursor-pointer"
                >
                  {lang === 'sv' ? 'Inget lösenordskonto än? Skapa konto här' : 'No account yet? Register here'}
                </button>
                <button 
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setStep('forgot');
                  }}
                  className="text-stone-500 hover:text-stone-700 underline text-[11px] bg-transparent border-0 cursor-pointer"
                >
                  {lang === 'sv' ? 'Glömt ditt lösenord?' : 'Forgot your password?'}
                </button>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[10px] font-mono text-stone-500 flex items-center justify-center gap-1.5 select-none mt-4">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{lang === 'sv' ? 'Inloggade gäster sparas i säkra cookies lokalt på din webbläsare.' : 'Logged sessions are securely persisted locally via browser cookies.'}</span>
              </div>
            </div>
          )}

          {/* STEP 2: SIGN UP CASE */}
          {step === 'signup' && (
            <div className="max-w-md mx-auto py-8 text-center space-y-6">
              <div className="mx-auto w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-900/10">
                <User className="w-6 h-6 text-amber-800" />
              </div>
              <div className="space-y-2">
                <h4 className="font-serif text-xl font-bold tracking-tight">
                  {lang === 'sv' ? 'Skapa ett nytt gästkonto' : 'Create Guest Account'}
                </h4>
                <p className="text-stone-500 text-xs md:text-sm">
                  {lang === 'sv' 
                    ? 'Efter registrering kan du följa alla dina bordsbokningar, transaktionshistorik och presentkort.' 
                    : 'Register to easily track past and upcoming reservations, transaction logs, and digital coupons.'}
                </p>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4 pt-2 text-left">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-widest text-stone-600 mb-1">
                    {lang === 'sv' ? 'Fullständigt Namn' : 'Full Name'}
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="t.ex. Johan Silfver" 
                    value={nameForm}
                    onChange={(e) => setNameForm(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus-border-amber-800 text-sm focus:outline-none transition-all outline-none font-medium text-stone-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-widest text-stone-600 mb-1">
                    {lang === 'sv' ? 'E-postadress' : 'Email Address'}
                  </label>
                  <input 
                    type="email" 
                    required
                    placeholder="t.ex. din_e-post@domän.se" 
                    value={emailForm}
                    onChange={(e) => setEmailForm(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus-border-amber-800 text-sm focus:outline-none transition-all outline-none font-medium text-stone-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-widest text-stone-600 mb-1">
                    {lang === 'sv' ? 'Mobilnummer' : 'Phone Number'}
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="t.ex. 0701234567" 
                    value={phoneForm}
                    onChange={(e) => setPhoneForm(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus-border-amber-800 text-sm focus:outline-none transition-all outline-none font-medium text-stone-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-widest text-stone-600 mb-1">
                    {lang === 'sv' ? 'Lösenord' : 'Password'}
                  </label>
                  <input 
                    type="password" 
                    required
                    placeholder="Minst 4 tecken" 
                    value={passwordForm}
                    onChange={(e) => setPasswordForm(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus-border-amber-800 text-sm focus:outline-none transition-all outline-none font-medium text-stone-800 bg-white"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-stone-900 border border-stone-800 text-amber-100 hover:bg-amber-900 hover:border-amber-950 font-mono tracking-widest uppercase font-bold text-xs py-3 rounded-xl cursor-pointer shadow-sm transition-all text-center font-bold"
                >
                  {loading ? (lang === 'sv' ? 'SKAPAR GÄSTPROFIL...' : 'CREATING PATRON PROFILE...') : (lang === 'sv' ? 'SLUTFÖR REGISTRERING' : 'SIGN UP & JOIN')}
                </button>
              </form>

              <div className="pt-2 text-xs text-center select-none font-mono">
                <button 
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setStep('login');
                  }}
                  className="text-[#a37c44] hover:text-[#7d5d2e] underline bg-transparent border-0 cursor-pointer"
                >
                  {lang === 'sv' ? 'Har du redan ett konto? Logga in' : 'Already registered? Log in here'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: FORGOT PASSWORD CASE */}
          {step === 'forgot' && (
            <div className="max-w-md mx-auto py-8 text-center space-y-6">
              <div className="mx-auto w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-900/10">
                <Mail className="w-6 h-6 text-amber-800" />
              </div>
              <div className="space-y-2">
                <h4 className="font-serif text-xl font-bold tracking-tight">
                  {lang === 'sv' ? 'Återställ Lösenord' : 'Reset your password'}
                </h4>
                <p className="text-stone-500 text-xs md:text-sm">
                  {lang === 'sv' 
                    ? 'Ange din e-postadress. Vi skickar en 6-siffrig återställningskod direkt så att du kan sätta ett nytt säkert lösenord.' 
                    : 'Provide your email address to receive an instant 6-digit recovery code.'}
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4 pt-4 text-left">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-widest text-[#stone-600] mb-1.5">
                    {lang === 'sv' ? 'E-postadress' : 'Email Address'}
                  </label>
                  <input 
                    type="email" 
                    required
                    placeholder="din_epost@adress.se" 
                    value={emailForm}
                    onChange={(e) => setEmailForm(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-amber-800 text-sm focus:outline-none transition-all outline-none font-medium text-stone-800 bg-white"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-stone-900 border border-stone-800 text-amber-100 hover:bg-amber-900 hover:border-amber-950 font-mono tracking-widest uppercase font-bold text-xs py-3.5 rounded-xl cursor-pointer shadow-sm transition-all text-center font-bold"
                >
                  {loading ? (lang === 'sv' ? 'SKICKAR KOD...' : 'DISPATCHING CODE...') : (lang === 'sv' ? 'SKICKA ÅTERSTÄLLNINGSKOD' : 'SEND DISPATCH CODE')}
                </button>
              </form>

              <div className="pt-2 text-xs text-center select-none font-mono">
                <button 
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setStep('login');
                  }}
                  className="text-stone-500 hover:text-stone-800 underline bg-transparent border-0 cursor-pointer"
                >
                  {lang === 'sv' ? '← Tillbaka till logga in' : '← Back to log in'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: RESET ACTION KEY CASE */}
          {step === 'reset' && (
            <div className="max-w-md mx-auto py-8 text-center space-y-6">
              <div className="mx-auto w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-900/10">
                <ShieldCheck className="w-6 h-6 text-amber-800" />
              </div>

              {!isOtpVerified ? (
                /* Step 4a: Enter and Verify OTP Code */
                <>
                  <div className="space-y-2">
                    <h4 className="font-serif text-xl font-bold tracking-tight">
                      {lang === 'sv' ? 'Verifiera återställningskod (OTP)' : 'Verify recovery OTP'}
                    </h4>
                    <p className="text-stone-500 text-xs md:text-sm">
                      {lang === 'sv' 
                        ? `Vi har skickat en 6-siffrig engångskod till ${emailForm}. Kontrollera din skickade e-postlogg under Adminpanelen.`
                        : `We dispatched a 6-digit verification code to ${emailForm}. lookup the message inside the E-post log.`}
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2 text-left">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-widest text-stone-600 mb-1 font-bold">
                        {lang === 'sv' ? 'Återställningskod (OTP)' : 'Verification Code (OTP)'}
                      </label>
                      <input 
                        type="text" 
                        required
                        maxLength={6}
                        placeholder="••••••" 
                        value={resetCodeForm}
                        onChange={(e) => setResetCodeForm(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center tracking-[0.5em] px-4 py-2.5 rounded-xl border border-stone-200 focus:border-amber-800 text-lg focus:outline-none transition-all outline-none font-bold text-stone-800 bg-white"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-stone-900 border border-stone-800 text-amber-100 hover:bg-amber-950 font-mono tracking-widest uppercase font-bold text-xs py-3.5 rounded-xl cursor-pointer shadow-sm transition-all text-center font-bold"
                    >
                      {loading ? (lang === 'sv' ? 'VERIFIERAR...' : 'VERIFYING...') : (lang === 'sv' ? 'VERIFIERA KOD' : 'VERIFY CODE')}
                    </button>
                  </form>
                </>
              ) : (
                /* Step 4b: OTP verified, specify new password */
                <>
                  <div className="space-y-2">
                    <h4 className="font-serif text-xl font-bold tracking-tight text-emerald-800">
                      {lang === 'sv' ? 'Välj nytt lösenord' : 'Choose New Password'}
                    </h4>
                    <p className="text-stone-500 text-xs md:text-sm">
                      {lang === 'sv' 
                        ? 'Din kod har godkänts! Ange ditt nya säkra lösenord nedan för att slutföra återställningen.'
                        : 'Your code is approved! Enter your new secure account password to finish.'}
                    </p>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-4 pt-2 text-left">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-widest text-[#stone-600] mb-1 text-stone-600 font-bold">
                        {lang === 'sv' ? 'Nytt Lösenord' : 'New Password'}
                      </label>
                      <input 
                        type="password" 
                        required
                        placeholder="Minst 4 tecken" 
                        value={newPasswordForm}
                        onChange={(e) => setNewPasswordForm(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-amber-800 text-sm focus:outline-none transition-all outline-none font-medium text-stone-800 bg-white"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-stone-900 border border-stone-800 text-amber-100 hover:bg-amber-900 hover:border-amber-950 font-mono tracking-widest uppercase font-bold text-xs py-3 rounded-xl cursor-pointer shadow-sm transition-all text-center font-bold"
                    >
                      {loading ? (lang === 'sv' ? 'SPARAR...' : 'SAVING...') : (lang === 'sv' ? 'ÄNDRA LÖSENORD' : 'CHANGE PASSWORD')}
                    </button>
                  </form>
                </>
              )}

              <div className="pt-2 text-xs text-center select-none font-mono">
                <button 
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setStep('login');
                    setIsOtpVerified(false);
                  }}
                  className="text-stone-500 hover:text-stone-800 underline bg-transparent border-0 cursor-pointer"
                >
                  {lang === 'sv' ? '← Avbryt och logga in' : '← Cancel and log in'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: CUSTOMER AUTHENTICATED DASHBOARD */}
          {step === 'dashboard' && currentUserEmail && (
            <div className="space-y-8">
              
              {/* Profile Card Summary */}
              <div className="p-6 bg-stone-900 text-stone-50 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-2 border-amber-800 select-none">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-amber-900/50 flex items-center justify-center border border-amber-700">
                    <span className="font-serif text-lg font-bold text-amber-300">
                      {profileName ? profileName.substring(0, 2).toUpperCase() : currentUserEmail.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold flex items-center gap-2">
                      <span>{profileName || (lang === 'sv' ? 'Anrik Vän av Pelikan' : 'Honored Patron')}</span>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    </h4>
                    <p className="font-mono text-xs text-stone-400 flex items-center gap-1.5 mt-1.5">
                      <Mail className="w-3.5 h-3.5" /> {currentUserEmail}
                    </p>
                    {profilePhone && (
                      <p className="font-mono text-xs text-stone-400 flex items-center gap-1.5 mt-1">
                        <Phone className="w-3.5 h-3.5" /> {profilePhone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Profile Controls / Log out */}
                <div className="flex gap-2.5">
                  <button 
                    onClick={() => {
                      setIsEditingProfile(!isEditingProfile);
                    }}
                    className="px-4 py-2 border border-stone-700 hover:border-amber-400/50 rounded-xl text-stone-300 hover:text-white text-xs font-mono transition-colors cursor-pointer bg-stone-800"
                  >
                    {isEditingProfile ? (lang === 'sv' ? 'Stäng redigering' : 'Cancel Edit') : (lang === 'sv' ? 'Redigera Profil' : 'Edit Profile')}
                  </button>
                  <button 
                    onClick={handleLogActiveUserOut}
                    className="px-4 py-2 bg-amber-900/80 border border-amber-800 text-amber-100 hover:bg-red-900 rounded-xl text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" /> 
                    <span>{lang === 'sv' ? 'Logga ut' : 'Log out'}</span>
                  </button>
                </div>
              </div>

              {/* Editing Form Overlay */}
              {isEditingProfile && (
                <div className="p-5 bg-stone-100 rounded-2xl border border-stone-200">
                  <h5 className="font-serif font-bold text-base mb-3 text-stone-800">
                    {lang === 'sv' ? 'Uppdatera dina profiluppgifter' : 'Update your profile details'}
                  </h5>
                  <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-widest text-stone-600 mb-1">
                        {lang === 'sv' ? 'Fullständigt Namn' : 'Full Name'}
                      </label>
                      <input 
                        type="text" 
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-stone-500 bg-white"
                        placeholder="t.ex. Anantharaj"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-widest text-stone-600 mb-1">
                        {lang === 'sv' ? 'Mobilnummer' : 'Phone Number'}
                      </label>
                      <input 
                        type="text" 
                        required
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-stone-500 bg-white"
                        placeholder="+46 8 556 413 10"
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <button 
                        type="submit"
                        className="px-5 py-2.5 bg-stone-900 text-amber-50 font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow cursor-pointer hover:bg-amber-900 transition-colors"
                      >
                        {lang === 'sv' ? 'SPARA ÄNDRINGAR' : 'SAVE CHANGES'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Interactive Balance & Claims Board */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-amber-900 to-[#5c3e21] text-amber-50 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden border border-amber-800">
                  <div className="space-y-1 z-10 select-none">
                    <span className="text-[10px] font-mono tracking-widest text-amber-300 uppercase font-black">
                      {lang === 'sv' ? 'Ditt totala presentkortssaldo' : 'Your Total Gift Balance'}
                    </span>
                    <h4 className="text-3xl font-serif font-extrabold tracking-tight text-white flex items-baseline gap-2">
                      {totalVoucherBalance} <span className="text-sm font-sans font-normal text-amber-200">SEK</span>
                    </h4>
                    <p className="text-[10.5px] text-amber-100/85 leading-tight">
                      {lang === 'sv' 
                        ? 'Giltigt som betalmedel för mat, dryck & dryckesprovningar hos oss.'
                        : 'Valid for dinners, wine tastings, and menu bills at our restaurant.'}
                    </p>
                  </div>
                  <Ticket className="w-20 h-20 text-amber-500/10 absolute right-4 top-1/2 -translate-y-1/2 shrink-0 select-none" />
                </div>

                <div className="p-6 bg-stone-100 border border-stone-200 rounded-2xl flex flex-col justify-between shadow-sm select-none">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-[#a37c44] uppercase font-bold">
                      {lang === 'sv' ? 'Lös in / Koppla värdekoder' : 'Check & Redeem Gift Codes'}
                    </span>
                    <p className="text-xs text-[#7c2d12] font-serif font-bold mt-1.5">
                      {lang === 'sv'
                        ? 'Har du fått ett välkomstpresentkort eller en personlig gåvokod?'
                        : 'Have you received a welcome coupon or an autogenerated gift key?'}
                    </p>
                    <p className="text-[10.5px] text-stone-500 mt-1 leading-normal">
                      {lang === 'sv'
                        ? 'Skriv in din kod i vår popup för att omedelbart koppla koden och öka ditt disponibla saldo.'
                        : 'Enter your code in our popup finder to claim credit and increase your card balance.'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setClaimCodeInput('');
                      setCheckedVoucherResult(null);
                      setClaimError('');
                      setClaimSuccess('');
                      setIsClaimPopupOpen(true);
                    }}
                    className="mt-4 inline-flex items-center gap-2 justify-center px-4 py-2.5 bg-[#7c2d12] hover:bg-[#9a3412] text-amber-50 text-xs font-mono font-bold tracking-wider rounded-xl cursor-pointer transition-all shadow-sm"
                  >
                    <Gift className="w-4 h-4" />
                    <span>{lang === 'sv' ? 'LÖS IN OCH KOPPLA PRESENTKOD' : 'CLAIM & LINK PROMO CODE'}</span>
                  </button>
                </div>
              </div>

              {/* THREE DATA SECTIONS: 1. Reservations, 2. Gift Cards, 3. Transactions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 1. TABLE RESERVATIONS PANEL (LEFT-SIDE MAJOR) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex justify-between items-center border-b pb-2.5 border-stone-200">
                    <h5 className="font-serif text-lg font-bold flex items-center gap-2 text-stone-900">
                      <Calendar className="w-5 h-5 text-[#a37c44]" />
                      <span>{lang === 'sv' ? 'Dina Bordsreservationer' : 'Table Reservations'}</span>
                    </h5>
                    <span className="font-mono text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-black select-none">
                      {bookings.length} {lang === 'sv' ? 'bokade' : 'booked'}
                    </span>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="p-8 bg-stone-50 border border-stone-200 border-dashed rounded-2xl text-center space-y-3 select-none">
                      <Clock className="w-8 h-8 mx-auto text-stone-300" />
                      <p className="text-stone-500 text-xs md:text-sm">
                        {lang === 'sv' 
                          ? 'Du har inga registrerade bordsbokningar på denna adress.' 
                          : 'No recorded dinner reservations mapped to your email profile.'}
                      </p>
                      <a 
                        href="#bokning" 
                        onClick={onClose}
                        className="inline-block px-3.5 py-1.5 font-mono font-bold bg-amber-900/15 border border-amber-900/10 text-amber-900 text-[10px] tracking-wider rounded-xl uppercase hover:bg-amber-900 hover:text-white transition-all scale-100"
                      >
                        {lang === 'sv' ? 'Boka ett bord nu' : 'Reserve a Table Now'}
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((b) => {
                        const statusColors = 
                          b.status === 'confirmed' 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                            : b.status === 'cancelled' 
                              ? 'bg-red-100 text-red-800 border-red-200' 
                              : 'bg-amber-100 text-amber-800 border-amber-200';

                        return (
                          <div 
                            key={b.id} 
                            className={`p-4 bg-white border rounded-xl shadow-sm flex flex-col justify-between transition-all relative ${b.status === 'cancelled' ? 'opacity-65' : 'hover:border-stone-400'}`}
                          >
                            <div className="flex flex-wrap justify-between items-start gap-2">
                              <div>
                                <span className={`inline-block px-2 py-0.5 text-[8.5px] font-mono uppercase tracking-widest border rounded-md font-bold mb-2 ${statusColors}`}>
                                  {b.status === 'confirmed' ? (lang === 'sv' ? 'Bekräftad' : 'Confirmed') : b.status === 'cancelled' ? (lang === 'sv' ? 'Avbokad' : 'Cancelled') : (lang === 'sv' ? 'Mottagen' : 'Pending')}
                                </span>
                                <h6 className="font-serif text-base font-bold text-stone-900">
                                  {b.area === 'Hall' ? 'Stora Hallen (1910)' : b.area === 'Kristallen' ? 'Kristallen Chandelier Bar' : 'Pelikan Terrassen'}
                                </h6>
                              </div>
                              <div className="text-right font-mono text-[10px] text-stone-500 select-all">
                                Ref: <strong className="text-stone-700 font-bold">{b.reference}</strong>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2.5 border-t border-stone-100 pt-3 mt-3 select-none text-stone-700">
                              <div className="flex items-center gap-1.5 text-xs">
                                <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                <span>{b.date}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs">
                                <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                <span>Kl. {b.time}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs">
                                <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                <span>{b.guests} {lang === 'sv' ? 'gäster' : 'guests'}</span>
                              </div>
                            </div>

                            {/* Booking Cancellation Trigger */}
                            {b.status !== 'cancelled' && (
                              <div className="flex justify-end pt-3 mt-3 border-t border-stone-100">
                                <button
                                  onClick={() => handleCancelReservation(b.id || '')}
                                  className="text-[10px] font-mono uppercase bg-red-500/10 hover:bg-red-600 hover:text-white text-red-800 py-1.5 px-3 rounded-lg flex items-center gap-1.5 tracking-wider font-extrabold select-none cursor-pointer border border-red-500/15"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>{lang === 'sv' ? 'Avboka reservation' : 'Cancel booking'}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. COUPON & TRANSACTION PANELS (RIGHT-SIDE COLUMN) */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* TASKS TO CLAIM/REDEEM VOUCHERS */}
                  <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-4 shadow-sm select-none">
                    <span className="text-[9px] font-mono tracking-widest text-[#a37c44] uppercase font-black block border-b pb-1 border-stone-200">
                      {lang === 'sv' ? '📋 AKTIVITETER FÖR ATT UTNYTTJA SALDO' : '📋 SET-UP STEPS & CHECKS'}
                    </span>
                    <p className="text-[11.5px] text-stone-600 leading-normal font-sans">
                      {lang === 'sv' 
                        ? 'Följ stegen nedan för att registrera, bevaka och tryggt lösa in dina välkomstförmåner:'
                        : 'Complete these system milestones to verify and claim your restaurant rewards:'}
                    </p>
                    <div className="space-y-3 font-sans text-xs">
                      {(bookingStore.getGiftVoucherConfig().claimTasks || [
                        'Skapa ett gästkonto på Krog Pelikans hemsida',
                        'Sök efter tillgängliga presentkoder eller välkomstgåvor i din e-postlogg',
                        'Koppla värdekoden i Kundportalen för att lösa in och spåra dess saldo',
                        'Boka bord och uppge din aktiva presentkod i rutan för särskilda önskemål'
                      ]).map((task, idx) => {
                        const isProfileDone = idx === 0; // True since logged in
                        const isClaimDone = idx === 1 || (idx === 2 ? coupons.length > 0 : false);
                        const isBookingDone = idx === 3 ? bookings.length > 0 : false;
                        const isChecked = isProfileDone || isClaimDone || isBookingDone;

                        return (
                          <div key={idx} className="flex items-start gap-2.5 text-stone-700">
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              readOnly
                              className="mt-0.5 rounded border-stone-300 text-[#a37c44] focus:ring-amber-500 h-3.5 w-3.5 pointer-events-none"
                            />
                            <span className={`text-[11px] leading-relaxed select-none ${isChecked ? 'line-through text-stone-400 font-normal' : 'text-stone-700 font-semibold'}`}>
                              {task}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* HAVING COUPONS DETAILS */}
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center border-b pb-2.5 border-stone-200">
                      <h5 className="font-serif text-lg font-bold flex items-center gap-2 text-stone-900">
                        <Ticket className="w-5 h-5 text-[#a37c44]" />
                        <span>{lang === 'sv' ? 'Dina Värdebevis / Gåvor' : 'Gift Coupons & Vouchers'}</span>
                      </h5>
                      <span className="font-mono text-[10px] bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
                        {coupons.length}
                      </span>
                    </div>

                    {coupons.length === 0 ? (
                      <div className="p-5 bg-[#fffbeb] border border-[#fef3c7] rounded-xl text-center text-xs space-y-2 select-none">
                        <Gift className="w-7 h-7 mx-auto text-amber-800/40" />
                        <p className="text-amber-900/80 font-serif italic">
                          {lang === 'sv' 
                            ? 'Du har inga aktiva digitala presentkort på Krog Pelikan.' 
                            : 'No digital presentkort or vouchers linked to this address.'}
                        </p>
                        <p className="text-[10px] text-stone-500 leading-relaxed font-sans">
                          {lang === 'sv' 
                            ? 'Be vänner skicka presentkort till din e-post, eller köp ett själv nedan!' 
                            : 'Worry not! You can purchase one inside our Gift Card Studio below.'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {coupons.map((c) => (
                          <div 
                            key={c.id}
                            className="p-4 bg-amber-500/5 hover:bg-amber-500/10 border-2 border-dashed border-amber-800/30 rounded-xl relative overflow-hidden"
                          >
                            <div className="flex justify-between items-start gap-1">
                              <div>
                                <p className="text-[8px] font-mono tracking-widest text-[#a37c44] font-bold uppercase select-none">
                                  KROG PELIKAN VÄRDEBEVIS
                                </p>
                                <p className="font-serif text-base font-extrabold text-[#7c2d12] mt-1">
                                  {c.value || c.amount} KR
                                </p>
                              </div>
                              <span className="font-mono text-[9px] bg-amber-900/90 text-amber-50 px-2 py-0.5 rounded border border-amber-600 font-bold select-all">
                                {c.code.toUpperCase()}
                              </span>
                            </div>

                            <p className="text-[11px] text-stone-600 leading-relaxed font-sans mt-2">
                              {lang === 'sv' 
                                ? `Köpt för ${c.amount} kr till ${c.recipientName}. Visa bara upp koden för din servitör i ölhallen.` 
                                : `Purchased for ${c.amount} SEK. Just present this coupon code directly to your waiter.`}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* TRANSACTION HISTORY */}
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center border-b pb-2.5 border-stone-200">
                      <h5 className="font-serif text-lg font-bold flex items-center gap-2 text-stone-900">
                        <CreditCard className="w-5 h-5 text-[#a37c44]" />
                        <span>{lang === 'sv' ? 'Transaktionshistorik' : 'Payments History'}</span>
                      </h5>
                    </div>

                    {transactions.length === 0 ? (
                      <div className="p-4 bg-stone-50 border border-stone-200 border-dashed rounded-xl text-center text-xs text-stone-500 select-none font-mono">
                        {lang === 'sv' ? 'Inga transaktionskvitton hittades.' : 'No completed stripe transactions.'}
                      </div>
                    ) : (
                      <div className="space-y-2 font-mono text-xs select-none">
                        {transactions.map((tx) => (
                          <div 
                            key={tx.id} 
                            className="p-3 bg-white border border-stone-200/80 rounded-xl flex justify-between items-center gap-2 hover:bg-stone-50 transition-colors"
                          >
                            <div>
                              <div className="font-bold text-stone-800">
                                {tx.amount} {tx.currency || 'SEK'}
                              </div>
                              <div className="text-[9px] text-[#a37c44] font-medium mt-0.5">
                                {tx.id.startsWith('ch_test_sim') ? 'Simulated Payment' : 'Stripe Hook'}
                              </div>
                              <div className="text-[9px] text-stone-400 mt-1">
                                {tx.createdAt.split('T')[0]} {tx.createdAt.split('T')[1]?.substring(0, 5) || ''}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="bg-emerald-100/80 text-emerald-800 border border-emerald-200 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                {lang === 'sv' ? 'Genomförd' : 'Settled'}
                              </span>
                              <div className="text-[8px] text-stone-400 mt-1">
                                Code: {tx.voucherCode}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      </motion.div>

      {/* CHECK & CLAIM POPUP MODAL */}
      <AnimatePresence>
        {isClaimPopupOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="w-full max-w-md bg-white border-2 border-stone-200 shadow-2xl rounded-2xl p-6 relative text-stone-900 font-sans"
            >
              <div className="flex justify-between items-center border-b pb-3 border-stone-200">
                <h4 className="font-serif text-lg font-bold flex items-center gap-1.5 text-stone-800">
                  <Gift className="w-5 h-5 text-amber-700 font-bold" />
                  <span>{lang === 'sv' ? 'Kontrollera & Lös in kod' : 'Check & Claim Code'}</span>
                </h4>
                <button 
                  onClick={() => {
                    setIsClaimPopupOpen(false);
                    setCheckedVoucherResult(null);
                    setClaimCodeInput('');
                    setClaimError('');
                    setClaimSuccess('');
                  }}
                  className="p-1 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-4">
                {claimError && (
                  <div className="p-3 bg-red-100 text-red-800 border border-red-200 rounded-xl text-xs flex items-center gap-2 font-mono">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{claimError}</span>
                  </div>
                )}

                {claimSuccess && (
                  <div className="p-3 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 font-mono">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{claimSuccess}</span>
                  </div>
                )}

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-mono font-bold uppercase tracking-widest text-[#stone-600] text-stone-600">
                    {lang === 'sv' ? 'Presentkortskod / Voucherkod' : 'Your Promo/Voucher Code'}
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="t.ex. VÄLKOMMEN-1234"
                      value={claimCodeInput}
                      onChange={(e) => setClaimCodeInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-stone-300 rounded-xl font-mono text-sm uppercase focus:outline-none focus:border-amber-800 bg-white"
                    />
                    <button
                      onClick={handleCheckVoucherCode}
                      className="px-4 py-2 bg-stone-950 text-amber-100 rounded-xl font-mono text-xs hover:bg-stone-800 transition-all cursor-pointer font-bold shrink-0"
                    >
                      {lang === 'sv' ? 'KONTROLLERA' : 'CHECK CODE'}
                    </button>
                  </div>
                </div>

                {checkedVoucherResult && (
                  <div className="p-4 bg-amber-500/5 border border-dashed border-amber-800/40 rounded-xl text-left space-y-3 animate-fade-in animate-bounce-subtle">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-mono tracking-wider text-amber-800 font-bold uppercase">
                          {lang === 'sv' ? 'GILTIGT SALDO PÅ KOD' : 'ACTIVE VOUCHER MATCHED'}
                        </p>
                        <p className="text-2xl font-serif font-black text-amber-900 mt-1">
                          {checkedVoucherResult.value || checkedVoucherResult.amount} kr
                        </p>
                      </div>
                      <span className="font-mono text-xs bg-amber-900 text-amber-50 px-2 py-0.5 rounded font-bold">
                        {checkedVoucherResult.code}
                      </span>
                    </div>

                    <div className="text-xs text-stone-600 space-y-1 font-sans">
                      <p><strong>Mottagare:</strong> {checkedVoucherResult.recipientName} ({checkedVoucherResult.recipientEmail})</p>
                      <p><strong>Skapad:</strong> {new Date(checkedVoucherResult.createdAt).toLocaleDateString()}</p>
                    </div>

                    <button
                      onClick={handleClaimVoucherToAccount}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-stone-900 font-mono text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer shadow-md transition-colors text-center"
                    >
                      {lang === 'sv' ? 'KOPPLA PRESENTKORT TILL MIN PROFIL' : 'CONNECT & CLAIM VOUCHER TO ACCOUNT'}
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t pt-3 border-stone-200 text-[10px] text-stone-400 font-mono uppercase tracking-wider select-none text-left">
                Krog Pelikan, Blekingegatan 40
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
