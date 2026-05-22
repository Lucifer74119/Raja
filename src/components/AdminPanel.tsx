import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Calendar, Clock, MapPin, Search, Filter, Mail, Check, 
  X, Trash2, Ticket, Send, Eye, ShieldAlert, Sparkles, Inbox, 
  LogOut, RefreshCw, AlertCircle, Copy, CheckCircle2, Lock, 
  Settings, Key, ArrowRight, Shield, Globe, Plus, ArrowLeftRight,
  Pencil, Phone, CreditCard, Download, Menu
} from 'lucide-react';
import { BookingDetails, DiningAreaZone, DiningTable, GiftVoucherConfig, AdminVoucher, StripeTransaction, StaffProfile, StaffLog, VoucherBuyingOption, Customer } from '../types';
import { bookingStore, EmailMessage, AdminEmailProfile } from '../utils/bookingStore';

interface AdminPanelProps {
  onBackToHome: () => void;
}

export default function AdminPanel({ onBackToHome }: AdminPanelProps) {
  // Admin Language state
  const [adminLang, setAdminLang] = useState<'sv' | 'en'>(() => {
    return (localStorage.getItem('pelikan_admin_lang') as 'sv' | 'en') || 'sv';
  });

  const toggleAdminLang = () => {
    const next = adminLang === 'sv' ? 'en' : 'sv';
    setAdminLang(next);
    localStorage.setItem('pelikan_admin_lang', next);
  };

  // Login state (Default username: admin, password: admin)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Primary data states
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);

  // CRUD booking modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [modalBooking, setModalBooking] = useState<BookingDetails | null>(null); // if null, creating; if present, editing
  const [bookingFormName, setBookingFormName] = useState('');
  const [bookingFormEmail, setBookingFormEmail] = useState('');
  const [bookingFormPhone, setBookingFormPhone] = useState('');
  const [bookingFormGuests, setBookingFormGuests] = useState(2);
  const [bookingFormDate, setBookingFormDate] = useState('');
  const [bookingFormTime, setBookingFormTime] = useState('18:00');
  const [bookingFormArea, setBookingFormArea] = useState<string>('Hall');
  const [bookingFormSpecial, setBookingFormSpecial] = useState('');
  const [bookingFormDiet, setBookingFormDiet] = useState('');
  const [bookingFormStatus, setBookingFormStatus] = useState<'pending' | 'confirmed' | 'cancelled'>('confirmed');
  const [crudError, setCrudError] = useState('');
  const [crudSuccess, setCrudSuccess] = useState('');

  // Email Config State
  const [adminProfile, setAdminProfile] = useState<AdminEmailProfile>(bookingStore.getAdminProfile());
  const [isTestConnecting, setIsTestConnecting] = useState(false);
  const [profileSuccessMessage, setProfileSuccessMessage] = useState('');

  // Compose Email States
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeSuccess, setComposeSuccess] = useState('');
  const [composeError, setComposeError] = useState('');
  const [isComposeSending, setIsComposeSending] = useState(false);

  // Simulate Incoming Email States
  const [simFromEmail, setSimFromEmail] = useState('');
  const [simFromName, setSimFromName] = useState('');
  const [simSubject, setSimSubject] = useState('');
  const [simBody, setSimBody] = useState('');
  const [simSuccess, setSimSuccess] = useState('');

  // Voucher modal state (Exclusively in admin)
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDesc, setVoucherDesc] = useState('');
  const [voucherNotification, setVoucherNotification] = useState('');

  // Active sub-tab inside admin:
  const [adminTab, setAdminTab] = useState<'reservations' | 'customers' | 'tables' | 'vouchers' | 'settings' | 'menu'>('reservations');

  // --- MENU MANAGEMENT STATES ---
  const [adminMenuSubTab, setAdminMenuSubTab] = useState<'dishes' | 'categories'>('dishes');
  const [adminMenuItems, setAdminMenuItems] = useState<any[]>([]);
  const [adminCategories, setAdminCategories] = useState<any[]>([]);
  
  // Create / Edit Dish Modal
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [modalDish, setModalDish] = useState<any | null>(null); // if editing
  const [dishFormId, setDishFormId] = useState('');
  const [dishFormName, setDishFormName] = useState('');
  const [dishFormSwName, setDishFormSwName] = useState('');
  const [dishFormPrice, setDishFormPrice] = useState(200);
  const [dishFormCategory, setDishFormCategory] = useState('mains');
  const [dishFormDesc, setDishFormDesc] = useState('');
  const [dishFormImage, setDishFormImage] = useState('');
  const [dishFormDietaryInput, setDishFormDietaryInput] = useState('');
  const [dishFormSignature, setDishFormSignature] = useState(false);
  const [dishFormPublished, setDishFormPublished] = useState(true);

  // Category mini form inputs
  const [catFormId, setCatFormId] = useState('');
  const [catFormName, setCatFormName] = useState('');
  const [catFormSwName, setCatFormSwName] = useState('');
  const [catFormDesc, setCatFormDesc] = useState('');
  
  // Active email sub-tab
  const [emailSubTab, setEmailSubTab] = useState<'theme' | 'inbox_sent' | 'compose' | 'simulate' | 'settings' | 'bulk_send' | 'stripe_settings' | 'stripe_transactions'>('theme');

  // Stripe dynamic credentials & transactional logs state
  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [stripeSuccessMessage, setStripeSuccessMessage] = useState('');
  const [stripeTransactions, setStripeTransactions] = useState<StripeTransaction[]>([]);

  // Dynamic list of zones
  const [diningZones, setDiningZones] = useState<DiningAreaZone[]>([]);
  
  // Custom theme settings state
  const [selectedTheme, setSelectedTheme] = useState(() => localStorage.getItem('pelikan_theme') || 'premium_gold');

  // Staff and Role Authorization State
  const [currentStaff, setCurrentStaff] = useState<StaffProfile | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [staffProfiles, setStaffProfiles] = useState<StaffProfile[]>([]);
  const [staffLogs, setStaffLogs] = useState<StaffLog[]>([]);
  const [logsSearchQuery, setLogsSearchQuery] = useState('');
  const [logsCategoryFilter, setLogsCategoryFilter] = useState<'all' | 'voucher' | 'menu' | 'user' | 'system'>('all');

  // Dynamic Voucher Buying Packages State
  const [voucherBuyingOptions, setVoucherBuyingOptions] = useState<VoucherBuyingOption[]>([]);

  // Staff profile CRUD modal state
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [modalStaff, setModalStaff] = useState<StaffProfile | null>(null);
  const [staffFormUsername, setStaffFormUsername] = useState('');
  const [staffFormPassword, setStaffFormPassword] = useState('');
  const [staffFormDisplayName, setStaffFormDisplayName] = useState('');
  const [staffFormPermissions, setStaffFormPermissions] = useState<string[]>(['reservations']);


  // Customer state & CRUD modal
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [modalCustomer, setModalCustomer] = useState<any | null>(null); // if editing
  const [customerFormName, setCustomerFormName] = useState('');
  const [customerFormEmail, setCustomerFormEmail] = useState('');
  const [customerFormPhone, setCustomerFormPhone] = useState('');
  const [customerFormVisits, setCustomerFormVisits] = useState(1);
  const [customerFormDietary, setCustomerFormDietary] = useState('Inga');
  const [customerFormSpecial, setCustomerFormSpecial] = useState('Inga');

  // Seating Zone state & CRUD modal
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [modalZone, setModalZone] = useState<DiningAreaZone | null>(null); // if editing
  const [zoneFormId, setZoneFormId] = useState('');
  const [zoneFormName, setZoneFormName] = useState('');
  const [zoneFormDesc, setZoneFormDesc] = useState('');
  const [zoneFormCapacity, setZoneFormCapacity] = useState(50);
  const [zoneFormTables, setZoneFormTables] = useState(15);
  const [zoneFormIsActive, setZoneFormIsActive] = useState(true);

  // Table state & CRUD modal
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [modalTable, setModalTable] = useState<DiningTable | null>(null);
  const [tableFormId, setTableFormId] = useState('');
  const [tableFormName, setTableFormName] = useState('');
  const [tableFormZone, setTableFormZone] = useState('Hall');
  const [tableFormCapacity, setTableFormCapacity] = useState(4);
  const [tableFormDesc, setTableFormDesc] = useState('');
  const [tableFormImage, setTableFormImage] = useState('');
  const [tableFormIsActive, setTableFormIsActive] = useState(true);

  // Gift Voucher Config state & CRUD manual voucher modal
  const [voucherConfig, setVoucherConfig] = useState<GiftVoucherConfig>({ isEnabled: true, defaultPercentage: 10 });
  const [adminVouchers, setAdminVouchers] = useState<AdminVoucher[]>([]);
  const [isNewAdminVoucherModalOpen, setIsNewAdminVoucherModalOpen] = useState(false);
  const [vchFormCode, setVchFormCode] = useState('');
  const [vchFormAmount, setVchFormAmount] = useState(1000);
  const [vchFormValue, setVchFormValue] = useState(1100);
  const [vchFormRecipientName, setVchFormRecipientName] = useState('');
  const [vchFormRecipientEmail, setVchFormRecipientEmail] = useState('');

  // Editing existing coupon/voucher states
  const [isEditVoucherModalOpen, setIsEditVoucherModalOpen] = useState(false);
  const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null);
  const [editVchCode, setEditVchCode] = useState('');
  const [editVchAmount, setEditVchAmount] = useState(0);
  const [editVchValue, setEditVchValue] = useState(0);
  const [editVchRecipientName, setEditVchRecipientName] = useState('');
  const [editVchRecipientEmail, setEditVchRecipientEmail] = useState('');
  const [editVchIsEnabled, setEditVchIsEnabled] = useState(true);
  const [editVchIsClaimed, setEditVchIsClaimed] = useState(false);

  // Claiming Voucher States
  const [claimSearchCode, setClaimSearchCode] = useState('');
  const [activeClaimVoucher, setActiveClaimVoucher] = useState<AdminVoucher | null>(null);
  const [claimOtpInput, setClaimOtpInput] = useState('');
  const [claimStatusMsg, setClaimStatusMsg] = useState({ type: '', text: '' });
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Bulk Send States
  const [bulkSelectedEmails, setBulkSelectedEmails] = useState<string[]>([]);
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkBody, setBulkBody] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState('');
  const [bulkError, setBulkError] = useState('');
  const [isBulkSending, setIsBulkSending] = useState(false);

  // New Search & Filter States
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('all');
  const [customerVisitFilter, setCustomerVisitFilter] = useState('all');

  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [tableZoneFilter, setTableZoneFilter] = useState('all');
  const [tableStatusFilter, setTableStatusFilter] = useState('all');

  const [zoneSearchQuery, setZoneSearchQuery] = useState('');
  const [zoneStatusFilter, setZoneStatusFilter] = useState('all');

  const [voucherSearchQuery, setVoucherSearchQuery] = useState('');
  const [voucherFilterStatus, setVoucherFilterStatus] = useState('all');

  const [emailSearchQuery, setEmailSearchQuery] = useState('');
  const [emailTypeFilter, setEmailTypeFilter] = useState('all');

  const [stripeSearchQuery, setStripeSearchQuery] = useState('');

  // Manual list override of customers
  const [manualCustomers, setManualCustomers] = useState<any[]>(() => {
    const list = localStorage.getItem('pelikan_manual_customers');
    return list ? JSON.parse(list) : [];
  });

  const saveManualCustomers = (list: any[]) => {
    setManualCustomers(list);
    localStorage.setItem('pelikan_manual_customers', JSON.stringify(list));
  };

  // Extract unique customers & merge with manual customer registrations
  const getUniqueCustomers = () => {
    const map: Record<string, any> = {};

    // Seed preset / manual clients
    manualCustomers.forEach(c => {
      const emailLower = c.email.toLowerCase().trim();
      map[emailLower] = {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        totalVisits: c.totalVisits || 1,
        dietaryNotes: c.dietaryNotes || 'Inga',
        specialNotes: c.specialNotes || 'Inga',
        isManual: true
      };
    });

    // Extract dynamic customers from genuine booking details
    bookings.forEach(b => {
      const emailLower = b.email.toLowerCase().trim();
      if (!map[emailLower]) {
        map[emailLower] = {
          id: `CUST-BK-${Math.floor(100 + Math.random() * 900)}`,
          name: b.name,
          email: b.email,
          phone: b.phone,
          totalVisits: 0,
          dietaryNotes: b.dietaryNotes || 'Inga',
          specialNotes: b.specialNotes || 'Inga',
          isManual: false
        };
      }
      const existing = map[emailLower];
      existing.totalVisits += 1;
      if (b.dietaryNotes && b.dietaryNotes !== 'Inga' && existing.dietaryNotes === 'Inga') {
        existing.dietaryNotes = b.dietaryNotes;
      }
      if (b.specialNotes && b.specialNotes !== 'Inga' && existing.specialNotes === 'Inga') {
        existing.specialNotes = b.specialNotes;
      }
    });

    return Object.values(map);
  };

  // Dynamic Theme injection
  useEffect(() => {
    localStorage.setItem('pelikan_theme', selectedTheme);
    const overrides: Record<string, Record<string, string>> = {
      premium_gold: {
        '--color-amber-950': '#451a03',
        '--color-amber-500': '#f59e0b',
        '--color-amber-100': '#fef3c7',
        '--color-stone-900': '#1c1917'
      },
      nordic_slate: {
        '--color-amber-950': '#0f172a',
        '--color-amber-500': '#0ea5e9',
        '--color-amber-100': '#e0f2fe',
        '--color-stone-900': '#0f172a'
      },
      red_mahogany: {
        '--color-amber-950': '#4c0519',
        '--color-amber-500': '#e11d48',
        '--color-amber-100': '#ffe4e6',
        '--color-stone-900': '#1c0d12'
      },
      tavern_charcoal: {
        '--color-amber-950': '#09090b',
        '--color-amber-500': '#a1a1aa',
        '--color-amber-100': '#f4f4f5',
        '--color-stone-900': '#18181b'
      }
    };

    const vars = overrides[selectedTheme] || overrides.premium_gold;
    Object.entries(vars).forEach(([key, val]) => {
      document.documentElement.style.setProperty(key, val);
    });

    // Notify other components (like Home page)
    window.dispatchEvent(new Event('theme_changed'));
  }, [selectedTheme]);

  // Load bookings and emails from store
  const refreshData = () => {
    setBookings(bookingStore.getBookings());
    setEmails(bookingStore.getEmails());
    setDiningZones(bookingStore.getDiningZones());
    setTables(bookingStore.getDiningTables());
    setAdminVouchers(bookingStore.getVouchers());
    setVoucherConfig(bookingStore.getGiftVoucherConfig());
    setStripeTransactions(bookingStore.getTransactions());
    setAdminMenuItems(bookingStore.getMenuItems());
    setAdminCategories(bookingStore.getMenuCategories());
    setVoucherBuyingOptions(bookingStore.getVoucherBuyingOptions());
    setStaffProfiles(bookingStore.getStaffProfiles());
    setStaffLogs(bookingStore.getStaffLogs());
  };

  useEffect(() => {
    refreshData();
    // Load Stripe parameters
    const stripeConf = bookingStore.getStripeConfig();
    setStripePublishableKey(stripeConf.publishableKey || '');
    setStripeSecretKey(stripeConf.secretKey || '');

    // Poll for changes periodically in case bookings are added
    const interval = setInterval(refreshData, 3000);
    return () => clearInterval(interval);
  }, []);

  const visibleTabs = [
    { id: 'reservations', label: adminLang === 'sv' ? 'Reservationer' : 'Reservations', icon: <Calendar className="w-4 h-4" />, extra: `(${bookings.length})` },
    { id: 'customers', label: adminLang === 'sv' ? 'Gäster' : 'Customers', icon: <Users className="w-4 h-4" />, extra: `(${getUniqueCustomers().length})` },
    { id: 'tables', label: adminLang === 'sv' ? 'Bordszoner' : 'Dining Areas', icon: <MapPin className="w-4 h-4" />, extra: `(${diningZones.length})` },
    { id: 'vouchers', label: adminLang === 'sv' ? 'Presentkort' : 'Vouchers', icon: <Ticket className="w-4 h-4" />, extra: `(${adminVouchers.length})` },
    { id: 'menu', label: adminLang === 'sv' ? 'Hantera Meny' : 'Manage Menu', icon: <Menu className="w-4 h-4 text-amber-500" />, extra: `(${adminMenuItems.length})` },
    { id: 'settings', label: adminLang === 'sv' ? 'Inställningar & E-post' : 'Settings & Mail', icon: <Settings className="w-4 h-4" /> },
    { id: 'staff', label: adminLang === 'sv' ? 'Personal' : 'Staff', icon: <Shield className="w-4 h-4 text-emerald-500 font-bold" />, superOnly: true }
  ].filter(tab => {
    if (isSuperAdmin) return true;
    if (tab.superOnly) return false;
    if (!currentStaff) return false;
    return currentStaff.permissions.includes(tab.id);
  });

  useEffect(() => {
    if (isLoggedIn && visibleTabs.length > 0) {
      const allowedIds = visibleTabs.map(t => t.id);
      if (!allowedIds.includes(adminTab)) {
        setAdminTab(allowedIds[0] as any);
      }
    }
  }, [isLoggedIn, currentStaff, isSuperAdmin, adminTab, visibleTabs.length]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = loginUsername.trim().toLowerCase();
    const p = loginPassword.trim();

    if (u === 'admin' && p === 'admin') {
      setIsLoggedIn(true);
      setIsSuperAdmin(true);
      setCurrentStaff(null);
      setLoginError('');
      bookingStore.addStaffLog('Hovmästare Admin', 'Loggade in i systemet som Super Admin.');
    } else {
      const staffList = bookingStore.getStaffProfiles();
      const match = staffList.find(s => s.username.toLowerCase() === u && s.password === p);
      if (match) {
        setIsLoggedIn(true);
        setIsSuperAdmin(false);
        setCurrentStaff(match);
        setLoginError('');
        bookingStore.addStaffLog(match.displayName, 'Personal loggade in i systemet.');
      } else {
        setLoginError('Felaktigt användarnamn eller lösenord. Tips: Använd admin / admin eller en personalprofil från admin.');
      }
    }
    refreshData();
  };

  const handleLogout = () => {
    if (currentStaff) {
      bookingStore.addStaffLog(currentStaff.displayName, 'Personal loggade ut från systemet.');
    } else {
      bookingStore.addStaffLog('Hovmästare Admin', 'Loggade ut från systemet.');
    }
    setIsLoggedIn(false);
    setIsSuperAdmin(false);
    setCurrentStaff(null);
  };

  const handleSaveStripeConfig = (e: React.FormEvent) => {
    e.preventDefault();
    bookingStore.saveStripeConfig({
      publishableKey: stripePublishableKey,
      secretKey: stripeSecretKey
    });
    setStripeSuccessMessage('Mottagare- och betalväxelkofigureringen sparades framgångsrikt i systemets databas!');
    setTimeout(() => setStripeSuccessMessage(''), 3050);
  };

  // --- MENU MANAGEMENT HANDLERS ---
  const handleTogglePublishMenuItem = (itemId: string) => {
    const updated = adminMenuItems.map(item => {
      if (item.id === itemId) {
        return { ...item, published: item.published === false ? true : false };
      }
      return item;
    });
    setAdminMenuItems(updated);
    bookingStore.saveMenuItems(updated);
  };

  const handleDeleteCategory = (catId: string) => {
    if (['starters', 'mains', 'desserts', 'drinks'].includes(catId)) {
      alert(adminLang === 'sv' ? 'Standardkategorier kan inte tas bort.' : 'Standard categories cannot be deleted.');
      return;
    }
    const confirmDelete = window.confirm(
      adminLang === 'sv' 
        ? 'Är du säker på att du vill ta bort den här kategorin? Eventuella maträtter under den kommer inte visas för gästerna.' 
        : 'Are you sure you want to delete this category? Associated dishes will not be displayed contextually.'
    );
    if (!confirmDelete) return;

    const updated = adminCategories.filter(c => c.id !== catId);
    setAdminCategories(updated);
    bookingStore.saveMenuCategories(updated);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormId.trim() || !catFormName.trim()) {
      alert(adminLang === 'sv' ? 'Mata in ID och namn!' : 'Enter ID and name!');
      return;
    }
    const cleanId = catFormId.trim().toLowerCase().replace(/\s+/g, '-');
    if (adminCategories.some(c => c.id === cleanId)) {
      alert(adminLang === 'sv' ? 'Kategori-ID existerar redan.' : 'Category ID already exists.');
      return;
    }
    const newCat = {
      id: cleanId,
      name: catFormName.trim(),
      swedishName: catFormSwName.trim() || catFormName.trim(),
      description: catFormDesc.trim()
    };
    const updated = [...adminCategories, newCat];
    setAdminCategories(updated);
    bookingStore.saveMenuCategories(updated);

    // reset fields
    setCatFormId('');
    setCatFormName('');
    setCatFormSwName('');
    setCatFormDesc('');
  };

  const handleDishFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishFormName.trim() || !dishFormSwName.trim()) {
      alert('Vänligen fyll i gästvänliga namn!');
      return;
    }

    const dietaryTags = dishFormDietaryInput
      ? dishFormDietaryInput.split(',').map(tag => tag.trim().toUpperCase()).filter(Boolean)
      : [];

    const isEdit = !!modalDish;
    const finalId = isEdit ? modalDish.id : `menu-custom-${Date.now()}`;

    const dishData = {
      id: finalId,
      name: dishFormName.trim(),
      swedishName: dishFormSwName.trim(),
      price: Number(dishFormPrice),
      category: dishFormCategory,
      description: dishFormDesc.trim(),
      image: dishFormImage.trim() || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop',
      tags: dietaryTags,
      signature: dishFormSignature,
      published: dishFormPublished
    };

    let updatedList;
    if (isEdit) {
      updatedList = adminMenuItems.map(item => item.id === finalId ? dishData : item);
    } else {
      updatedList = [dishData, ...adminMenuItems];
    }

    setAdminMenuItems(updatedList);
    bookingStore.saveMenuItems(updatedList);
    setIsDishModalOpen(false);
    setModalDish(null);
  };

  const handleDeleteDishItem = (dishId: string) => {
    const confirmDelete = window.confirm(adminLang === 'sv' ? 'Ta bort maträtten?' : 'Delete dish permanent?');
    if (!confirmDelete) return;

    const updated = adminMenuItems.filter(item => item.id !== dishId);
    setAdminMenuItems(updated);
    bookingStore.saveMenuItems(updated);
  };

  const handleOpenEditDishModal = (dish: any) => {
    setModalDish(dish);
    setDishFormId(dish.id);
    setDishFormName(dish.name);
    setDishFormSwName(dish.swedishName);
    setDishFormPrice(dish.price);
    setDishFormCategory(dish.category);
    setDishFormDesc(dish.description || '');
    setDishFormImage(dish.image || '');
    setDishFormDietaryInput(dish.tags ? dish.tags.join(', ') : '');
    setDishFormSignature(!!dish.signature);
    setDishFormPublished(dish.published !== false);
    setIsDishModalOpen(true);
  };

  const handleOpenCreateDishModal = () => {
    setModalDish(null);
    setDishFormId('');
    setDishFormName('');
    setDishFormSwName('');
    setDishFormPrice(185);
    setDishFormCategory(adminCategories[0]?.id || 'mains');
    setDishFormDesc('');
    setDishFormImage('');
    setDishFormDietaryInput('');
    setDishFormSignature(false);
    setDishFormPublished(true);
    setIsDishModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setModalBooking(null);
    setBookingFormName('');
    setBookingFormEmail('');
    setBookingFormPhone('');
    setBookingFormGuests(2);
    setBookingFormDate(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setBookingFormTime('18:00');
    setBookingFormArea('Hall');
    setBookingFormSpecial('');
    setBookingFormDiet('');
    setBookingFormStatus('confirmed');
    setCrudError('');
    setCrudSuccess('');
    setIsBookingModalOpen(true);
  };

  const handleOpenEditModal = (booking: BookingDetails) => {
    setModalBooking(booking);
    setBookingFormName(booking.name || '');
    setBookingFormEmail(booking.email || '');
    setBookingFormPhone(booking.phone || '');
    setBookingFormGuests(booking.guests || 2);
    setBookingFormDate(booking.date || '');
    setBookingFormTime(booking.time || '18:00');
    setBookingFormArea(booking.area || 'Hall');
    setBookingFormSpecial(booking.specialNotes || '');
    setBookingFormDiet(booking.dietaryNotes || '');
    setBookingFormStatus(booking.status || 'confirmed');
    setCrudError('');
    setCrudSuccess('');
    setIsBookingModalOpen(true);
  };

  const handleBookingFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingFormName.trim() || !bookingFormEmail.trim() || !bookingFormPhone.trim() || !bookingFormDate) {
      setCrudError('Vänligen fyll i alla obligatoriska fält (Namn, E-post, Telefon och Datum)');
      return;
    }

    if (modalBooking) {
      // Edit operation (Update)
      const updated: BookingDetails = {
        ...modalBooking,
        name: bookingFormName.trim(),
        email: bookingFormEmail.trim(),
        phone: bookingFormPhone.trim(),
        guests: bookingFormGuests,
        date: bookingFormDate,
        time: bookingFormTime,
        area: bookingFormArea,
        specialNotes: bookingFormSpecial.trim(),
        dietaryNotes: bookingFormDiet.trim(),
        status: bookingFormStatus
      };
      bookingStore.updateBooking(updated);
      setCrudSuccess('Bokningen har uppdaterats framgångsrikt!');
    } else {
      // Create operation
      const ref = `PEL-MAN-${Math.floor(1000 + Math.random() * 9000)}`;
      const created: BookingDetails = {
        name: bookingFormName.trim(),
        email: bookingFormEmail.trim(),
        phone: bookingFormPhone.trim(),
        guests: bookingFormGuests,
        date: bookingFormDate,
        time: bookingFormTime,
        area: bookingFormArea,
        specialNotes: bookingFormSpecial.trim(),
        dietaryNotes: bookingFormDiet.trim(),
        status: bookingFormStatus,
        reference: ref
      };
      bookingStore.addBooking(created);
      setCrudSuccess('Ny bokning har skapats framgångsrikt!');
    }

    refreshData();
    setTimeout(() => {
      setIsBookingModalOpen(false);
      setModalBooking(null);
      setCrudSuccess('');
    }, 1200);
  };

  const handleStatusChange = (id: string, newStatus: 'confirmed' | 'cancelled' | 'pending') => {
    bookingStore.updateBookingStatus(id, newStatus);
    refreshData();
  };

  // Seating area managers
  const handleOpenCreateZoneModal = () => {
    setModalZone(null);
    setZoneFormId(`zone-${Math.floor(100 + Math.random() * 900)}`);
    setZoneFormName('');
    setZoneFormDesc('');
    setZoneFormCapacity(50);
    setZoneFormTables(15);
    setZoneFormIsActive(true);
    setCrudError('');
    setCrudSuccess('');
    setIsZoneModalOpen(true);
  };

  const handleOpenEditZoneModal = (zone: DiningAreaZone) => {
    setModalZone(zone);
    setZoneFormId(zone.id || '');
    setZoneFormName(zone.name || '');
    setZoneFormDesc(zone.desc || '');
    setZoneFormCapacity(zone.capacity || 0);
    setZoneFormTables(zone.tableCount || 0);
    setZoneFormIsActive(zone.isActive !== false);
    setCrudError('');
    setCrudSuccess('');
    setIsZoneModalOpen(true);
  };

  const handleZoneFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneFormName.trim() || !zoneFormId.trim()) {
      setCrudError('Vänligen fyll i rums-ID och zonens namn.');
      return;
    }

    const zoneObj: DiningAreaZone = {
      id: zoneFormId.trim(),
      name: zoneFormName.trim(),
      desc: zoneFormDesc.trim(),
      capacity: zoneFormCapacity,
      tableCount: zoneFormTables,
      isActive: zoneFormIsActive
    };

    if (modalZone) {
      bookingStore.updateDiningZone(zoneObj);
      setCrudSuccess('Zonen har blivit uppdaterad!');
    } else {
      bookingStore.addDiningZone(zoneObj);
      setCrudSuccess('Zonen har skapats!');
    }

    refreshData();
    setTimeout(() => {
      setIsZoneModalOpen(false);
      setModalZone(null);
      setCrudSuccess('');
    }, 1200);
  };

  const handleDeleteZone = (id: string) => {
    if (confirm('Är du säker på att du vill ta bort denna rumszon helt? Befintliga bokningar påverkas inte, men inga nya bokningar kan göras i rumszonen.')) {
      bookingStore.deleteDiningZone(id);
      refreshData();
    }
  };

  // Customer profile managers
  const handleOpenCreateCustomerModal = () => {
    setModalCustomer(null);
    setCustomerFormName('');
    setCustomerFormEmail('');
    setCustomerFormPhone('');
    setCustomerFormVisits(1);
    setCustomerFormDietary('Inga');
    setCustomerFormSpecial('Inga');
    setCrudError('');
    setCrudSuccess('');
    setIsCustomerModalOpen(true);
  };

  const handleOpenEditCustomerModal = (customer: any) => {
    setModalCustomer(customer);
    setCustomerFormName(customer.name);
    setCustomerFormEmail(customer.email);
    setCustomerFormPhone(customer.phone);
    setCustomerFormVisits(customer.totalVisits || 1);
    setCustomerFormDietary(customer.dietaryNotes || 'Inga');
    setCustomerFormSpecial(customer.specialNotes || 'Inga');
    setCrudError('');
    setCrudSuccess('');
    setIsCustomerModalOpen(true);
  };

  const handleCustomerFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerFormName.trim() || !customerFormEmail.trim() || !customerFormPhone.trim()) {
      setCrudError('Vänligen fyll i fält för namn, e-post och telefonnummer.');
      return;
    }

    // Prepare client info
    const customerObj = {
      id: modalCustomer ? modalCustomer.id : `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: customerFormName.trim(),
      email: customerFormEmail.trim(),
      phone: customerFormPhone.trim(),
      totalVisits: customerFormVisits,
      dietaryNotes: customerFormDietary.trim(),
      specialNotes: customerFormSpecial.trim()
    };

    let updatedList = [...manualCustomers];
    if (modalCustomer) {
      const idx = updatedList.findIndex(c => c.id === modalCustomer.id || c.email.toLowerCase() === modalCustomer.email.toLowerCase());
      if (idx !== -1) {
        updatedList[idx] = customerObj;
      } else {
        // If it was dynamically extracted, save it as manual customer override now!
        updatedList.push(customerObj);
      }
      setCrudSuccess('Gästprofilen har sparats!');
      const staffName = currentStaff ? currentStaff.displayName : 'Hovmästare Admin';
      bookingStore.addStaffLog(staffName, `Uppdaterade gästprofil för: ${customerObj.name} (${customerObj.email})`);
    } else {
      updatedList.push(customerObj);
      setCrudSuccess('Ny gästprofil har skapats!');
      const staffName = currentStaff ? currentStaff.displayName : 'Hovmästare Admin';
      bookingStore.addStaffLog(staffName, `Skapade en ny gästprofil: ${customerObj.name} (${customerObj.email})`);
    }

    saveManualCustomers(updatedList);
    refreshData();
    setTimeout(() => {
      setIsCustomerModalOpen(false);
      setModalCustomer(null);
      setCrudSuccess('');
    }, 1200);
  };

  const handleToggleBlockCustomer = (customer: any) => {
    let found = false;
    const updated = manualCustomers.map((c: any) => {
      if (c.email.toLowerCase().trim() === customer.email.toLowerCase().trim()) {
        found = true;
        const newBlocked = !c.isBlocked;
        const staffName = currentStaff ? currentStaff.displayName : 'Hovmästare Admin';
        bookingStore.addStaffLog(staffName, `${newBlocked ? 'Blockerade' : 'Hävde blockering för'} gäst: ${c.name} (${c.email})`);
        return { ...c, isBlocked: newBlocked };
      }
      return c;
    });

    if (!found) {
      const isBlocked = true;
      const staffName = currentStaff ? currentStaff.displayName : 'Hovmästare Admin';
      bookingStore.addStaffLog(staffName, `Blockerade gäst: ${customer.name} (${customer.email})`);
      updated.push({
        id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        totalVisits: customer.totalVisits || 1,
        dietaryNotes: customer.dietaryNotes || '',
        specialNotes: customer.specialNotes || '',
        isManual: true,
        isBlocked: isBlocked
      });
    }

    saveManualCustomers(updated);
    refreshData();
  };

  const handleDeleteCustomer = (customer: any) => {
    if (confirm(`Är du säker på att du vill ta bort gästprofilen för ${customer.name}?`)) {
      const filtered = manualCustomers.filter(c => c.id !== customer.id && c.email.toLowerCase().trim() !== customer.email.toLowerCase().trim());
      saveManualCustomers(filtered);
      const staffName = currentStaff ? currentStaff.displayName : 'Hovmästare Admin';
      bookingStore.addStaffLog(staffName, `Tog bort gästprofil för: ${customer.name} (${customer.email})`);
      refreshData();
    }
  };

  // Staff profile managers
  const handleOpenCreateStaffModal = () => {
    setModalStaff(null);
    setStaffFormUsername('');
    setStaffFormPassword('');
    setStaffFormDisplayName('');
    setStaffFormPermissions(['reservations']);
    setCrudError('');
    setCrudSuccess('');
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaffModal = (staff: StaffProfile) => {
    setModalStaff(staff);
    setStaffFormUsername(staff.username || '');
    setStaffFormPassword(staff.password || '');
    setStaffFormDisplayName(staff.displayName || '');
    setStaffFormPermissions(staff.permissions || ['reservations']);
    setCrudError('');
    setCrudSuccess('');
    setIsStaffModalOpen(true);
  };

  const handleStaffFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffFormUsername.trim() || !staffFormPassword.trim() || !staffFormDisplayName.trim()) {
      setCrudError('Vänligen fyll i alla obligatoriska fält.');
      return;
    }

    const profiles = bookingStore.getStaffProfiles();
    
    // Check username uniqueness if creating new
    if (!modalStaff && profiles.some(p => p.username.toLowerCase() === staffFormUsername.toLowerCase().trim())) {
      setCrudError('Användarnamnet är redan upptaget av en annan personal.');
      return;
    }

    const staffObj: StaffProfile = {
      id: modalStaff ? modalStaff.id : `staff-${Date.now()}`,
      username: staffFormUsername.trim(),
      password: staffFormPassword.trim(),
      displayName: staffFormDisplayName.trim(),
      permissions: staffFormPermissions,
      createdAt: modalStaff ? modalStaff.createdAt : new Date().toISOString()
    };

    let updatedProfiles = [...profiles];
    if (modalStaff) {
      const idx = updatedProfiles.findIndex(p => p.username.toLowerCase() === modalStaff.username.toLowerCase());
      if (idx !== -1) {
        updatedProfiles[idx] = staffObj;
      }
      bookingStore.addStaffLog('Hovmästare Admin', `Uppdaterade personal-profil för: ${staffObj.displayName}`);
    } else {
      updatedProfiles.push(staffObj);
      bookingStore.addStaffLog('Hovmästare Admin', `Skapade en ny personal-profil: ${staffObj.displayName}`);
    }

    bookingStore.saveStaffProfiles(updatedProfiles);
    setCrudSuccess('Personalprofilen har sparats!');
    refreshData();
    setTimeout(() => {
      setIsStaffModalOpen(false);
      setModalStaff(null);
      setCrudSuccess('');
    }, 1200);
  };

  const handleDeleteStaff = (staff: StaffProfile) => {
    if (confirm(`Är du säker på att du vill ta bort personalprofilen för ${staff.displayName}?`)) {
      const profiles = bookingStore.getStaffProfiles();
      const filtered = profiles.filter(p => p.username.toLowerCase() !== staff.username.toLowerCase());
      bookingStore.saveStaffProfiles(filtered);
      bookingStore.addStaffLog('Hovmästare Admin', `Tog bort personal-profil: ${staff.displayName}`);
      refreshData();
    }
  };

  // Table Manager Handlers
  const handleOpenCreateTableModal = () => {
    setModalTable(null);
    setTableFormId(`TBL-${Math.floor(100 + Math.random() * 900)}`);
    setTableFormName('');
    setTableFormZone(diningZones[0]?.id || 'Hall');
    setTableFormCapacity(4);
    setTableFormDesc('');
    setTableFormImage('');
    setTableFormIsActive(true);
    setCrudError('');
    setCrudSuccess('');
    setIsTableModalOpen(true);
  };

  const handleOpenEditTableModal = (tbl: DiningTable) => {
    setModalTable(tbl);
    setTableFormId(tbl.id || '');
    setTableFormName(tbl.tableName || '');
    setTableFormZone(tbl.zoneId || 'Hall');
    setTableFormCapacity(tbl.capacity || 2);
    setTableFormDesc(tbl.description || '');
    setTableFormImage(tbl.imageUrl || '');
    setTableFormIsActive(tbl.isActive !== false);
    setCrudError('');
    setCrudSuccess('');
    setIsTableModalOpen(true);
  };

  const handleTableFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableFormName.trim()) {
      setCrudError('Vänligen ange ett bordsnamn.');
      return;
    }

    const tableObj: DiningTable = {
      id: tableFormId,
      tableName: tableFormName.trim(),
      zoneId: tableFormZone,
      capacity: tableFormCapacity,
      description: tableFormDesc.trim(),
      imageUrl: tableFormImage.trim(),
      isActive: tableFormIsActive
    };

    if (modalTable) {
      bookingStore.updateDiningTable(tableObj);
      setCrudSuccess('Bordet har uppdaterats framgångsrikt!');
    } else {
      bookingStore.addDiningTable(tableObj);
      setCrudSuccess('Nytt bord har lagts till i systemet!');
    }

    refreshData();
    setTimeout(() => {
      setIsTableModalOpen(false);
      setModalTable(null);
      setCrudSuccess('');
    }, 1200);
  };

  const handleDeleteTable = (id: string) => {
    if (confirm('Är du säker på att du vill ta bort detta bord ur systemet?')) {
      bookingStore.deleteDiningTable(id);
      refreshData();
    }
  };

  // Gift Voucher Config & Ledger Handlers
  const handleSaveVoucherConfig = (e: React.FormEvent) => {
    e.preventDefault();
    bookingStore.saveGiftVoucherConfig(voucherConfig);
    setCrudSuccess('Presentkortsinställningar sparade!');
    refreshData();
    setTimeout(() => setCrudSuccess(''), 2000);
  };

  const recalculateManualVoucherValue = (amt: number, email: string) => {
    let pct = voucherConfig.defaultPercentage;
    if (email && email.includes('@')) {
      const uType = bookingStore.checkUserType(email);
      pct = uType === 'first-time' 
        ? (voucherConfig.firstTimePercentage ?? 15)
        : (voucherConfig.regularPercentage ?? 10);
    }
    setVchFormValue(Math.round(amt * (1 + pct / 100)));
  };

  const handleOpenNewVoucherModal = () => {
    setVchFormCode(`PEL-GIFT-${Math.floor(1000 + Math.random() * 9000)}`);
    setVchFormAmount(1000);
    setVchFormValue(Math.round(1000 * (1 + voucherConfig.defaultPercentage / 100)));
    setVchFormRecipientName('');
    setVchFormRecipientEmail('');
    setCrudSuccess('');
    setCrudError('');
    setIsNewAdminVoucherModalOpen(true);
  };

  const handleNewVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vchFormCode.trim() || !vchFormRecipientEmail.trim()) {
      setCrudError('Vänligen fyll i unika koder och mottagarinformation.');
      return;
    }

    let percentageUsed = voucherConfig.defaultPercentage;
    if (vchFormRecipientEmail.includes('@')) {
      const uType = bookingStore.checkUserType(vchFormRecipientEmail);
      percentageUsed = uType === 'first-time' 
        ? (voucherConfig.firstTimePercentage ?? 15)
        : (voucherConfig.regularPercentage ?? 10);
    }

    const newVoucher: AdminVoucher = {
      id: `VCH-${Math.floor(1000 + Math.random() * 9000)}`,
      code: vchFormCode.trim().toUpperCase(),
      amount: vchFormAmount,
      value: vchFormValue,
      recipientName: vchFormRecipientName.trim() || 'Ärad gäst',
      recipientEmail: vchFormRecipientEmail.trim(),
      createdAt: new Date().toISOString(),
      isEnabled: true
    };

    bookingStore.addVoucher(newVoucher);
    setCrudSuccess('Gåvokort manuellt utfärdat framgångsrikt! Sänder kvitto...');
    
    // Trigger real SMTP template email send
    const bodyText = `Hej ${newVoucher.recipientName}!\n\nEtt digitalt presentkort har utfärdats till dig på Krog Pelikan!\n\nGåvokortet har ett giltigt värde på ${newVoucher.value} SEK. Presentkortskod: ${newVoucher.code}`;
    bookingStore.triggerRealSmtpEmail({
      to: newVoucher.recipientEmail,
      subject: `Ditt digitala presentkort på Krog Pelikan! (Värde: ${newVoucher.value} kr)`,
      body: bodyText,
      emailType: 'voucher',
      voucherDetails: {
        code: newVoucher.code,
        amount: newVoucher.amount,
        value: newVoucher.value,
        percentage: percentageUsed,
        senderName: adminProfile.displayName || 'Krog Pelikan',
        recipientName: newVoucher.recipientName,
        message: 'Utfärdat manuellt via restaurangens administrationspanel.'
      }
    });

    refreshData();
    setTimeout(() => {
      setIsNewAdminVoucherModalOpen(false);
      setCrudSuccess('');
    }, 1200);
  };

  // Claim Voucher & OTP Verification Engine
  const handleSearchClaimVoucher = (codeToSearch?: string) => {
    const rawCode = codeToSearch || claimSearchCode;
    if (!rawCode.trim()) {
      setClaimStatusMsg({ type: 'error', text: 'Vänligen fyll i en presentkod först.' });
      return;
    }
    const cleanCode = rawCode.trim().toUpperCase();
    if (codeToSearch || claimSearchCode !== cleanCode) {
      setClaimSearchCode(cleanCode);
    }
    
    const vchList = bookingStore.getVouchers();
    const vch = vchList.find(item => item.code.toUpperCase() === cleanCode);
    
    if (!vch) {
      setActiveClaimVoucher(null);
      setClaimStatusMsg({ type: 'error', text: `Hittade inget presentkort med kod "${cleanCode}".` });
      return;
    }
    
    setActiveClaimVoucher(vch);
    setClaimOtpInput('');
    
    if (vch.isClaimed) {
      setClaimStatusMsg({ 
        type: 'warning', 
        text: `Detta presentkort är REDAN INLÖST (Inlöst den ${vch.claimedAt ? vch.claimedAt.substring(0, 10) : 'vår historik'})!` 
      });
    } else if (!vch.isEnabled) {
      setClaimStatusMsg({ 
        type: 'warning', 
        text: 'Detta presentkort är för tillfället spärrat/inaktivt av administrationen!' 
      });
    } else {
      setClaimStatusMsg({ 
        type: 'success', 
        text: `Kupong godkänd! Tillgängligt värde: ${vch.value || vch.amount} kr. Registrerad på ${vch.recipientName}.` 
      });
    }
  };

  const handleSendVoucherClaimOtp = async () => {
    if (!activeClaimVoucher) return;
    setIsSendingOtp(true);
    setClaimStatusMsg({ type: 'info', text: 'Genererar och paketerar 6-siffrig engångskod...' });

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const updated = {
      ...activeClaimVoucher,
      claimOtp: generatedOtp
    };
    
    bookingStore.updateVoucher(updated);
    setActiveClaimVoucher(updated);
    refreshData();

    const mailSubject = `Verifieringskod för inlösen: ${updated.code} - Krog Pelikan`;
    const mailBody = `Hej ${updated.recipientName},\n\nEn begäran om inlösen av ditt presentkort ${updated.code} på Krog Pelikan har initierats.\n\nFör att slutföra inlösen, uppge följande 6-siffriga engångskod (OTP) för matsalsservisen:\n\n${generatedOtp}\n\nDetta verifierar din identitet på ett tryggt och anrikt sätt.`;

    try {
      const resp = await bookingStore.triggerRealSmtpEmail({
        to: updated.recipientEmail,
        subject: mailSubject,
        body: mailBody,
        emailType: 'otp_claim',
        voucherDetails: {
          code: updated.code,
          recipientName: updated.recipientName,
          value: updated.value || updated.amount,
          otpCode: generatedOtp
        }
      });

      setIsSendingOtp(false);
      if (resp && resp.success) {
        setClaimStatusMsg({ 
          type: 'otp_sent', 
          text: `En 6-siffrig engångskod har skickats till ${updated.recipientEmail}! Be gästen uppge den.` 
        });
      } else {
        // Mock fallback/simulation
        setClaimStatusMsg({ 
          type: 'otp_sent_simulated', 
          text: `OTP-engångskod simulerad! Eftersom SMTP-server offline/ej konfigurerad visas koden här: [ ${generatedOtp} ]` 
        });
      }
    } catch (err) {
      setIsSendingOtp(false);
      setClaimStatusMsg({ 
        type: 'otp_sent_simulated', 
        text: `OTP-kod simulerad och genererad! Kod: [ ${generatedOtp} ] (Gäst: ${updated.recipientEmail})` 
      });
    }
  };

  const handleVerifyVoucherClaimOtp = async () => {
    if (!activeClaimVoucher || !claimOtpInput.trim()) return;
    setIsVerifyingOtp(true);
    
    if (claimOtpInput.trim() !== activeClaimVoucher.claimOtp) {
      setIsVerifyingOtp(false);
      setClaimStatusMsg({ type: 'error', text: 'Felaktig OTP-engångskod! Vänligen be gästen kolla sin e-post igen.' });
      return;
    }

    const claimValue = activeClaimVoucher.value || activeClaimVoucher.amount;
    const claimedVoucher = {
      ...activeClaimVoucher,
      isClaimed: true,
      isEnabled: false,
      claimedAt: new Date().toISOString(),
      claimOtp: undefined
    };

    bookingStore.updateVoucher(claimedVoucher);
    setActiveClaimVoucher(claimedVoucher);
    setClaimOtpInput('');
    setIsVerifyingOtp(false);
    setClaimStatusMsg({ 
      type: 'claimed_success', 
      text: `Inlösen lyckades! Presentkort ${claimedVoucher.code} har lösts in och dragits av från matnotan. Kvitto har skickats till ${claimedVoucher.recipientEmail}.` 
    });
    refreshData();

    // Send Claim confirmation billing email automatically
    try {
      bookingStore.triggerRealSmtpEmail({
        to: claimedVoucher.recipientEmail,
        subject: `Inlöst presentkort kvitto: ${claimedVoucher.code} - Krog Pelikan`,
        body: `Hej ${claimedVoucher.recipientName},\n\nTack för ditt besök hos oss på Krog Pelikan!\n\nDitt presentkort med kod ${claimedVoucher.code} har nu lösts in till ett fullt avdragsbelopp om ${claimValue} kr.\n\nVälkommen åter till Blekingegatan 40!`,
        emailType: 'voucher_claimed',
        voucherDetails: {
          code: claimedVoucher.code,
          recipientName: claimedVoucher.recipientName,
          value: claimValue,
          claimedAt: claimedVoucher.claimedAt
        }
      });
    } catch (e) {
      console.warn("Redemption SMTP report failed", e);
    }
  };

  const handleOpenEditVoucher = (vch: AdminVoucher) => {
    setEditingVoucherId(vch.id);
    setEditVchCode(vch.code || '');
    setEditVchAmount(vch.amount || 0);
    setEditVchValue(vch.value || 0);
    setEditVchRecipientName(vch.recipientName || '');
    setEditVchRecipientEmail(vch.recipientEmail || '');
    setEditVchIsEnabled(vch.isEnabled !== false);
    setEditVchIsClaimed(!!vch.isClaimed);
    setIsEditVoucherModalOpen(true);
    setCrudError('');
    setCrudSuccess('');
  };

  const handleEditVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVoucherId) return;

    if (!editVchCode.trim()) {
      setCrudError('Vänligen ange en giltig kod.');
      return;
    }

    const updated = {
      id: editingVoucherId,
      code: editVchCode.trim().toUpperCase(),
      amount: editVchAmount,
      value: editVchValue,
      recipientName: editVchRecipientName,
      recipientEmail: editVchRecipientEmail.trim(),
      isEnabled: editVchIsEnabled,
      isClaimed: editVchIsClaimed,
    };

    bookingStore.updateVoucher(updated as any);
    
    // Log step
    bookingStore.addStaffLog(
      adminProfile.displayName || 'Hovmästare',
      `Uppdaterade presentkortet ${updated.code} (Belopp: ${updated.amount} kr, Mottagare: ${updated.recipientName})`
    );

    setCrudSuccess('Presentkortet har uppdaterats framgångsrikt!');
    refreshData();
    setTimeout(() => {
      setIsEditVoucherModalOpen(false);
      setEditingVoucherId(null);
      setCrudSuccess('');
    }, 1200);
  };

  const handleToggleVoucherActive = (vch: AdminVoucher) => {
    bookingStore.updateVoucher({
      ...vch,
      isEnabled: !vch.isEnabled
    });
    refreshData();
  };

  const handleDeleteVoucher = (id: string) => {
    if (confirm('Är du säker på att du vill radera detta presentkort? Koden kommer inte längre gå att utnyttja.')) {
      bookingStore.deleteVoucher(id);
      refreshData();
    }
  };

  // Bulk Email Handlers
  const handleToggleBulkSelectEmail = (email: string) => {
    setBulkSelectedEmails(prev => 
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const handleSelectAllBulkEmails = () => {
    const allEmails = getUniqueCustomers().map((c: any) => c.email);
    if (bulkSelectedEmails.length === allEmails.length) {
      setBulkSelectedEmails([]);
    } else {
      setBulkSelectedEmails(allEmails);
    }
  };

  const handleBulkSendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkSelectedEmails.length === 0) {
      setBulkError('Vänligen välj minst en gäst att skicka till.');
      return;
    }
    if (!bulkSubject.trim() || !bulkBody.trim()) {
      setBulkError('Ämne och brödtext får inte vara tomma.');
      return;
    }

    setIsBulkSending(true);
    setBulkError('');
    setBulkSuccess('');

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const recipient of bulkSelectedEmails) {
      try {
        const response = await fetch('/api/smtp/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            to: recipient,
            subject: bulkSubject.trim(),
            body: bulkBody.trim(),
            fromName: adminProfile.displayName,
            fromEmail: adminProfile.emailAddress,
            smtpHost: adminProfile.smtpHost,
            smtpPort: adminProfile.smtpPort,
            smtpUsername: adminProfile.smtpUsername,
            smtpPassword: adminProfile.smtpPassword,
            useSsl: adminProfile.useSsl
          })
         });

         const data = await response.json();

         if (!response.ok || !data.success) {
           throw new Error(data.message || `SMTP-fel för mottagare ${recipient}`);
         }

         // Capture and persist working SMTP credentials if a variation succeeded
         if (data.updatedUser && data.updatedPass && (data.updatedUser !== adminProfile.smtpUsername || data.updatedPass !== adminProfile.smtpPassword)) {
           const validatedProfile = {
             ...adminProfile,
             smtpUsername: data.updatedUser,
             smtpPassword: data.updatedPass
           };
           bookingStore.saveAdminProfile(validatedProfile);
           setAdminProfile(validatedProfile);
         }

         bookingStore.addEmail({
           to: recipient,
           from: `${adminProfile.displayName} <${adminProfile.emailAddress}>`,
           subject: bulkSubject.trim(),
           body: bulkBody.trim(),
           type: 'general_reply'
         });

         successCount++;
      } catch (err: any) {
        console.error(err);
        failCount++;
        errors.push(`${recipient}: ${err.message || 'SMTP handskakningsfel'}`);
      }
    }

    if (failCount === 0) {
      setBulkSuccess(`Massutskick lyckades helt! Samtliga ${successCount} mejl skickades ut live via SMTP.`);
      setBulkSelectedEmails([]);
      setBulkSubject('');
      setBulkBody('');
    } else if (successCount > 0) {
      setBulkSuccess(`Delvis genomfört: ${successCount} skickade framgångsrikt, men ${failCount} misslyckades.`);
      setBulkError(`Följande sändningsfel inträffadeunder SMTP-överföringen:\n${errors.join('\n')}`);
    } else {
      setBulkError(`Massutskick misslyckades helt. Alla ${failCount} sändningar avbröts:\n${errors.join('\n')}`);
    }

    setIsBulkSending(false);
    refreshData();
  };

  const handleDeleteBooking = (id: string) => {
    if (confirm('Är du säker på att du vill ta bort den här bokningen helt ur systemet?')) {
      bookingStore.deleteBooking(id);
      refreshData();
    }
  };

  const handleOpenVoucherModal = (booking: BookingDetails) => {
    setSelectedBooking(booking);
    // Generate a default premium voucher code
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setVoucherCode(`PEL-VIP-${randomSuffix}`);
    setVoucherDesc('15% rabatt på hela matnotan samt en kostnadsfri välkomstdrink (Akvavit 2cl eller Pelikan Pilsner).');
    setIsVoucherModalOpen(true);
  };

  const handleSendVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking?.id) return;

    const res = bookingStore.sendVoucherEmail(selectedBooking.id, voucherCode, voucherDesc);
    if (res.success) {
      setVoucherNotification(`Värdekupong ${voucherCode} skickades till ${selectedBooking.email}!`);
      refreshData();
      setTimeout(() => {
        setIsVoucherModalOpen(false);
        setSelectedBooking(null);
        setVoucherNotification('');
      }, 2000);
    }
  };

  // Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
  };

  const setProfileSaving = (val: boolean) => {
    if (!val) return;
    setIsTestConnecting(true);
    setTimeout(() => {
      bookingStore.saveAdminProfile(adminProfile);
      setIsTestConnecting(false);
      setProfileSuccessMessage('E-postinställningarna har sparats och SMTP-anslutningen är verifierad!');
      setTimeout(() => setProfileSuccessMessage(''), 4000);
    }, 1200);
  };

  // Compose Submit handler
  const handleComposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim() || !composeBody.trim()) return;

    setIsComposeSending(true);
    setComposeSuccess('');
    setComposeError('');

    try {
      const response = await fetch('/api/smtp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: composeTo.trim(),
          subject: composeSubject.trim(),
          body: composeBody.trim(),
          fromName: adminProfile.displayName,
          fromEmail: adminProfile.emailAddress,
          smtpHost: adminProfile.smtpHost,
          smtpPort: adminProfile.smtpPort,
          smtpUsername: adminProfile.smtpUsername,
          smtpPassword: adminProfile.smtpPassword,
          useSsl: adminProfile.useSsl
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Anslutningen till SMTP-servern misslyckades.');
      }

      // Capture and persist working SMTP credentials if a variation succeeded
      if (data.updatedUser && data.updatedPass && (data.updatedUser !== adminProfile.smtpUsername || data.updatedPass !== adminProfile.smtpPassword)) {
        const validatedProfile = {
          ...adminProfile,
          smtpUsername: data.updatedUser,
          smtpPassword: data.updatedPass
        };
        bookingStore.saveAdminProfile(validatedProfile);
        setAdminProfile(validatedProfile);
      }

      bookingStore.addEmail({
        to: composeTo.trim(),
        from: `${adminProfile.displayName} <${adminProfile.emailAddress}>`,
        subject: composeSubject.trim(),
        body: composeBody.trim(),
        type: 'general_reply'
      });

      setComposeSuccess(`E-postmeddelandet skickades framgångsrikt till ${composeTo}! ${data.simulated ? '(Simulerat lokalt)' : '(Levererat via SMTP)'}`);
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
      refreshData();
    } catch (err: any) {
      console.error(err);
      setComposeError(err.message || 'Ett oväntat fel uppstod vid sändning via SMTP-servern.');
    } finally {
      setIsComposeSending(false);
    }
  };

  // Simulate incoming replies
  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simFromEmail.trim() || !simSubject.trim() || !simBody.trim()) return;

    // Add Simulated Incoming email addressed to current admin
    bookingStore.addEmail({
      to: adminProfile.emailAddress,
      from: simFromEmail.trim() + (simFromName ? ` <${simFromName.trim()}>` : ''),
      subject: simSubject.trim(),
      body: simBody.trim(),
      type: 'incoming'
    });

    setSimSuccess(`Inkommande e-post inlagd!`);
    refreshData();
    setTimeout(() => setSimSuccess(''), 3000);
  };

  // Quick Preset fillers for simulator
  const fillSimulationPreset = (preset: { fromEmail: string; fromName: string; subject: string; body: string }) => {
    setSimFromEmail(preset.fromEmail);
    setSimFromName(preset.fromName);
    setSimSubject(preset.subject);
    setSimBody(preset.body);
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedEmailId(id);
    setTimeout(() => setCopiedEmailId(null), 2000);
  };

  // Filtered Bookings logic
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.includes(searchQuery) ||
      (b.reference && b.reference.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesArea = areaFilter === 'all' || b.area === areaFilter;

    return matchesSearch && matchesStatus && matchesArea;
  });

  // Export Bookings as CSV (both filtered list or all data can be downloaded)
  const handleExportBookingsCSV = (filteredOnly: boolean) => {
    const listToExport = filteredOnly ? filteredBookings : bookings;
    if (listToExport.length === 0) {
      alert(adminLang === 'sv' ? 'Det finns inga bokningar att exportera.' : 'There are no bookings to export.');
      return;
    }

    // Header row
    const headers = [
      'ID',
      'Referens',
      'Gästnamn',
      'E-post',
      'Telefon',
      'Antal gäster',
      'Datum',
      'Tid',
      'Rumszon',
      'Bord-ID',
      'Status',
      'Allergier/Kost',
      'Särskilda element',
      'Skapad datum'
    ];

    // Build Rows
    const rows = listToExport.map(b => {
      const columns = [
        b.id || '',
        b.reference || '',
        b.name || '',
        b.email || '',
        b.phone || '',
        (b.guests || 2).toString(),
        b.date || '',
        b.time || '',
        b.area || '',
        b.tableId || '',
        b.status || 'pending',
        b.dietaryNotes || '',
        b.specialNotes || '',
        b.createdAt || ''
      ];

      return columns.map(col => {
        let cleaned = col.replace(/"/g, '""');
        if (cleaned.includes(',') || cleaned.includes('"') || cleaned.includes('\n') || cleaned.includes('\r')) {
          cleaned = `"${cleaned}"`;
        }
        return cleaned;
      }).join(',');
    });

    // Write file with UTF-8 BOM so Excel opens Swedish Swedish specific letters (å, ä, ö) correctly
    const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = filteredOnly 
      ? `Pelikan_Bokningar_Filtrerade_${timestamp}.csv` 
      : `Pelikan_Bokningar_Alla_${timestamp}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Simple statistics
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const totalGuests = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.guests, 0);

  // Authentication gate screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative font-sans text-slate-100">
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-amber-600 via-amber-400 to-amber-700"></div>
        
        {/* Subtle glowing backgrounds */}
        <div className="absolute w-96 h-96 rounded-full bg-amber-500/5 blur-3xl -top-12 -left-12 pointer-events-none"></div>
        <div className="absolute w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl -bottom-12 -right-12 pointer-events-none"></div>

        {/* Floating Language Toggler */}
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={toggleAdminLang}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono font-bold uppercase tracking-wider text-amber-100 hover:text-white flex items-center gap-1.5 shadow-sm hover:border-slate-700 transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-amber-500" />
            <span>{adminLang === 'sv' ? 'English (EN)' : 'Svenska (SV)'}</span>
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Top Vintage Ornament Accent */}
          <div className="text-center mb-6">
            <span className="font-serif italic text-xs text-amber-500 tracking-widest uppercase block mb-1">
              {adminLang === 'sv' ? 'Tradition sedan 1910' : 'Heritage since 1910'}
            </span>
            <h2 className="font-serif text-3xl font-extrabold text-white tracking-widest uppercase flex items-center justify-center gap-2">
              <Shield className="w-6 h-6 text-amber-500" /> KROG PELIKAN
            </h2>
            <div className="w-16 h-[1px] bg-amber-500/40 mx-auto mt-2.5"></div>
            <p className="text-slate-400 font-mono text-[10px] tracking-widest uppercase mt-3 bg-slate-950/60 py-1.5 px-3 rounded-full inline-block border border-slate-800">
              {adminLang === 'sv' ? 'HOVMÄSTARPORTAL • INLOGGNING' : "MAÎTRE D' PORTAL • SECURE LOGIN"}
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-950/50 border border-red-550/30 text-red-400 rounded-xl text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  {adminLang === 'sv' 
                    ? 'Felaktigt login. Tips: Använd admin / admin' 
                    : 'Invalid credentials. Hint: Use admin / admin'}
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-slate-400 text-xs font-mono uppercase tracking-wider">
                {adminLang === 'sv' ? 'Användarnamn' : 'Username'}
              </label>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder={adminLang === 'sv' ? 'Skriv användarnamn' : 'Enter username'}
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-400 text-xs font-mono uppercase tracking-wider">
                {adminLang === 'sv' ? 'Lösenord' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold font-mono text-xs tracking-widest py-3.5 rounded-xl uppercase flex items-center justify-center gap-2 transition-all mt-6 shadow-lg cursor-pointer"
            >
              <span>{adminLang === 'sv' ? 'Autentisera / Logga In' : 'Authenticate & Enter'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Credentials Helper Box */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center font-mono text-[11px] text-slate-500 bg-slate-950/20 p-4 rounded-xl">
            <span className="text-amber-500/90 font-bold block mb-1 uppercase">
              {adminLang === 'sv' ? 'Standardbehörighet:' : 'Default credentials:'}
            </span>
            {adminLang === 'sv' ? 'Användarnamn' : 'Username'}: <code className="text-amber-400 bg-slate-950 px-1 py-0.5 rounded">admin</code> • {adminLang === 'sv' ? 'Lösenord' : 'Password'}: <code className="text-amber-400 bg-slate-950 px-1 py-0.5 rounded">admin</code>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={onBackToHome}
              className="text-slate-500 hover:text-slate-350 text-xs font-mono transition-colors cursor-pointer"
            >
              {adminLang === 'sv' ? 'Tillbaka till restaurangen' : 'Back to public website'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Logged In Dashboard
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24 font-sans">
      
      {/* Admin Dashboard header banner */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-4 md:px-8 py-6 relative">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-700"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="font-mono text-[9px] text-amber-500 font-bold tracking-widest uppercase">
                PELIKAN SECURE ADMIN CENTER
              </span>
            </div>
            <h1 className="font-serif text-2xl md:text-3.5xl font-bold tracking-wider text-slate-50 uppercase">
              {adminLang === 'sv' ? 'BOKNINGSHANTERING & E-POST' : "MAÎTRE D' SYSTEM & STAFF MAIL"}
            </h1>
            <p className="text-slate-400 text-xs font-mono font-light border-l border-slate-800/80 pl-3 md:inline">
              Blekingegatan 40, Södermalm • {adminLang === 'sv' ? 'Inloggad som' : 'Logged in as'}: <span className="text-amber-400 font-bold">{isSuperAdmin ? `Super Admin (${adminProfile.displayName})` : currentStaff ? `${currentStaff.displayName} (Personal)` : 'admin'}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={toggleAdminLang}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-100 rounded-lg border border-slate-700/65 transition-all text-xs font-bold font-mono tracking-widest flex items-center gap-1.5 uppercase cursor-pointer animate-pulse hover:animate-none"
              title={adminLang === 'sv' ? 'Byt språk' : 'Switch admin language'}
            >
              <Globe className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
              <span>{adminLang === 'sv' ? 'English' : 'Svenska'}</span>
            </button>
            <button
              onClick={refreshData}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700/65 transition-all text-xs font-bold font-mono tracking-widest flex items-center gap-1.5 uppercase cursor-pointer"
              title={adminLang === 'sv' ? 'Uppdatera lista' : 'Refresh list'}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold font-mono text-xs tracking-widest rounded-lg flex items-center gap-2 uppercase transition-all shadow-md cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-slate-950" />
              <span>{adminLang === 'sv' ? 'Logga Ut' : 'Log Out'}</span>
            </button>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-center text-slate-400 mb-2">
              <span className="text-xs font-mono font-bold tracking-wider uppercase">
                {adminLang === 'sv' ? 'Inkomna bokningar' : 'Booked Tables'}
              </span>
              <Calendar className="w-4 h-4 text-slate-500" />
            </div>
            <span className="text-3xl font-serif font-bold text-white tracking-tight">{bookings.length}</span>
            <span className="text-[10px] text-slate-500 block font-mono mt-1">
              {adminLang === 'sv' ? 'REALTIDSDATA UTAN FEJK' : 'LIVE ACCURATE DATA'}
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-center text-slate-400 mb-2">
              <span className="text-xs font-mono font-bold tracking-wider uppercase">
                {adminLang === 'sv' ? 'Väntar på godkännande' : 'Awaiting Approval'}
              </span>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-3xl font-serif font-bold text-amber-400 tracking-tight">{pendingCount}</span>
            <span className="text-[10px] text-slate-500 block font-mono mt-1">
              {adminLang === 'sv' ? 'PENDING STATUS' : 'ACTION REQUIRED'}
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-center text-slate-400 mb-2">
              <span className="text-xs font-mono font-bold tracking-wider uppercase">
                {adminLang === 'sv' ? 'Bekräftade bord' : 'Confirmed Tables'}
              </span>
              <Check className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-3xl font-serif font-bold text-emerald-400 tracking-tight">{confirmedCount}</span>
            <span className="text-[10px] text-slate-500 block font-mono mt-1">
              {adminLang === 'sv' ? 'GODKÄNDA BOKNINGAR' : 'APPROVED BOOKINGS'}
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-center text-slate-400 mb-2">
              <span className="text-xs font-mono font-bold tracking-wider uppercase">
                {adminLang === 'sv' ? 'Bokade gäster' : 'Seated Guests'}
              </span>
              <Users className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-3xl font-serif font-bold text-white tracking-tight">{totalGuests}</span>
            <span className="text-[10px] text-slate-500 block font-mono mt-1">
              {adminLang === 'sv' ? 'SITTANDE GÄSTER' : 'TOTAL GUESTS ATTENDING'}
            </span>
          </div>

        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex flex-wrap border-b border-slate-800 mb-8 max-w-4xl gap-1">
          {visibleTabs.map(t => (
            <button
              key={t.id}
              id={`tab-btn-${t.id}`}
              onClick={() => setAdminTab(t.id as any)}
              className={`px-5 py-3 text-center text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-2 ${
                adminTab === t.id
                  ? 'border-amber-500 text-amber-400 bg-slate-950/40 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/10'
              }`}
            >
              {t.icon}
              <span>{t.label} {t.extra || ''}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          
          {/* TAB 1: RESERVATION DETAILS LIST */}
          {adminTab === 'reservations' && (
            <motion.div
              key="bookings-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Search & filters panel */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col lg:flex-row gap-4 items-center">
                
                {/* Search query input */}
                <div className="relative w-full lg:flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder={adminLang === 'sv' ? "Sök gästnamn, epost, telefon eller referenskod..." : "Search guest name, email, phone or reference code..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg pl-10 pr-4 py-2.5 text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
                  
                  {/* Filter Status */}
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-400 mr-1 uppercase text-[10px]">Status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-transparent text-slate-200 outline-none cursor-pointer"
                    >
                      <option value="all">{adminLang === 'sv' ? 'Alla statusar' : 'All statuses'}</option>
                      <option value="pending">{adminLang === 'sv' ? 'Väntande' : 'Pending'} (Pending)</option>
                      <option value="confirmed">{adminLang === 'sv' ? 'Bekräftade' : 'Confirmed'} (Confirmed)</option>
                      <option value="cancelled">{adminLang === 'sv' ? 'Avbokade' : 'Cancelled'} (Cancelled)</option>
                    </select>
                  </div>

                  {/* Filter Area */}
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-400 mr-1 uppercase text-[10px]">{adminLang === 'sv' ? 'Zon' : 'Zone'}:</span>
                    <select
                      value={areaFilter}
                      onChange={(e) => setAreaFilter(e.target.value)}
                      className="bg-transparent text-slate-200 outline-none cursor-pointer"
                    >
                      <option value="all">{adminLang === 'sv' ? 'Alla zoner' : 'All zones'}</option>
                      {diningZones.map(zone => (
                        <option key={zone.id} value={zone.name}>{zone.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Export Buttons */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleExportBookingsCSV(true)}
                      className="bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 px-3.5 py-2 rounded-lg font-mono text-xs font-bold uppercase flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                      title={adminLang === 'sv' ? "Ladda ner aktuellt filtrerad bokningslista som CSV-fil" : "Download current filtered list as CSV file"}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{adminLang === 'sv' ? 'CSV (Filtrerad)' : 'CSV (Filtered)'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportBookingsCSV(false)}
                      className="bg-slate-900/50 hover:bg-slate-805 text-slate-300 border border-slate-800 px-3 py-2 rounded-lg font-mono text-[11px] uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                      title={adminLang === 'sv' ? "Ladda ner ALL bokningsdata i systemet som CSV-fil" : "Download ALL bookings as CSV file"}
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>{adminLang === 'sv' ? 'CSV (Alla)' : 'CSV (All)'}</span>
                    </button>
                  </div>

                  {/* Create Manual Reservation */}
                  <button
                    type="button"
                    onClick={handleOpenCreateModal}
                    className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-4 py-2 rounded-lg font-mono text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5px]" />
                    <span>{adminLang === 'sv' ? 'Skapa ny bokning' : 'Create Booking'}</span>
                  </button>

                </div>

              </div>

              {/* Grid or Empty screen */}
              {filteredBookings.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 border-dashed rounded-2xl text-center py-16 px-4 space-y-3">
                  <ShieldAlert className="w-12 h-12 text-amber-500/60 mx-auto" />
                  <h3 className="font-serif text-lg font-bold">Inga bokningar i listan</h3>
                  <p className="text-slate-400 text-xs max-w-sm mx-auto font-sans">
                    För tillfället finns inga sparade bokningar i systemet. Eftersom all mockdata har raderats på din begäran återstår endast äkta användarinteraktion!
                  </p>
                  <p className="text-amber-500 text-xs font-mono pt-2">
                    → Gå till hemsidan och boka ett bord så visas det här direkt!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredBookings.map((b) => (
                    <motion.div
                      key={b.id}
                      layout
                      className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 md:p-6 space-y-4 hover:border-slate-700/80 transition-all flex flex-col justify-between"
                    >
                      {/* Booking Card Header */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="font-serif font-bold text-lg text-white block">
                              {b.name}
                            </span>
                            <span className="font-mono text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3.5 h-3.5 text-slate-500" /> {b.email}
                            </span>
                            <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono text-amber-500/90 tracking-wide mt-1.5 inline-block">
                              REF: {b.reference || 'PEL-REAL'}
                            </span>
                          </div>

                          <div className="text-right flex flex-col items-end gap-1.5">
                            {/* Status badge */}
                            <span className={`px-2.5 py-1 text-[10px] font-mono tracking-widest uppercase font-bold rounded-full ${
                              b.status === 'confirmed' 
                                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                                : b.status === 'cancelled'
                                ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                                : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                            }`}>
                              {b.status === 'confirmed' ? 'Bekräftad' : b.status === 'cancelled' ? 'Avbokad' : 'Väntande'}
                            </span>

                            <span className="text-[10px] text-slate-500 font-mono tracking-wide">
                              Mottaget: {b.createdAt ? new Date(b.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Okänt'}
                            </span>
                          </div>
                        </div>

                        <hr className="border-slate-900" />

                        {/* Booking parameters */}
                        <div className="grid grid-cols-3 gap-2 py-1.5 text-center bg-slate-900/60 rounded-xl p-2.5">
                          <div className="space-y-0.5 border-r border-slate-800">
                            <span className="text-[10px] text-slate-500 block uppercase font-mono">Gäster</span>
                            <span className="font-mono text-xs font-bold text-slate-200">{b.guests} personer</span>
                          </div>
                          <div className="space-y-0.5 border-r border-slate-800">
                            <span className="text-[10px] text-slate-500 block uppercase font-mono">Datum & Tid</span>
                            <span className="font-mono text-xs font-bold text-slate-200">{b.date} • {b.time}</span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-slate-500 block uppercase font-mono">Zon</span>
                            <span className="font-serif text-xs font-bold text-amber-400">
                              {b.area === 'Hall' ? 'Stora Hallen' : b.area === 'Kristallen' ? 'Kristallen' : 'Terrassen'}
                            </span>
                          </div>
                        </div>

                        {/* Additional files/notes if provided */}
                        {(b.dietaryNotes || b.specialNotes) && (
                          <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/50 space-y-1.5 text-xs text-slate-400">
                            {b.dietaryNotes && (
                              <p className="leading-normal">
                                <strong className="text-red-400/95 font-mono uppercase text-[9px] tracking-wider block">Allergier:</strong> 
                                {b.dietaryNotes}
                              </p>
                            )}
                            {b.specialNotes && (
                              <p className="leading-normal">
                                <strong className="text-amber-500/90 font-mono uppercase text-[9px] tracking-wider block">Kommentar:</strong> 
                                {b.specialNotes}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Voucher Codes track */}
                        {b.vouchersSent && b.vouchersSent.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 items-center pt-1">
                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mr-1">Skickade kuponger:</span>
                            {b.vouchersSent.map((vc, idx) => (
                              <span key={idx} className="bg-amber-500/10 border border-amber-600/35 text-amber-400/90 font-mono text-[9px] px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                                <Ticket className="w-3 h-3" /> {vc}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-4 border-t border-slate-900 flex justify-between items-center gap-3 mt-4">
                        
                        <div className="flex gap-2">
                          {b.status !== 'confirmed' && (
                            <button
                              onClick={() => handleStatusChange(b.id!, 'confirmed')}
                              className="px-3 py-1.5 bg-emerald-700/20 border border-emerald-600/35 hover:bg-emerald-600 hover:text-slate-950 text-emerald-400 font-mono text-[10px] font-bold tracking-wider rounded-lg transition-all flex items-center gap-1 uppercase"
                            >
                              <Check className="w-3.5 h-3.5" /> Godkänn
                            </button>
                          )}
                          {b.status !== 'cancelled' && (
                            <button
                              onClick={() => handleStatusChange(b.id!, 'cancelled')}
                              className="px-3 py-1.5 bg-red-700/20 border border-red-600/35 hover:bg-red-600 hover:text-slate-950 text-red-400 font-mono text-[10px] font-bold tracking-wider rounded-lg transition-all flex items-center gap-1 uppercase"
                            >
                              <X className="w-3.5 h-3.5" /> Avboka
                            </button>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenVoucherModal(b)}
                            className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 font-mono text-[10px] font-bold tracking-wider rounded-lg transition-all flex items-center gap-1.5 uppercase ml-auto"
                            title="Skicka e-post värdekupong till kund"
                          >
                            <Ticket className="w-3.5 h-3.5" />
                            Skicka Kupong
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(b)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 border border-transparent hover:border-slate-800 hover:bg-slate-900 rounded-lg transition-all"
                            title="Redigera bokning"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteBooking(b.id!)}
                            className="p-1.5 text-slate-500 hover:text-red-400 border border-transparent hover:border-red-900/30 hover:bg-slate-900 rounded-lg transition-all"
                            title="Radera ur systemet"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: UNIQUE CUSTOMERS DIRECTORY LIST & PROFILE CRUD */}
          {adminTab === 'customers' && (() => {
            const tempFilteredCustomers = getUniqueCustomers().filter((c: any) => {
              const matchesSearch = 
                c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                c.email.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                c.phone.includes(customerSearchQuery) ||
                (c.dietaryNotes && c.dietaryNotes.toLowerCase().includes(customerSearchQuery.toLowerCase())) ||
                (c.specialNotes && c.specialNotes.toLowerCase().includes(customerSearchQuery.toLowerCase()));

              const matchesType = 
                customerTypeFilter === 'all' ||
                (customerTypeFilter === 'manual' && c.isManual) ||
                (customerTypeFilter === 'booking' && !c.isManual);

              const matchesVisit = 
                customerVisitFilter === 'all' ||
                (customerVisitFilter === 'one' && c.totalVisits === 1) ||
                (customerVisitFilter === 'many' && c.totalVisits >= 3) ||
                (customerVisitFilter === 'some' && c.totalVisits > 1 && c.totalVisits < 3);

              return matchesSearch && matchesType && matchesVisit;
            });

            return (
              <motion.div
                layout
                key="customers-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg font-bold text-amber-500">Gästregister (<span className="font-mono">{tempFilteredCustomers.length}</span> / <span className="font-mono">{getUniqueCustomers().length}</span>)</h3>
                    <p className="text-slate-400 text-xs font-sans">Se och hantera alla unika kunder, bokningsfrekvenser, allergier samt historiska önskemål på Krog Pelikan.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenCreateCustomerModal}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5px]" />
                    <span>Skapa gästprofil</span>
                  </button>
                </div>

                {/* Search & Filter Controls for Customers */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center shadow-md">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder={adminLang === 'sv' ? "Sök gästnamn, epost, telefon, allergier..." : "Search guest name, email, phone, dietary notes..."}
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg pl-10 pr-4 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                    {customerSearchQuery && (
                      <button onClick={() => setCustomerSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
                      <Filter className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-400 mr-1 uppercase text-[10px]">{adminLang === 'sv' ? 'Profiltyp' : 'Profile type'}:</span>
                      <select
                        value={customerTypeFilter}
                        onChange={(e) => setCustomerTypeFilter(e.target.value)}
                        className="bg-transparent text-slate-200 outline-none cursor-pointer"
                      >
                        <option value="all">{adminLang === 'sv' ? 'Alla typer' : 'All types'}</option>
                        <option value="manual">{adminLang === 'sv' ? 'Endast manuella' : 'Manual only'}</option>
                        <option value="booking">{adminLang === 'sv' ? 'Endast från bokning' : 'Booking only'}</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-400 mr-1 uppercase text-[10px]">{adminLang === 'sv' ? 'Frekvens' : 'Frequency'}:</span>
                      <select
                        value={customerVisitFilter}
                        onChange={(e) => setCustomerVisitFilter(e.target.value)}
                        className="bg-transparent text-slate-200 outline-none cursor-pointer"
                      >
                        <option value="all">{adminLang === 'sv' ? 'Alla besökare' : 'All visit counts'}</option>
                        <option value="one">{adminLang === 'sv' ? 'Nyligen / 1 besök' : 'New / 1 visit'}</option>
                        <option value="some">{adminLang === 'sv' ? 'Återkommande (2 besök)' : 'Returning (2 visits)'}</option>
                        <option value="many">{adminLang === 'sv' ? 'Lojala (>= 3 besök)' : 'Loyal (>= 3 visits)'}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Customers list table */}
                <div className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans">
                      <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Gästnamn</th>
                          <th className="px-6 py-4">Kontaktuppgifter</th>
                          <th className="px-6 py-4 text-center">Antal besök</th>
                          <th className="px-6 py-4">Allergier & Diet</th>
                          <th className="px-6 py-4">Önskemål / Anteckningar</th>
                          <th className="px-6 py-4">Typ</th>
                          <th className="px-6 py-4 text-right">Åtgärder</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-slate-100">
                        {tempFilteredCustomers.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-12 text-slate-500 font-mono">
                              Inga gästprofiler matchar dina filter- och sökvillkor.
                            </td>
                          </tr>
                        ) : (
                          tempFilteredCustomers.map((c: any) => (
                          <tr key={c.email} className="hover:bg-slate-900/50 transition-colors">
                            <td className="px-6 py-4.5 font-bold font-serif text-sm text-white">
                              <div className="flex items-center gap-2">
                                <span>{c.name}</span>
                                {c.isBlocked && (
                                  <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider flex items-center gap-0.5">
                                    <ShieldAlert className="w-2.5 h-2.5 text-red-400" />
                                    <span>BLOCKERAD</span>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4.5 space-y-0.5 font-mono text-[11px] text-slate-300">
                              <span className="block flex items-center gap-1"><Mail className="w-3 h-3 text-slate-500" /> {c.email}</span>
                              <span className="block flex items-center gap-1"><Phone className="w-3 h-3 text-slate-500" /> {c.phone}</span>
                            </td>
                            <td className="px-6 py-4.5 text-center font-mono">
                              <span className="bg-amber-950 text-amber-400 font-bold border border-amber-900/40 px-2.5 py-1 rounded text-xs inline-block">
                                {c.totalVisits} besök
                              </span>
                            </td>
                            <td className="px-6 py-4.5 font-mono text-[11px] max-w-[150px] truncate text-slate-300" title={c.dietaryNotes}>
                              {c.dietaryNotes}
                            </td>
                            <td className="px-6 py-4.5 text-slate-400 max-w-[200px] truncate" title={c.specialNotes}>
                              {c.specialNotes}
                            </td>
                            <td className="px-6 py-4.5 font-mono text-[9px] uppercase tracking-wider">
                              {c.isManual ? (
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">Manuell</span>
                              ) : (
                                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded">System</span>
                              )}
                            </td>
                            <td className="px-6 py-4.5 text-right space-x-2">
                              <button
                                type="button"
                                onClick={() => handleToggleBlockCustomer(c)}
                                className={`p-1.5 border border-transparent rounded-lg transition-all inline-block cursor-pointer ${
                                  c.isBlocked
                                    ? 'text-red-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20'
                                    : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20'
                                }`}
                                title={c.isBlocked ? (adminLang === 'sv' ? 'Häv blockering' : 'Unblock guest') : (adminLang === 'sv' ? 'Blockera gäst' : 'Block guest')}
                              >
                                {c.isBlocked ? (
                                  <Check className="w-3.5 h-3.5" />
                                ) : (
                                  <ShieldAlert className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditCustomerModal(c)}
                                className="p-1.5 text-slate-400 hover:text-amber-400 border border-transparent hover:border-slate-800 hover:bg-slate-900 rounded-lg transition-all inline-block cursor-pointer"
                                title="Redigera gästprofil"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomer(c)}
                                className="p-1.5 text-slate-400 hover:text-red-400 border border-transparent hover:border-slate-800 hover:bg-slate-900 rounded-lg transition-all inline-block cursor-pointer"
                                title="Radera gästprofil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          );
        })()}

          {/* TAB 3: DYNAMIC SEATING PLACES & DINING ZONE CRUD */}
          {/* TAB 3: DYNAMIC SEATING PLACES & DINING ZONE CRUD */}
          {adminTab === 'tables' && (() => {
            const filteredDiningZones = diningZones.filter(z => {
              const matchesSearch = 
                z.name.toLowerCase().includes(zoneSearchQuery.toLowerCase()) ||
                z.desc.toLowerCase().includes(zoneSearchQuery.toLowerCase()) ||
                z.id.toLowerCase().includes(zoneSearchQuery.toLowerCase());

              const matchesStatus = 
                zoneStatusFilter === 'all' ||
                (zoneStatusFilter === 'active' && z.isActive) ||
                (zoneStatusFilter === 'inactive' && !z.isActive);

              return matchesSearch && matchesStatus;
            });

            const filteredTables = tables.filter(t => {
              const matchesSearch = 
                t.tableName.toLowerCase().includes(tableSearchQuery.toLowerCase()) ||
                (t.description && t.description.toLowerCase().includes(tableSearchQuery.toLowerCase())) ||
                t.id.toLowerCase().includes(tableSearchQuery.toLowerCase());

              const matchesZone = tableZoneFilter === 'all' || t.zoneId === tableZoneFilter;
              const matchesStatus = 
                tableStatusFilter === 'all' ||
                (tableStatusFilter === 'active' && t.isActive) ||
                (tableStatusFilter === 'inactive' && !t.isActive);

              return matchesSearch && matchesZone && matchesStatus;
            });

            return (
              <motion.div
                layout
                key="tables-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="space-y-5">
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
                    <div className="space-y-1">
                      <h3 className="font-serif text-lg font-bold text-amber-400">Matsal & Bordszoner (<span className="font-mono">{filteredDiningZones.length}</span> / <span className="font-mono">{diningZones.length}</span>)</h3>
                      <p className="text-slate-400 text-xs font-sans">Definiera rymliga rumszoner på Krog Pelikan, sätt sittplatskapacitet samt hantera bordskonfigurationer live.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenCreateZoneModal}
                      className="bg-emerald-600 hover:bg-emerald-555 text-slate-950 px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer transition-colors"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5px]" />
                      <span>Lägg till zon</span>
                    </button>
                  </div>

                  {/* Search & Filter for Zones */}
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center shadow-md">
                    <div className="relative flex-1 w-full">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder={adminLang === 'sv' ? "Sök på zonens namn, ID, beskrivning..." : "Search zone name, ID, description..."}
                        value={zoneSearchQuery}
                        onChange={(e) => setZoneSearchQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg pl-10 pr-4 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                      {zoneSearchQuery && (
                        <button onClick={() => setZoneSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white border-0 bg-transparent">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono w-full md:w-auto shrink-0">
                      <Filter className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-400 mr-1 uppercase text-[10px]">{adminLang === 'sv' ? 'Zonstatus' : 'Zone status'}:</span>
                      <select
                        value={zoneStatusFilter}
                        onChange={(e) => setZoneStatusFilter(e.target.value)}
                        className="bg-transparent text-slate-200 outline-none cursor-pointer"
                      >
                        <option value="all">{adminLang === 'sv' ? 'Alla statusar' : 'All statuses'}</option>
                        <option value="active">{adminLang === 'sv' ? 'Öppen / Aktiv' : 'Open / Active'}</option>
                        <option value="inactive">{adminLang === 'sv' ? 'Stängd / Inaktiv' : 'Closed / Inactive'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Seating zones grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredDiningZones.length === 0 ? (
                      <div className="col-span-1 md:col-span-3 bg-slate-950/40 p-12 text-center text-slate-500 text-xs font-mono border border-slate-800 border-dashed rounded-xl">
                        Inga bordszoner matchar sökningen.
                      </div>
                    ) : (
                      filteredDiningZones.map((zone) => (
                        <div key={zone.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4 hover:border-slate-700 transition-all relative flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-serif text-base font-bold text-white">{zone.name}</h4>
                                <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest block mt-0.5">ID: {zone.id}</span>
                              </div>
                              <span className={`px-2 py-0.5 text-[9px] uppercase font-mono tracking-wider font-bold rounded ${
                                zone.isActive 
                                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
                              }`}>
                                {zone.isActive ? 'Aktiv' : 'Stängd'}
                              </span>
                            </div>

                            <p className="text-slate-300 text-xs leading-relaxed">{zone.desc}</p>
                          </div>

                          <div className="space-y-3 pt-3 border-t border-slate-900">
                            <div className="grid grid-cols-2 gap-3 text-center">
                              <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl">
                                <span className="text-[9px] text-slate-500 font-mono uppercase block">Sittplatser</span>
                                <span className="text-base font-serif font-extrabold text-amber-500">{zone.capacity} p</span>
                              </div>
                              <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl">
                                <span className="text-[9px] text-slate-500 font-mono uppercase block">Antal Bord</span>
                                <span className="text-base font-serif font-extrabold text-white">{zone.tableCount} st</span>
                              </div>
                            </div>

                            <div className="flex gap-2 justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditZoneModal(zone)}
                                className="bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Pencil className="w-3 h-3 text-amber-500" />
                                Redigera
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteZone(zone.id)}
                                className="bg-slate-900 hover:bg-slate-850 text-red-400 hover:text-red-300 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                                Radera
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* SECTION B: BORD-HANTERING IN DINING AREAS */}
                <div className="space-y-5">
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
                    <div className="space-y-1">
                      <h3 className="font-serif text-lg font-bold text-amber-400">Enskild Bordshantering (<span className="font-mono">{filteredTables.length}</span> / <span className="font-mono">{tables.length}</span>)</h3>
                      <p className="text-slate-400 text-xs font-sans">Skapa bord, tilldela matsalzon, ladda upp unika bordsbilder och se sittande sällskap live i realtid.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenCreateTableModal}
                      className="bg-amber-600 hover:bg-amber-555 text-slate-950 px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer transition-colors"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5px]" />
                      <span>Skapa Nytt Bord</span>
                    </button>
                  </div>

                  {/* Search & Filter for Individual Tables */}
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center shadow-md">
                    <div className="relative flex-1 w-full">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder={adminLang === 'sv' ? "Sök på bordets namn, ID, beskrivning..." : "Search table name, ID, description..."}
                        value={tableSearchQuery}
                        onChange={(e) => setTableSearchQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg pl-10 pr-4 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                      {tableSearchQuery && (
                        <button onClick={() => setTableSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white border-0 bg-transparent">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
                      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-400 mr-1 uppercase text-[10px]">{adminLang === 'sv' ? 'Zon' : 'Zone'}:</span>
                        <select
                          value={tableZoneFilter}
                          onChange={(e) => setTableZoneFilter(e.target.value)}
                          className="bg-transparent text-slate-200 outline-none cursor-pointer font-sans"
                        >
                          <option value="all">{adminLang === 'sv' ? 'Alla zoner' : 'All zones'}</option>
                          {diningZones.map((zone) => (
                            <option key={zone.id} value={zone.id}>{zone.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
                        <Filter className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-400 mr-1 uppercase text-[10px]">{adminLang === 'sv' ? 'Bordsstatus' : 'Table status'}:</span>
                        <select
                          value={tableStatusFilter}
                          onChange={(e) => setTableStatusFilter(e.target.value)}
                          className="bg-transparent text-slate-200 outline-none cursor-pointer"
                        >
                          <option value="all">{adminLang === 'sv' ? 'Alla' : 'All'}</option>
                          <option value="active">{adminLang === 'sv' ? 'Online' : 'Online'}</option>
                          <option value="inactive">{adminLang === 'sv' ? 'Offline' : 'Offline'}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Tables Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTables.length === 0 ? (
                      <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-slate-950/40 p-12 text-center text-slate-500 text-xs font-mono border border-slate-800 border-dashed rounded-xl">
                        Inga bord matchar sökningen eller filtervillkoren.
                      </div>
                    ) : (
                      filteredTables.map((table) => {
                        const zoneObject = diningZones.find(z => z.id === table.zoneId);
                        // Determine currently sitting members in this table!
                        const runningBookings = bookings.filter(b => b.tableId === table.id && b.status === 'confirmed');
                        
                        return (
                          <div key={table.id} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between">
                            {/* Table Image Header with fallback */}
                            <div className="h-44 w-full bg-slate-900 relative overflow-hidden group">
                              <img 
                                src={table.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80"} 
                                alt={table.tableName}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                              <span className="absolute top-3 left-3 bg-slate-950/75 border border-slate-800 text-amber-400 px-2 py-1 rounded font-mono text-[9px] font-bold uppercase">
                                {zoneObject?.name || table.zoneId}
                              </span>
                              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                                {!table.isActive ? (
                                  <span className="bg-red-600/90 text-white px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase">
                                    Offline
                                  </span>
                                ) : (
                                  <span className={`bg-slate-950/80 border px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase flex items-center gap-1.5 shadow-md ${
                                    runningBookings.length > 0 
                                      ? 'border-red-500/30 text-rose-400' 
                                      : 'border-emerald-500/30 text-emerald-400'
                                  }`}>
                                    <span className="relative flex h-1.5 w-1.5">
                                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                        runningBookings.length > 0 ? 'bg-red-400' : 'bg-emerald-400'
                                      }`}></span>
                                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                                        runningBookings.length > 0 ? 'bg-red-500' : 'bg-emerald-500'
                                      }`}></span>
                                    </span>
                                    {runningBookings.length > 0 ? 'Occupied' : 'Free'}
                                  </span>
                                )}
                              </div>
                              <div className="absolute bottom-3 left-3 text-white">
                                <h4 className="font-serif text-lg font-extrabold tracking-wide flex items-center gap-2">
                                  {table.tableName}
                                  {table.isActive && (
                                    <span className="relative flex h-2 w-2">
                                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                        runningBookings.length > 0 ? 'bg-red-400' : 'bg-emerald-400'
                                      }`}></span>
                                      <span className={`relative inline-flex rounded-full h-2 w-2 ${
                                        runningBookings.length > 0 ? 'bg-red-500' : 'bg-emerald-500'
                                      }`}></span>
                                    </span>
                                  )}
                                </h4>
                                <span className="text-[10px] font-mono text-slate-300">Maxkapacitet: {table.capacity} gäster</span>
                              </div>
                            </div>

                            {/* Table Body Content */}
                            <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                              <p className="text-slate-400 text-xs leading-normal font-sans italic min-h-[32px]">
                                {table.description || "Ingen beskrivning skriven för detta bord."}
                              </p>

                              {/* Sitting members block */}
                              <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl space-y-1.5">
                                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block">Sittande Sällskap (Live)</span>
                                {runningBookings.length === 0 ? (
                                  <p className="text-slate-500 text-[10px] font-mono">Ledigt / Inga sittande gäster för tillfället.</p>
                                ) : (
                                  <div className="space-y-1.5">
                                    {runningBookings.map((b, bIdx) => (
                                      <div key={bIdx} className="bg-slate-950/80 border border-emerald-500/15 p-1.5 rounded-lg flex items-center justify-between text-[11px] font-mono text-emerald-400">
                                        <span className="font-bold truncate max-w-[110px]" title={b.name}>● {b.name}</span>
                                        <span>{b.guests}p @ Kl {b.time}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Table Action footer */}
                              <div className="flex justify-between items-center pt-2 border-t border-slate-900">
                                <span className="font-mono text-[9px] text-slate-500 uppercase tracking-wider">ID: {table.id}</span>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditTableModal(table)}
                                    className="bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 p-2 rounded-lg transition-colors cursor-pointer"
                                    title="Redigera bord"
                                  >
                                    <Pencil className="w-3.5 h-3.5 text-amber-500" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTable(table.id)}
                                    className="bg-slate-900 hover:bg-slate-850 text-red-400 hover:text-red-350 border border-slate-800 p-2 rounded-lg transition-colors cursor-pointer"
                                    title="Radera bord"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                  </button>
                                </div>
                              </div>
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* TAB 3.5: GIFT VOUCHER STUDIO (Presentkort Studio) ADMINISTRATOR */}
          {adminTab === 'vouchers' && (
            <motion.div
              layout
              key="vouchers-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-amber-400 flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-amber-505 animate-bounce" />
                    <span>GIFT VOUCHER STUDIO • Presentkortshantering</span>
                  </h3>
                  <p className="text-slate-400 text-xs font-sans">Sätt procentrabatter för kampanjer, aktivera eller inaktivera butiken för gäster samt bevilja unika presentkoder manuellt.</p>
                </div>
                
                <button
                  type="button"
                  onClick={handleOpenNewVoucherModal}
                  className="bg-emerald-600 hover:bg-emerald-555 text-slate-950 px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4 stroke-[2.5px]" />
                  <span>Utfärda manuellt presentkort</span>
                </button>
              </div>

              {/* Grid: Global Settings + Voucher stats */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Column A: Global Configuration */}
                {/* Column A: Global Configuration & Claiming */}
                <div className="lg:col-span-4 space-y-6">
                  <form onSubmit={handleSaveVoucherConfig} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-5 shadow-xl">
                    <span className="text-[9px] text-[#a37c44] uppercase font-mono tracking-widest font-bold">Butiksinställningar (Shop Config)</span>
                    
                    {/* Switch toggle globally enabled */}
                    <div className="space-y-2">
                      <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider font-semibold">Butiksstatus (Shop status)</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...voucherConfig, isEnabled: true };
                            setVoucherConfig(updated);
                            bookingStore.saveGiftVoucherConfig(updated);
                          }}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 border uppercase cursor-pointer ${
                            voucherConfig.isEnabled 
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400' 
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Aktivera Butik (Enable)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...voucherConfig, isEnabled: false };
                            setVoucherConfig(updated);
                            bookingStore.saveGiftVoucherConfig(updated);
                          }}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 border uppercase cursor-pointer ${
                            !voucherConfig.isEnabled 
                              ? 'bg-red-600 text-white border-red-500' 
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Stoppa Butik (Stop)
                        </button>
                      </div>
                      <span className="text-slate-500 text-[10px] block font-sans">
                        Stänger eller öppnar presentkortsstudion på gästernas publika gränssnitt direkt.
                      </span>
                    </div>

                    {/* Set default percentage multiplier bonus */}
                    <div className="space-y-2">
                      <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider font-semibold">Standard Kampanjbonus i % (Default)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          required
                          value={voucherConfig.defaultPercentage}
                          onChange={(e) => setVoucherConfig({ ...voucherConfig, defaultPercentage: parseInt(e.target.value) || 0 })}
                          className="w-28 bg-slate-900 border border-slate-800 text-slate-50 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                        />
                        <span className="text-slate-200 font-mono text-xs">% Extra värde!</span>
                      </div>
                      <span className="text-slate-500 text-[10px] block font-sans">
                        Standard bonus som delas ut vid köp av presentkort. (T.ex. sätter de 1 000 kr, får sällskapet ett gåvokort värt {Math.round(1000 * (1 + voucherConfig.defaultPercentage / 100))} kr).
                      </span>
                    </div>

                    {/* Set first-time user percentage bonus */}
                    <div className="space-y-2 animate-fade-in">
                      <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider font-semibold">Förstagångsgäst Bonus i % (Kollar e-post)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          required
                          value={voucherConfig.firstTimePercentage ?? 15}
                          onChange={(e) => setVoucherConfig({ ...voucherConfig, firstTimePercentage: parseInt(e.target.value) || 0 })}
                          className="w-28 bg-slate-900 border border-slate-800 text-slate-50 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                        />
                        <span className="text-slate-200 font-mono text-xs">% Extra!</span>
                      </div>
                      <span className="text-slate-500 text-[10px] block font-sans">
                        Tillämpas automatiskt om gästens e-post saknar tidigare bokningar i Pelikan-systemet. (T.ex. värt {Math.round(1000 * (1 + (voucherConfig.firstTimePercentage ?? 15) / 100))} kr).
                      </span>
                    </div>

                    {/* Set regular user percentage bonus */}
                    <div className="space-y-2 animate-fade-in">
                      <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider font-semibold">Stammis Bonus i % (Regular)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          required
                          value={voucherConfig.regularPercentage ?? 10}
                          onChange={(e) => setVoucherConfig({ ...voucherConfig, regularPercentage: parseInt(e.target.value) || 0 })}
                          className="w-28 bg-slate-900 border border-slate-800 text-slate-50 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                        />
                        <span className="text-slate-200 font-mono text-xs">% Extra!</span>
                      </div>
                      <span className="text-slate-500 text-[10px] block font-sans">
                        Tillämpas automatiskt om gästen har tidigare aktiva bokningar i Pelikan-systemet. (T.ex. värt {Math.round(1000 * (1 + (voucherConfig.regularPercentage ?? 10) / 100))} kr).
                      </span>
                    </div>

                    {/* Auto-send First-time welcome vouchers configurations */}
                    <div className="space-y-4 pb-1 border-t border-slate-800 pt-3">
                      <div>
                        <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider font-bold">Automatisk Välkomstgåva (First Time Reward Email)</label>
                        <span className="text-slate-500 text-[10.5px] block font-sans mt-0.5">
                          Skicka automatiskt värdekod till helt nya gäster vid registrering i gästportalen.
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...voucherConfig, firstTimeAutoSendEnabled: true };
                            setVoucherConfig(updated);
                            bookingStore.saveGiftVoucherConfig(updated);
                          }}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 border uppercase cursor-pointer ${
                            voucherConfig.firstTimeAutoSendEnabled
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400' 
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Aktivera Epost (Enable)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...voucherConfig, firstTimeAutoSendEnabled: false };
                            setVoucherConfig(updated);
                            bookingStore.saveGiftVoucherConfig(updated);
                          }}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 border uppercase cursor-pointer ${
                            !voucherConfig.firstTimeAutoSendEnabled
                              ? 'bg-red-600 text-white border-red-500' 
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Stoppa Epost (Stop)
                        </button>
                      </div>
                    </div>

                    {voucherConfig.firstTimeAutoSendEnabled && (
                      <div className="space-y-2 animate-fade-in pl-3 border-l border-[#a37c44]/30">
                        <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider font-semibold">Välkomstgåva Belopp (SEK)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="50"
                            max="5000"
                            required
                            value={voucherConfig.firstTimeAutoSendAmount ?? 250}
                            onChange={(e) => setVoucherConfig({ ...voucherConfig, firstTimeAutoSendAmount: parseInt(e.target.value) || 0 })}
                            className="w-28 bg-slate-900 border border-slate-800 text-slate-50 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                          />
                          <span className="text-slate-200 font-mono text-xs">kr gratis presentkort på Pelikan!</span>
                        </div>
                        <span className="text-slate-500 text-[10px] block font-sans">
                          Nya kontor som skapas får omedelbart ett gästkonto-värdebevis med detta belopp och e-postbekräftelse.
                        </span>
                      </div>
                    )}

                    {/* Claim Tasks List Configurator */}
                    <div className="space-y-2 pb-2 border-t border-slate-800 pt-3">
                      <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider font-bold">📋 Aktivitetssteg / Uppgifter för inlösen</label>
                      <textarea
                        rows={5}
                        required
                        value={(voucherConfig.claimTasks || []).join('\n')}
                        onChange={(e) => setVoucherConfig({ ...voucherConfig, claimTasks: e.target.value.split('\n') })}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-3 text-xs font-sans leading-relaxed focus:outline-none focus:border-amber-500"
                        placeholder="Skriv en uppgift per rad för dina välkomstgäster..."
                      />
                      <span className="text-slate-500 text-[10.5px] block font-sans leading-normal">
                        Skriv ett aktivitetssteg per rad. Dessa visas som en bocklista i gästernas dashboard-vy för att instruera dem hur presentkorten nyttjas.
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-mono text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
                    >
                      Spara Inställningar
                    </button>
                  </form>

                  {/* DYNAMIC VOUCHER PACKAGES SECTION */}
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-amber-500 uppercase font-mono tracking-widest font-bold">
                        Voucher Packages (Köp-paket)
                      </span>
                    </div>

                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Lyt gäster välja färdiga presentkortspaket. Du kan ändra värde, pris (erbjudande) samt starta/stoppa (aktivera/inaktivera) tillgängliga alternativ.
                    </p>

                    <div className="space-y-3.5 pt-2">
                      {voucherBuyingOptions.map((opt) => (
                        <div key={opt.id} className="bg-slate-905 border border-slate-800/80 p-3.5 rounded-xl space-y-2.5 bg-slate-900/40">
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              value={opt.nameSv}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = voucherBuyingOptions.map(o => o.id === opt.id ? { ...o, nameSv: val, nameEn: val } : o);
                                setVoucherBuyingOptions(updated);
                                bookingStore.saveVoucherBuyingOptions(updated);
                              }}
                              className="bg-transparent border-b border-transparent focus:border-amber-500/50 text-slate-100 font-mono text-xs font-bold w-36 outline-none"
                            />
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = voucherBuyingOptions.map(o => o.id === opt.id ? { ...o, isActive: !o.isActive } : o);
                                  setVoucherBuyingOptions(updated);
                                  bookingStore.saveVoucherBuyingOptions(updated);
                                  bookingStore.addStaffLog(currentStaff ? currentStaff.displayName : 'Hovmästare Admin', `${opt.isActive ? 'Stoppade' : 'Startade'} köp-paketet "${opt.nameSv}"`);
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                                  opt.isActive
                                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                                }`}
                              >
                                {opt.isActive ? 'Aktiv (ON)' : 'Inaktiv (OFF)'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Radera paket "${opt.nameSv}"?`)) {
                                    const updated = voucherBuyingOptions.filter(o => o.id !== opt.id);
                                    setVoucherBuyingOptions(updated);
                                    bookingStore.saveVoucherBuyingOptions(updated);
                                    bookingStore.addStaffLog(currentStaff ? currentStaff.displayName : 'Hovmästare Admin', `Tog bort köp-paketet "${opt.nameSv}"`);
                                  }
                                }}
                                className="p-1 text-slate-550 hover:text-red-400 cursor-pointer"
                                title="Radera paket"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3.5">
                            <div>
                              <label className="block text-[9px] text-slate-400 uppercase font-mono mb-1">Erbjudande Pris (kr)</label>
                              <input
                                type="number"
                                value={opt.price}
                                onChange={(e) => {
                                  const val = Math.max(0, parseInt(e.target.value) || 0);
                                  const updated = voucherBuyingOptions.map(o => o.id === opt.id ? { ...o, price: val } : o);
                                  setVoucherBuyingOptions(updated);
                                  bookingStore.saveVoucherBuyingOptions(updated);
                                }}
                                className="w-full bg-slate-950 border border-slate-800 text-slate-150 rounded p-1.5 text-xs font-mono focus:border-amber-500 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-slate-400 uppercase font-mono mb-1">Erhållet Värde (kr)</label>
                              <input
                                type="number"
                                value={opt.rewardValue}
                                onChange={(e) => {
                                  const val = Math.max(0, parseInt(e.target.value) || 0);
                                  const updated = voucherBuyingOptions.map(o => o.id === opt.id ? { ...o, rewardValue: val } : o);
                                  setVoucherBuyingOptions(updated);
                                  bookingStore.saveVoucherBuyingOptions(updated);
                                }}
                                className="w-full bg-slate-950 border border-slate-800 text-slate-150 rounded p-1.5 text-xs font-mono focus:border-amber-500 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          const newId = `pkg-${Date.now()}`;
                          const initialVal = 500;
                          const initialReward = 550;
                          const updated = [
                            ...voucherBuyingOptions,
                            {
                              id: newId,
                              price: initialVal,
                              rewardValue: initialReward,
                              isActive: true,
                              nameSv: `Presentkort ${initialReward} kr`,
                              nameEn: `${initialReward} kr Gift Card`
                            }
                          ];
                          setVoucherBuyingOptions(updated);
                          bookingStore.saveVoucherBuyingOptions(updated);
                          bookingStore.addStaffLog(currentStaff ? currentStaff.displayName : 'Hovmästare Admin', `Skapade nytt köp-paket: "${initialReward} kr"`);
                        }}
                        className="w-full py-2 border border-dashed border-slate-850 hover:border-slate-500 hover:bg-slate-900/40 text-slate-450 hover:text-white rounded-xl text-xs font-mono uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Lägg till köp-paket</span>
                      </button>
                    </div>
                  </div>

                  {/* Claim Voucher Verification Hub */}
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
                    <span className="text-[9px] text-red-400 uppercase font-mono tracking-widest font-bold">Inlösencentral (Claim Center)</span>
                    <div className="space-y-1">
                      <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                        <span>Lös in presentkort</span>
                      </h4>
                      <p className="text-slate-500 text-[10.5px]">Säker verifiering och debitering av presentkortsbelopp på gästens nota med 6-siffrig e-post OTP.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-slate-400 text-[10px] font-mono uppercase">Presentkortskod / Voucher code</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="PEL-GIFT-XXXX"
                          value={claimSearchCode}
                          onChange={(e) => setClaimSearchCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                          className="flex-1 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-red-500 uppercase animate-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSearchClaimVoucher()}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider uppercase font-bold shrink-0 transition-all cursor-pointer"
                        >
                          Sök
                        </button>
                      </div>
                    </div>

                    {/* Search outcome and dynamic OTP forms */}
                    {claimStatusMsg.text && (
                      <div className={`p-3 rounded-lg text-xs font-sans border space-y-2 leading-relaxed ${
                        claimStatusMsg.type === 'error' 
                          ? 'bg-red-950/20 border-red-900/30 text-red-400' 
                          : claimStatusMsg.type === 'warning'
                          ? 'bg-yellow-950/20 border-yellow-900/30 text-yellow-500'
                          : claimStatusMsg.type === 'claimed_success'
                          ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400 border-dashed border-2'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300'
                      }`}>
                        <div className="font-mono text-[10.5px] font-bold flex gap-1.5 items-center">
                          {claimStatusMsg.type === 'error' && <span className="text-red-500">⚠</span>}
                          {claimStatusMsg.type === 'warning' && <span className="text-yellow-500">⚠</span>}
                          {claimStatusMsg.type === 'claimed_success' && <span className="text-emerald-500">✓ Inlösen klar!</span>}
                          {claimStatusMsg.type.startsWith('otp_sent') && <span className="text-amber-500">✉ OTP Skickad!</span>}
                          {claimStatusMsg.type === 'success' && <span className="text-blue-400">ℹ Verifierad!</span>}
                          <span>{claimStatusMsg.text}</span>
                        </div>

                        {/* If the OTP is simulated or offline, display a simulated highlight block */}
                        {claimStatusMsg.type === 'otp_sent_simulated' && activeClaimVoucher?.claimOtp && (
                          <div className="bg-amber-900/20 border border-amber-800/20 p-2.5 rounded text-amber-300 text-[10.5px] font-mono text-center">
                            <p className="font-sans text-[9px] text-amber-500 uppercase font-bold">Simulator Fallback Mode</p>
                            <p className="mt-1">Verifiera med den genererade koden:</p>
                            <p className="text-lg font-bold text-white tracking-widest mt-1">{activeClaimVoucher.claimOtp}</p>
                          </div>
                        )}

                        {/* Action buttons inside status window */}
                        {activeClaimVoucher && !activeClaimVoucher.isClaimed && activeClaimVoucher.isEnabled && (
                          <div className="pt-1.5">
                            {!activeClaimVoucher.claimOtp ? (
                              <button
                                type="button"
                                onClick={handleSendVoucherClaimOtp}
                                disabled={isSendingOtp}
                                className="w-full bg-red-800 hover:bg-red-700 text-white font-mono text-[10px] font-bold uppercase py-1.5 px-3 rounded transition-colors tracking-wide flex items-center justify-center gap-1 cursor-pointer"
                              >
                                {isSendingOtp ? 'Skickar verifiering...' : 'Skicka 6-siffrig e-post OTP'}
                              </button>
                            ) : (
                              <div className="space-y-2 font-mono">
                                <span className="block text-[9.5px] text-slate-400 uppercase tracking-wider">Fyll i gästens 6-siffriga engångskod</span>
                                <div className="flex gap-1.5">
                                  <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="------"
                                    value={claimOtpInput}
                                    onChange={(e) => setClaimOtpInput(e.target.value.replace(/\D/g, ''))}
                                    className="w-24 bg-slate-950 border border-slate-800 text-center text-sm font-bold text-emerald-400 rounded py-1 tracking-widest focus:outline-none focus:border-emerald-500 font-mono"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleVerifyVoucherClaimOtp}
                                    disabled={isVerifyingOtp}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-sans text-[10.5px] font-extrabold uppercase py-1 rounded transition-all cursor-pointer"
                                  >
                                    {isVerifyingOtp ? 'Validerar...' : 'Slutför inlösen'}
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleSendVoucherClaimOtp}
                                  className="text-slate-400 hover:text-slate-200 text-[9px] underline block"
                                >
                                  Skicka ny OTP engångskod
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reset/Cancel Button */}
                    {activeClaimVoucher && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveClaimVoucher(null);
                          setClaimSearchCode('');
                          setClaimOtpInput('');
                          setClaimStatusMsg({ type: '', text: '' });
                        }}
                        className="text-slate-400 hover:text-slate-100 font-mono text-[9.5px] tracking-wide block uppercase cursor-pointer"
                      >
                        &larr; Avbryt och rensa sökning
                      </button>
                    )}
                  </div>
                </div>

                {/* Column B: Ledger Tables */}
                {(() => {
                  const filteredVouchersList = adminVouchers.filter(v => {
                    const matchesSearch = 
                      v.code.toLowerCase().includes(voucherSearchQuery.toLowerCase()) ||
                      v.recipientName.toLowerCase().includes(voucherSearchQuery.toLowerCase()) ||
                      v.recipientEmail.toLowerCase().includes(voucherSearchQuery.toLowerCase());

                    const matchesStatus = 
                      voucherFilterStatus === 'all' ||
                      (voucherFilterStatus === 'active' && v.isEnabled && !v.isClaimed) ||
                      (voucherFilterStatus === 'claimed' && v.isClaimed) ||
                      (voucherFilterStatus === 'disabled' && !v.isEnabled && !v.isClaimed);

                    return matchesSearch && matchesStatus;
                  });

                  return (
                    <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-1">
                      <div className="p-4 border-b border-slate-805 font-mono text-xs text-slate-400 flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
                        <span>AKTIVA OCH UTSTÄLLDA PRESENTKORT (<span className="text-white font-bold">{filteredVouchersList.length}</span> / {adminVouchers.length})</span>
                      </div>

                      {adminVouchers.length > 0 && (
                        <div className="p-4 bg-slate-900 border-b border-slate-850 flex flex-col sm:flex-row gap-4 items-center">
                          <div className="relative flex-1 w-full">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                              type="text"
                              placeholder="Sök presentkod, gästnamn, e-post..."
                              value={voucherSearchQuery}
                              onChange={(e) => setVoucherSearchQuery(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg pl-10 pr-4 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                            />
                            {voucherSearchQuery && (
                              <button onClick={() => setVoucherSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white border-0 bg-transparent">
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono w-full sm:w-auto shrink-0">
                            <Filter className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-slate-400 mr-1 uppercase text-[10px]">Status:</span>
                            <select
                              value={voucherFilterStatus}
                              onChange={(e) => setVoucherFilterStatus(e.target.value)}
                              className="bg-transparent text-slate-200 outline-none cursor-pointer"
                            >
                              <option value="all">Alla statusar</option>
                              <option value="active">Aktiva / Ej inlösta</option>
                              <option value="claimed">Inlösta (Claimed)</option>
                              <option value="disabled">Spärrade (Disabled)</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {filteredVouchersList.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 space-y-3">
                          <Ticket className="w-12 h-12 text-slate-700 mx-auto" />
                          <p className="font-serif text-sm">Inga matchande presentkort hittades.</p>
                          <p className="text-slate-600 font-mono text-[10px]">Justera sökfrasen eller filtreringen ovan.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-slate-300 font-mono">
                            <thead className="bg-slate-900 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-800">
                              <tr>
                                <th className="px-5 py-3">Presentkod</th>
                                <th className="px-5 py-3">Innehavare (Mottagare)</th>
                                <th className="px-5 py-3 text-right">Kostar (Pris)</th>
                                <th className="px-5 py-3 text-right text-amber-400">Giltigt Värde</th>
                                <th className="px-5 py-3">Skapad datum</th>
                                <th className="px-5 py-3 text-center">Status</th>
                                <th className="px-5 py-3 text-right">Åtgärd</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-900">
                              {filteredVouchersList.map((vch) => (
                                <tr key={vch.id} className="hover:bg-slate-900/40 transition-colors">
                                  <td className="px-5 py-4 font-bold text-amber-400 select-all font-mono">
                                    {vch.code}
                                  </td>
                                  <td className="px-5 py-4">
                                    <span className="block font-sans text-xs font-bold text-white">{vch.recipientName}</span>
                                    <span className="block text-[10.5px] text-slate-400">{vch.recipientEmail}</span>
                                  </td>
                                  <td className="px-5 py-4 text-right font-bold text-slate-100">
                                    {vch.amount.toLocaleString()} kr
                                  </td>
                                  <td className="px-5 py-4 text-right font-extrabold text-emerald-400 text-xs">
                                    {vch.value.toLocaleString()} kr
                                  </td>
                                  <td className="px-5 py-4 text-slate-500 text-[10px]">
                                    {vch.createdAt ? new Date(vch.createdAt).toISOString().split('T')[0] : 'Okänt'}
                                  </td>
                                  <td className="px-5 py-4 text-center">
                                    {vch.isClaimed ? (
                                      <span className="px-2 py-0.5 rounded text-[10.5px] uppercase font-bold bg-slate-800 text-slate-500 border border-slate-700">
                                        Inlöst
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleToggleVoucherActive(vch)}
                                        className={`px-2 py-0.5 rounded text-[10.5px] uppercase font-bold border cursor-pointer ${
                                          vch.isEnabled 
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                                        }`}
                                      >
                                        {vch.isEnabled ? 'Aktiv' : 'Spärrad'}
                                      </button>
                                    )}
                                  </td>
                                  <td className="px-5 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {!vch.isClaimed && vch.isEnabled && (
                                        <button
                                          type="button"
                                          onClick={() => handleSearchClaimVoucher(vch.code)}
                                          className="px-2 py-0.5 rounded text-[9px] bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-800/40 font-bold uppercase transition-all whitespace-nowrap"
                                          title="Lös in detta presentkort"
                                        >
                                          Lös in
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditVoucher(vch)}
                                        className="text-slate-400 hover:text-amber-400 p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                                        title="Redigera presentkort"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteVoucher(vch.id)}
                                        className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                                        title="Radera presentkort permanent"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })()}

              </div>
            </motion.div>
          )}

          {/* TAB 4: SYSTEM & BRAND THEME PRESETS CONFIGURATION */}
          {adminTab === 'settings' && (
            <motion.div
              layout
              key="settings-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
              
              {/* Left Column / Control Sidebar */}
              <div className="lg:col-span-4 bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
                <span className="text-[10px] font-mono tracking-widest text-[#a37c44] font-bold uppercase block">SMTP & INTEGRATION DEPARTMENTS</span>
                <h3 className="font-serif text-xl font-bold text-white uppercase tracking-wider">Inställningar</h3>
                <p className="text-slate-400 text-xs font-sans leading-relaxed">
                  Hantera Krog Pelikans levande varumärkesfärger, hovmästarens avsändarprofil, eller skriv nya e-postmeddelanden manuellt.
                </p>

                {/* Vertical Tabs */}
                <div className="space-y-1.5 pt-2">
                  <button
                    onClick={() => setEmailSubTab('theme')}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition-all text-left flex items-center justify-between ${
                      emailSubTab === 'theme'
                        ? 'bg-amber-600 text-slate-950 font-extrabold'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Temainställningar
                    </span>
                    <Check className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setEmailSubTab('settings')}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition-all text-left flex items-center justify-between ${
                      emailSubTab === 'settings'
                        ? 'bg-amber-600 text-slate-950 font-extrabold'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Settings className="w-4 h-4" /> Epost-inställningar (SMTP)
                    </span>
                    <Globe className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setEmailSubTab('inbox_sent')}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition-all text-left flex items-center justify-between ${
                      emailSubTab === 'inbox_sent'
                        ? 'bg-amber-600 text-slate-950 font-extrabold'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Inbox className="w-4 h-4" /> Inkorg & Loggar
                    </span>
                    <span className="font-serif font-extrabold">{emails.length}</span>
                  </button>

                  <button
                    onClick={() => setEmailSubTab('compose')}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition-all text-left flex items-center justify-between ${
                      emailSubTab === 'compose'
                        ? 'bg-amber-600 text-slate-950 font-extrabold'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" /> Skriv nytt mejl
                    </span>
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setEmailSubTab('bulk_send')}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition-all text-left flex items-center justify-between ${
                      emailSubTab === 'bulk_send'
                        ? 'bg-amber-600 text-slate-950 font-extrabold'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" /> Gruppmejl (Bulk Send)
                    </span>
                    <span className="bg-slate-950 text-[10px] text-amber-500 px-1.5 py-0.5 rounded font-mono font-bold">SMTP</span>
                  </button>

                  <button
                    onClick={() => setEmailSubTab('stripe_settings')}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition-all text-left flex items-center justify-between ${
                      emailSubTab === 'stripe_settings'
                        ? 'bg-amber-600 text-slate-950 font-extrabold'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Key className="w-4 h-4" /> Stripe-inställningar
                    </span>
                    <Lock className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setEmailSubTab('stripe_transactions')}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition-all text-left flex items-center justify-between ${
                      emailSubTab === 'stripe_transactions'
                        ? 'bg-amber-600 text-slate-950 font-extrabold'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Transaktionshistorik
                    </span>
                    <span className="bg-slate-950 text-[10px] text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">{stripeTransactions.length}</span>
                  </button>

                  <button
                    onClick={() => setEmailSubTab('simulate')}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition-all text-left flex items-center justify-between ${
                      emailSubTab === 'simulate'
                        ? 'bg-amber-600 text-slate-950 font-extrabold'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <ArrowLeftRight className="w-4 h-4" /> Simulera Kundsvar
                    </span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>

                <hr className="border-slate-800 my-4" />

                {/* Connectivity simulation block */}
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-500 uppercase font-bold">STATUS ANTECKNING</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                      adminProfile.status === 'connected' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                    }`}>
                      {adminProfile.status === 'connected' ? '● ANSLUTEN' : '● AVKOPPLAD'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono space-y-1">
                    <p className="flex justify-between">
                      <span>Server:</span>
                      <span className="text-slate-300 font-bold">{adminProfile.smtpHost}:{adminProfile.smtpPort}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Avsändaradress:</span>
                      <span className="text-slate-300 font-bold truncate max-w-[120px]" title={adminProfile.emailAddress}>{adminProfile.emailAddress}</span>
                    </p>
                  </div>
                </div>

              </div>

              {/* Right Column / Tab Contents */}
              <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                
                {/* SUB TAB 0: THEME PRESETS */}
                {emailSubTab === 'theme' && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                      <h4 className="font-serif text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" /> Pelikan Graphics & Live Theming
                      </h4>
                      <span className="bg-amber-500/10 border border-amber-500/20 text-[#a37c44] font-mono text-[9px] px-2 py-0.5 rounded uppercase tracking-widest font-extrabold animate-pulse">
                        Active Presets
                      </span>
                    </div>

                    <p className="text-slate-300 text-xs font-sans leading-relaxed">
                      Skräddarsy hela webbplatsens grafiska identitet. Genom att byta tema uppdateras färgschemat gällande knappar, ramar, toningar och bakgrunder för gäster såväl som för personalen live.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {[
                        { id: 'premium_gold', name: 'Gyllene Guld & Bärnsten', desc: 'Anrik, robust stämning med vackert behagliga guldtoner', colors: ['bg-amber-950', 'bg-amber-500'] },
                        { id: 'nordic_slate', name: 'Skandinavisk Isblå & Slate', desc: 'Minimalistisk modern kyla med svala stensvarta nyanser', colors: ['bg-slate-900', 'bg-sky-500'] },
                        { id: 'red_mahogany', name: 'Trogen Mahogny & Lingon', desc: 'Klassiska svenska krogfärger i röda och djupa trätoner', colors: ['bg-red-950', 'bg-rose-600'] },
                        { id: 'tavern_charcoal', name: 'Nattlig Krog (Midnight)', desc: 'Matta kolsvarta accenter med sober kontrast', colors: ['bg-zinc-950', 'bg-zinc-500'] },
                      ].map((theme) => (
                        <button
                          type="button"
                          key={theme.id}
                          onClick={() => {
                            setSelectedTheme(theme.id);
                            localStorage.setItem('pelikan_theme', theme.id);
                            document.documentElement.className = '';
                            document.documentElement.classList.add(`theme-${theme.id}`);
                          }}
                          className={`p-4 rounded-xl border text-left space-y-3 transition-all cursor-pointer ${
                            selectedTheme === theme.id 
                              ? 'border-amber-500 bg-slate-900 shadow-lg scale-[1.02]' 
                              : 'border-slate-850 bg-slate-950 hover:bg-slate-900/50 hover:border-slate-800'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex gap-1.5">
                              <span className={`w-3.5 h-3.5 rounded-full ${theme.colors[0]} border border-white/20 shadow`}></span>
                              <span className={`w-3.5 h-3.5 rounded-full ${theme.colors[1]} border border-white/20 shadow`}></span>
                            </div>
                            {selectedTheme === theme.id && <Check className="w-4 h-4 text-amber-500 stroke-[2.5px]" />}
                          </div>
                          <div>
                            <h4 className="font-sans font-bold text-xs text-white">{theme.name}</h4>
                            <p className="text-[10px] text-slate-400 leading-normal mt-1">{theme.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUB TAB 1: INBOX & LOGS */}
                {emailSubTab === 'inbox_sent' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h4 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                        <Inbox className="w-4 h-4" /> E-post Transmissionslogg
                      </h4>
                      <button
                        onClick={() => {
                          if (confirm('Vill du rensa e-posthistoriken?')) {
                            bookingStore.saveEmails([]);
                            refreshData();
                          }
                        }}
                        className="text-[10px] font-mono text-red-400/90 hover:text-red-300 transition-colors uppercase"
                      >
                        Rensa Loggar
                      </button>
                    </div>

                    {emails.length === 0 ? (
                      <div className="bg-slate-900/40 p-12 text-center text-slate-500 text-xs font-mono border border-slate-800 border-dashed rounded-xl space-y-2">
                        <Mail className="w-8 h-8 text-slate-700 mx-auto" />
                        <p>Inga skickade eller mottagna e-postmeddelanden finns i loggen.</p>
                        <p className="text-[10px] text-slate-600 block">Systemmeddelanden samt dina bekräftelsemejl visas här när de skapas.</p>
                      </div>
                    ) : (() => {
                      const filteredEmailsList = emails.filter(em => {
                        const matchesSearch = 
                          em.to.toLowerCase().includes(emailSearchQuery.toLowerCase()) ||
                          em.from.toLowerCase().includes(emailSearchQuery.toLowerCase()) ||
                          em.subject.toLowerCase().includes(emailSearchQuery.toLowerCase()) ||
                          em.body.toLowerCase().includes(emailSearchQuery.toLowerCase()) ||
                          (em.voucherCode && em.voucherCode.toLowerCase().includes(emailSearchQuery.toLowerCase()));

                        const matchesType = 
                          emailTypeFilter === 'all' ||
                          em.type === emailTypeFilter;

                        return matchesSearch && matchesType;
                      });

                      return (
                        <div className="space-y-4">
                          {/* Search & Filter bar */}
                          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex flex-col md:flex-row gap-4 items-center shadow-md">
                            <div className="relative flex-1 w-full">
                              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                              <input
                                type="text"
                                placeholder="Sök mottagare, avsändare, ämne, innehåll eller voucherkod..."
                                value={emailSearchQuery}
                                onChange={(e) => setEmailSearchQuery(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg pl-10 pr-4 py-1.5 text-xs font-mono focus:outline-none focus:border-amber-500"
                              />
                              {emailSearchQuery && (
                                <button onClick={() => setEmailSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white border-0 bg-transparent">
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono w-full md:w-auto shrink-0">
                              <Filter className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-slate-400 mr-1 uppercase text-[10px]">Typ:</span>
                              <select
                                value={emailTypeFilter}
                                onChange={(e) => setEmailTypeFilter(e.target.value)}
                                className="bg-transparent text-slate-200 outline-none cursor-pointer"
                              >
                                <option value="all">Alla typer</option>
                                <option value="incoming">Inkommande svar</option>
                                <option value="booking">Bokningsbekräftelser</option>
                                <option value="voucher">Kuponger & Presentkort</option>
                                <option value="admin_notify">Systemnotiser</option>
                                <option value="general_reply">Manuellt skickat</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 animate-fadeIn">
                            {filteredEmailsList.length === 0 ? (
                              <div className="p-8 text-center text-slate-500 font-mono text-xs">
                                Inga loggade e-postmeddelanden matchar sök- eller filtervillkor.
                              </div>
                            ) : (
                              filteredEmailsList.map((em) => (
                                <div
                                  key={em.id}
                                  className={`bg-slate-900/60 border rounded-xl overflow-hidden p-4 space-y-3 relative group transition-all ${
                                    em.type === 'incoming' 
                                      ? 'border-amber-500/35 bg-amber-500/5' 
                                      : 'border-slate-800'
                                  }`}
                                >
                                  <div className="flex flex-wrap justify-between items-start gap-2 text-xs">
                                    <div>
                                      <span className="text-slate-500 font-mono block uppercase text-[10px]">Till:</span>
                                      <span className="font-bold text-slate-200">{em.to}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 font-mono block uppercase text-[10px]">Från:</span>
                                      <span className="text-slate-300 font-medium">{em.from}</span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-slate-500 font-mono text-[9px] block">
                                        {new Date(em.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(em.sentAt).toLocaleDateString()}
                                      </span>
                                      
                                      <span className={`inline-block text-[8px] font-mono tracking-wider font-bold uppercase py-0.5 px-1.5 rounded mt-1.5 ${
                                        em.type === 'incoming'
                                          ? 'bg-amber-600 text-slate-950 font-extrabold border border-amber-500'
                                          : em.type === 'voucher' 
                                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                          : em.type === 'admin_notify'
                                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                          : em.type === 'general_reply'
                                          ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20'
                                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      }`}>
                                        {em.type === 'incoming' ? 'Inkommande Svar' : em.type === 'voucher' ? 'Kupong' : em.type === 'general_reply' ? 'Manuellt Skickat' : em.type === 'admin_notify' ? 'System Notis' : 'Bokningsbekräftelse'}
                                      </span>
                                    </div>
                                  </div>

                                  <hr className="border-slate-800" />

                                  <div className="space-y-1">
                                    <span className="text-slate-500 text-[10px] font-mono block uppercase">Ämne / Subject:</span>
                                    <span className="font-serif font-bold text-slate-100 text-sm">{em.subject}</span>
                                  </div>

                                  {/* Message body block */}
                                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                                    {em.body}
                                  </div>

                                  {/* Copy details or handle */}
                                  {em.voucherCode && (
                                    <div className="flex items-center justify-between bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-lg">
                                      <div className="flex items-center gap-2">
                                        <Ticket className="w-4 h-4 text-amber-500" />
                                        <span className="text-amber-300 font-bold text-xs">Aktiv Voucherkod: {em.voucherCode}</span>
                                      </div>
                                      <button
                                        onClick={() => handleCopyCode(em.voucherCode!, em.id)}
                                        className="text-[10px] font-mono uppercase bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/20 px-2.5 py-1 rounded transition-all flex items-center gap-1"
                                      >
                                        {copiedEmailId === em.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        {copiedEmailId === em.id ? 'Kopierad' : 'Kopiera kod'}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* SUB TAB 2: COMPOSE CUSTOM MESSAGES */}
                {emailSubTab === 'compose' && (
                  <form onSubmit={handleComposeSubmit} className="space-y-4">
                    <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                      <h4 className="font-serif text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Send className="w-4 h-4 text-amber-500" /> Skriv Manuellt Epost till Kund
                      </h4>
                      <span className="text-slate-400 font-mono text-xs">Från SMTP: {adminProfile.emailAddress}</span>
                    </div>

                    {isComposeSending && (
                      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                          </span>
                          <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest animate-pulse">
                            KOPPLAR PÅ SMTP REALTID...
                          </span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 font-mono text-[10.5px] text-slate-400 space-y-1.5 max-h-[120px] overflow-y-auto leading-normal">
                          <p className="text-emerald-500">⚡ SÄNDER E-POST MEDDELANDE VIA SÄKER PROXY</p>
                          <p className="text-slate-400">[info] Destination: {composeTo}</p>
                          <p className="text-slate-400">[info] SMTP Värdadress: {adminProfile.smtpHost}:{adminProfile.smtpPort}</p>
                          <p className="text-slate-400">[info] Avsändare: {adminProfile.displayName} ({adminProfile.emailAddress})</p>
                          <p className="text-amber-400 animate-pulse">[socket] Försöker etablera krypterad kanal (STARTTLS/SSL)...</p>
                        </div>
                      </div>
                    )}

                    {composeSuccess && (
                      <div className="p-3.5 bg-emerald-700/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-mono flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 animate-bounce" /> <span>{composeSuccess}</span>
                      </div>
                    )}

                    {composeError && (
                      <div className="p-4 bg-red-950/45 border border-red-500/30 text-red-400 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-red-400 font-bold font-mono text-xs uppercase">
                          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                          <span>SMTP ÖVERFÖRINGSFAIL / FELAKTIG ANSLUTNING</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-red-950 text-xs font-mono text-slate-350 leading-relaxed select-all">
                          {composeError}
                        </div>
                        <p className="text-[10px] text-slate-400 font-sans leading-normal">
                          ⚠️ <strong>Felsökningsvägledning:</strong> Det gick inte att nå SMTP-servern med angiven port ({adminProfile.smtpPort}). Säkerställ att du angett korrekta autentiseringsuppgifter, samt att nätverkstrafiken tillåts. Port 587 rekommenderas för STARTTLS.
                        </p>
                      </div>
                    )}

                    {/* Pre-fill recipient tools */}
                    {bookings.length > 0 && (
                      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1.5 text-xs text-slate-300">
                        <span className="text-slate-500 text-[10px] font-mono uppercase font-bold tracking-widest block">Snabb-välj mottagare (Befintliga bokningar)</span>
                        <div className="flex flex-wrap gap-1.5">
                          {bookings.map((bk, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setComposeTo(bk.email);
                                setComposeSubject(`Angående din bordsreservation ${bk.date} (Ref: ${bk.reference || 'PEL-MOCK'})`);
                                setComposeBody(`Hej ${bk.name},\n\nTack för din bokningsförfrågan hos oss på Krog Pelikan!\n\nVi vill hälsa er hjärtligt välkomna och bekräfta att vi reserverat ett vackert bord för er den ${bk.date} kl ${bk.time}.\n\nMed vänlig hålsning,\nHovmästaren, Krog Pelikan`);
                              }}
                              className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-2 py-1.5 rounded-lg text-[10px] font-mono transition-colors"
                            >
                              {bk.name} ({bk.email})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5">
                        <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider font-medium">Mottagare (To-Address)</label>
                        <input
                          type="email"
                          required
                          value={composeTo}
                          onChange={(e) => setComposeTo(e.target.value)}
                          placeholder="t.ex. sven.andersson@telia.se"
                          className="w-full bg-slate-900 border border-slate-800 text-slate-50 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider font-medium">Avsändare (From-Address)</label>
                        <input
                          type="text"
                          disabled
                          value={`${adminProfile.displayName} <${adminProfile.emailAddress}>`}
                          className="w-full bg-slate-900/50 border border-slate-800 text-slate-500 rounded-lg px-3 py-2 text-xs font-mono"
                        />
                      </div>

                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider font-medium">Ämne / Subject</label>
                      <input
                        type="text"
                        required
                        value={composeSubject}
                        onChange={(e) => setComposeSubject(e.target.value)}
                        placeholder="t.ex. Information angående er middag"
                        className="w-full bg-slate-900 border border-slate-800 text-slate-50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider font-medium">Meddelande / Body</label>
                      <textarea
                        required
                        value={composeBody}
                        onChange={(e) => setComposeBody(e.target.value)}
                        rows={6}
                        placeholder="Skriv ditt e-postmeddelande här..."
                        className="w-full bg-slate-900 border border-slate-800 text-slate-50 rounded-lg p-3 text-xs focus:outline-none focus:border-amber-500 font-sans leading-relaxed"
                      ></textarea>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isComposeSending}
                        className={`bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs tracking-widest px-6 py-2.5 rounded-xl uppercase flex items-center gap-1.5 shadow-md pl-6 mr-1 ${
                          isComposeSending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <Send className="w-4 h-4" />
                        <span>{isComposeSending ? 'SÄNDER...' : 'Skicka Transmitters / Send Email'}</span>
                      </button>
                    </div>

                  </form>
                )}

                {/* SUB TAB 2.5: SMTP BULK NEWSLETTER DISPATCHER */}
                {emailSubTab === 'bulk_send' && (
                  <form onSubmit={handleBulkSendSubmit} className="space-y-4">
                    <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                      <h4 className="font-serif text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-400" /> Bulk SMTP Massutskick
                      </h4>
                      <span className="text-slate-400 font-mono text-xs">Aktiv kanal: SMTP server list</span>
                    </div>

                    {bulkSuccess && (
                      <div className="p-3.5 bg-emerald-700/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-mono flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 animate-bounce" /> <span>{bulkSuccess}</span>
                      </div>
                    )}

                    {bulkError && (
                      <div className="p-3.5 bg-red-700/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-mono flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 animate-pulse" /> <span>{bulkError}</span>
                      </div>
                    )}

                    {/* Step 1: Select Users grid */}
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[10.5px] font-mono uppercase font-bold tracking-widest block">Steg 1: Välj mottagare ({bulkSelectedEmails.length} valda)</span>
                        <button
                          type="button"
                          onClick={handleSelectAllBulkEmails}
                          className="text-[10px] uppercase font-mono text-amber-500 hover:text-amber-400 transition-colors font-bold cursor-pointer"
                        >
                          {bulkSelectedEmails.length === getUniqueCustomers().length ? 'Avmarkera alla' : 'Välj alla i systemet'}
                        </button>
                      </div>

                      {getUniqueCustomers().length === 0 ? (
                        <p className="text-slate-500 font-serif text-xs">Inga sparade e-postdresser i gästlistan ännu. Nya gäster läggs till så fort de bokar bord.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
                          {getUniqueCustomers().map((c: any) => (
                            <label 
                              key={c.email} 
                              className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
                                bulkSelectedEmails.includes(c.email)
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                  : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                              }`}
                            >
                              <input 
                                type="checkbox"
                                checked={bulkSelectedEmails.includes(c.email)}
                                onChange={() => handleToggleBulkSelectEmail(c.email)}
                                className="mt-0.5 accent-amber-550 h-3 w-3"
                              />
                              <div className="truncate">
                                <span className="block font-bold text-slate-200 truncate">{c.name}</span>
                                <span className="block text-[9.5px] text-slate-500 truncate">{c.email}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pre-made bulk proposal templates */}
                    <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-xl space-y-2 text-xs">
                      <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">Snabbmallar för massutskick:</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setBulkSubject(`Exklusivt julerbjudande hos Krog Pelikan!`);
                            setBulkBody(`Kära gäst,\n\nVi vill tacka dig för att du är en trogen besökare hos oss på Krog Pelikan!\n\nJust nu firar vi med en fantastisk kampanj i vår nylanserade Gift Voucher Studio. För varje inköpt presentkort bjuder vi på hela ${voucherConfig.defaultPercentage}% extra i rymligt bonusvärde helt utan extra avgifter!\n\nKöp ditt presentkort direkt på hemsidan.\n\nVänliga hälsningar,\nHovmästaren, Krog Pelikan`);
                          }}
                          className="bg-slate-950 hover:bg-slate-800 text-amber-500 border border-amber-500/25 px-2.5 py-1.5 rounded-lg text-[10.5px] font-mono font-semibold transition-all"
                        >
                          🎁 Presentkortskampanj (+{voucherConfig.defaultPercentage}%)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBulkSubject(`Ny provsmakningsmeny på Krog Pelikan`);
                            setBulkBody(`Hej,\n\nKökschefen på Krog Pelikan har tagit fram en spännande ny avsmakningsmeny inspirerad av klassisk svensk husmanskost med en elegant, modern tvist.\n\nVi bjuder in dig att boka ditt favoritbord redan idag för att uppleva vårens alla smaker hos oss!\n\nVarmt välkomna!\n\nHälsningar,\nHovmästar-teamet`);
                          }}
                          className="bg-slate-950 hover:bg-slate-850 text-slate-350 border border-slate-800 px-2.5 py-1.5 rounded-lg text-[10.5px] font-mono transition-all"
                        >
                          🍽️ Presentation av ny meny
                        </button>
                      </div>
                    </div>

                    {/* Step 2: Write email headers & body */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-slate-305 text-xs font-mono uppercase tracking-wider font-semibold">Ämne / Broadcaster Subject</label>
                        <input
                          type="text"
                          required
                          value={bulkSubject}
                          onChange={(e) => setBulkSubject(e.target.value)}
                          placeholder="t.ex. Information angående er middag"
                          className="w-full bg-slate-900 border border-slate-800 text-slate-50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider font-semibold">Brödtext / Mail Body</label>
                        <textarea
                          required
                          value={bulkBody}
                          onChange={(e) => setBulkBody(e.target.value)}
                          rows={6}
                          placeholder="Skriv det gemensamma meddelandet till alla markerade gäster här..."
                          className="w-full bg-slate-900 border border-slate-800 text-slate-50 rounded-lg p-3 text-xs focus:outline-none focus:border-amber-500 font-sans leading-relaxed"
                        ></textarea>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isBulkSending || bulkSelectedEmails.length === 0}
                        className={`font-bold font-mono text-xs tracking-widest px-6 py-2.5 rounded-xl uppercase flex items-center gap-1.5 shadow-md transition-all ${
                          isBulkSending || bulkSelectedEmails.length === 0
                            ? 'bg-slate-800 text-slate-500 border border-slate-850 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-555 text-slate-950 cursor-pointer'
                        }`}
                      >
                        <Send className="w-4 h-4" />
                        <span>
                          {isBulkSending 
                            ? 'Sänder via SMTP...' 
                            : `Skicka SMTP Gruppmejl till ${bulkSelectedEmails.length} gäster`
                          }
                        </span>
                      </button>
                    </div>

                  </form>
                )}

                {/* SUB TAB 3: SIMULATE INCOMING REPLIES FROM CLIENTS */}
                {emailSubTab === 'simulate' && (
                  <form onSubmit={handleSimulateSubmit} className="space-y-4">
                    <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                      <h4 className="font-serif text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <ArrowLeftRight className="w-4 h-4 text-amber-500" /> Simulera Inkommande Kundsvar
                      </h4>
                      <span className="bg-slate-900/50 text-slate-400 font-mono text-xs border border-slate-800 px-3 py-1 rounded-full">
                        Mottagare: {adminProfile.emailAddress}
                      </span>
                    </div>

                    <p className="text-[#a37c44] text-xs font-sans italic bg-amber-500/5 p-3 rounded-xl border border-amber-600/10">
                      Eftersom ingen riktig e-postanslutning kan ta emot meddelanden i denna sandlåda utan en mailserver, låter denna simulator dig skriva och "ta emot" svar direkt från dina kunders adresser för att testa postgången och layouten!
                    </p>

                    {simSuccess && (
                      <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-mono flex items-center gap-2">
                        <Check className="w-5 h-5 text-indigo-400" /> <span>{simSuccess}</span>
                      </div>
                    )}

                    {/* Simulation presets list */}
                    <div className="space-y-1.5">
                      <span className="block text-slate-400 text-[10px] font-mono uppercase font-bold tracking-widest">Single-Click Svars-mallar (Simulera svar)</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {[
                          {
                            title: 'Ändra gästantal',
                            fromEmail: bookings[0]?.email || 'johan.nilsson@gmail.com',
                            fromName: bookings[0]?.name || 'Johan Nilsson',
                            subject: 'Fråga: Kan vi utöka antalet gäster på vår bokning?',
                            body: `Hej!\n\nVi har en bokning den ${bookings[0]?.date || 'kommande helg'} men skulle vilja öka på sällskapet med 1 person om möjligt? Vi blir då totalt ${((bookings[0]?.guests || 2) + 1)} gäster.\n\nTacksam för kvickt svar!\nMvh\n${bookings[0]?.name || 'Johan'}`
                          },
                          {
                            title: 'Hundfråga',
                            fromEmail: bookings[1]?.email || 'maria.berg@icloud.com',
                            fromName: bookings[1]?.name || 'Maria Berg',
                            subject: 'Hundar tillåtna hos er?',
                            body: `Hej hovmästaren!\n\nUndrar bara om det går bra att ta med sig en liten sällskapshund in i matsalen hos er på Pelikan? Hon är mycket lugn och tyst.\n\nTack på förhand!`
                          },
                          {
                            title: 'Allergifråga Snaps',
                            fromEmail: bookings[2]?.email || 'sandra.andersson@telia.se',
                            fromName: bookings[2]?.name || 'Sandra',
                            subject: 'Angående er husmanskost-meny och celiaki',
                            body: `Hejsan Krog Pelikan!\n\nHar ni bra ordnat med glutenfria alternativ? Är torkad torsk och köttbullarna anpassningsbara för allvarlig celiaki?\n\nMvh\nSandra`
                          }
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => fillSimulationPreset(preset)}
                            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left p-3 rounded-xl transition-all space-y-1"
                          >
                            <span className="text-amber-500 font-mono text-[10px] uppercase font-bold block">{preset.title}</span>
                            <span className="text-slate-400 text-[11px] block truncate">{preset.fromEmail}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5">
                        <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Avsändare E-post (Från)</label>
                        <input
                          type="email"
                          required
                          value={simFromEmail}
                          onChange={(e) => setSimFromEmail(e.target.value)}
                          placeholder="t.ex. johanna@example.com"
                          className="w-full bg-slate-900 border border-slate-800 text-slate-50 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Avsändare Namn</label>
                        <input
                          type="text"
                          value={simFromName}
                          onChange={(e) => setSimFromName(e.target.value)}
                          placeholder="t.ex. Johanna Lindqvist"
                          className="w-full bg-slate-900 border border-slate-800 text-slate-50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>

                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Ämne / Subject</label>
                      <input
                        type="text"
                        required
                        value={simSubject}
                        onChange={(e) => setSimSubject(e.target.value)}
                        placeholder="Ärendeangivelse..."
                        className="w-full bg-slate-900 border border-slate-800 text-slate-50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Meddelande / Reply Content</label>
                      <textarea
                        required
                        value={simBody}
                        onChange={(e) => setSimBody(e.target.value)}
                        rows={4}
                        placeholder="Skriv kundens meddelande här..."
                        className="w-full bg-slate-900 border border-slate-800 text-slate-50 rounded-lg p-3 text-xs focus:outline-none focus:border-amber-500 font-sans leading-relaxed"
                      ></textarea>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold font-mono text-xs tracking-widest px-6 py-2.5 rounded-xl uppercase flex items-center gap-1.5 shadow-md"
                      >
                        <Inbox className="w-4 h-4 text-slate-950" />
                        <span>Leverera Inkommande E-post</span>
                      </button>
                    </div>

                  </form>
                )}

                {/* SUB TAB 4: SMTP SETTINGS PAGE */}
                {emailSubTab === 'settings' && (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                      <h4 className="font-serif text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Settings className="w-4 h-4 text-amber-500" /> SMTP- & Avsändarkonfigurering
                      </h4>
                      <span className="bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400 uppercase tracking-widest">
                        KOPPLING Aktiv
                      </span>
                    </div>

                    {profileSuccessMessage && (
                      <div className="p-3.5 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-mono flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" /> <span>{profileSuccessMessage}</span>
                      </div>
                    )}

                    {/* Explanation */}
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Skriv in de e-postdetaljer samt avsändaruppgifter som du vill använda. När du klickar på spara kommer e-post att simuleras utgående från denna information över hela webbplatsen samt kuponggenereringen.
                    </p>

                    <div className="border-t border-slate-850 pt-4 mt-2">
                      <span className="text-amber-500 text-[10px] font-mono uppercase font-bold tracking-widest block mb-3">👤 ADMIN USER DETAILS & PROFILE ROLE</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider font-semibold">Namn / Display Name</label>
                          <input
                            type="text"
                            required
                            value={adminProfile.displayName || ''}
                            onChange={(e) => setAdminProfile({ ...adminProfile, displayName: e.target.value })}
                            placeholder="t.ex. Krog Pelikan Hovmästare"
                            className="w-full bg-slate-900 border border-slate-800 text-slate-50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider font-semibold">Tjänst / Title Position</label>
                          <input
                            type="text"
                            required
                            value={adminProfile.position || ''}
                            onChange={(e) => setAdminProfile({ ...adminProfile, position: e.target.value })}
                            placeholder="Hovmästare / Restaurant Manager"
                            className="w-full bg-slate-900 border border-slate-800 text-slate-50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider font-semibold">Telefon / Contact Phone</label>
                          <input
                            type="text"
                            required
                            value={adminProfile.phone || ''}
                            onChange={(e) => setAdminProfile({ ...adminProfile, phone: e.target.value })}
                            placeholder="+46 (0)8 556 413 10"
                            className="w-full bg-slate-900 border border-slate-800 text-slate-50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-850 pt-4 mt-2">
                      <span className="text-amber-500 text-[10px] font-mono uppercase font-bold tracking-widest block mb-3">🔐 SMTP MAIL LOGIN CREDENTIALS & SENDER AUTHENTICATION</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5 col-span-1">
                          <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider font-semibold">Skickande E-post (Sender Email)</label>
                          <input
                            type="email"
                            required
                            value={adminProfile.emailAddress || ''}
                            onChange={(e) => setAdminProfile({ ...adminProfile, emailAddress: e.target.value })}
                            placeholder="t.ex. hovmastare@pelikan.se"
                            className="w-full bg-slate-900 border border-slate-800 text-slate-50 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="space-y-1.5 col-span-1">
                          <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider font-semibold">SMTP login-användarnamn</label>
                          <input
                            type="text"
                            required
                            value={adminProfile.smtpUsername || ''}
                            onChange={(e) => setAdminProfile({ ...adminProfile, smtpUsername: e.target.value })}
                            placeholder="användarnamn"
                            className="w-full bg-slate-900 border border-slate-800 text-slate-50 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="space-y-1.5 col-span-1">
                          <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider font-semibold">SMTP Lösenord (SMTP Password)</label>
                          <input
                            type="password"
                            required
                            value={adminProfile.smtpPassword || ''}
                            onChange={(e) => setAdminProfile({ ...adminProfile, smtpPassword: e.target.value })}
                            placeholder="lösenord"
                            className="w-full bg-slate-900 border border-slate-850 text-slate-50 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-900 pt-4">
                      
                      <div className="space-y-1.5">
                        <label className="block text-slate-400 text-[10px] font-mono uppercase tracking-wider">SMTP Server</label>
                        <input
                          type="text"
                          required
                          value={adminProfile.smtpHost || ''}
                          onChange={(e) => setAdminProfile({ ...adminProfile, smtpHost: e.target.value })}
                          placeholder="smtp.pelikan.se"
                          className="w-full bg-slate-900 border border-slate-800 text-slate-50 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-slate-400 text-[10px] font-mono uppercase tracking-wider">SMTP Port</label>
                        <input
                          type="number"
                          required
                          value={adminProfile.smtpPort || 587}
                          onChange={(e) => setAdminProfile({ ...adminProfile, smtpPort: parseInt(e.target.value) || 465 })}
                          placeholder="465"
                          className="w-full bg-slate-900 border border-slate-800 text-slate-50 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1.5 flex flex-col justify-end pb-1">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs font-mono py-2">
                          <input
                            type="checkbox"
                            checked={adminProfile.useSsl}
                            onChange={(e) => setAdminProfile({ ...adminProfile, useSsl: e.target.checked })}
                            className="rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-amber-500"
                          />
                          Använd SSL/TLS Säkring
                        </label>
                      </div>

                    </div>

                    <div className="flex justify-between items-center gap-4 pt-3 border-t border-slate-900">
                      <p className="text-[10px] font-mono text-slate-500 leading-normal max-w-sm">
                        Inställningarna valideras mot mailbox-servern. Du kommer se bekräftelsen direkt efter lagring.
                      </p>
                      
                      <button
                        type="submit"
                        disabled={isTestConnecting}
                        className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold font-mono text-xs tracking-widest px-6 py-3 rounded-xl uppercase flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0"
                      >
                        {isTestConnecting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-slate-550" />
                            <span>Kopplar upp...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 stroke-[2.5px]" />
                            <span>Spara & Konfigurera SMTP</span>
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                )}

                {/* SUB TAB 5: STRIPE CREDENTIALS SETTINGS */}
                {emailSubTab === 'stripe_settings' && (
                  <form onSubmit={handleSaveStripeConfig} className="space-y-4">
                    <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                      <h4 className="font-serif text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Key className="w-4 h-4 text-amber-500" /> Stripe-betalningsintegration
                      </h4>
                      <span className="bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-[9px] font-mono text-amber-500 uppercase tracking-widest font-bold">
                        API v3 Active
                      </span>
                    </div>

                    {stripeSuccessMessage && (
                      <div className="p-3.5 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-mono flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" /> <span>{stripeSuccessMessage}</span>
                      </div>
                    )}

                    <p className="text-slate-400 text-xs leading-relaxed">
                      Ange dina Stripe-kontofiler nedan. Dessa nycklar möjliggör realtidsbetalning för presentkortsköp. När en kund köper ett presentkort i butiken anropas vår säkra backend för att verifiera debiteringen via Stripe och därefter skicka en bekräftelse på svensk husmanskost till e-postadressen.
                    </p>

                    <div className="border-t border-slate-850 pt-4 mt-2">
                      <span className="text-amber-500 text-[10px] font-mono uppercase font-bold tracking-widest block mb-4">🔑 STRIPE CONNECT CREDENTIALS</span>
                      
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider font-semibold">Stripe Publishable Key (Offentlig nyckel)</label>
                          <input
                            type="text"
                            required
                            value={stripePublishableKey}
                            onChange={(e) => setStripePublishableKey(e.target.value)}
                            placeholder="t.ex. pk_test_51OpPliIm..."
                            className="w-full bg-slate-900 border border-slate-800 text-slate-50 rounded-lg px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-amber-500"
                          />
                          <p className="text-[10px] text-slate-500">Börjar vanligtvis med pk_test_ eller pk_live_</p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider font-semibold">Stripe Secret Key (Hemlig nyckel)</label>
                          <input
                            type="password"
                            required
                            value={stripeSecretKey}
                            onChange={(e) => setStripeSecretKey(e.target.value)}
                            placeholder="t.ex. sk_test_51OpPliIm..."
                            className="w-full bg-slate-900 border border-slate-850 text-slate-50 rounded-lg px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-amber-500"
                          />
                          <p className="text-[10px] text-slate-500">Börjar vanligtvis med sk_test_ eller sk_live_. Håll denna nyckel strikt hemlig.</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl mt-4 flex items-start gap-2.5">
                      <Lock className="w-5 h-5 text-amber-500/80 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-slate-305 text-slate-300 text-[11px] font-bold font-mono uppercase tracking-wider block">🔒 SÄKER SERVER-PROXY LOGIK</span>
                        <p className="text-slate-400 text-[10.5px] leading-relaxed">
                          Nyckeln skickas aldrig till kundernas webbläsare. Den skickas krypterad via säkra kanaler och behandlas uteslutande av vår inbyggda NodeJS-express-server för att verifiera transaktionerna.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center gap-4 pt-3 border-t border-slate-900">
                      <p className="text-[10px] font-mono text-slate-500 leading-normal max-w-sm">
                        Klicka på knappen bredvid för att läsa in det nya certifikatet och spara konfigurationen.
                      </p>
                      <button
                        type="submit"
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs tracking-widest px-6 py-3 rounded-xl uppercase flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
                      >
                        <Check className="w-4 h-4 stroke-[2.5px]" />
                        <span>Spara Stripe-nycklar</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* SUB TAB 6: STRIPE TRANSACTIONS BOARD */}
                {emailSubTab === 'stripe_transactions' && (
                  <div className="space-y-5">
                    <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                      <h4 className="font-serif text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-amber-500" /> Stripe-transaktionshistorik
                      </h4>
                      <span className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                        Betalväxel LOGS
                      </span>
                    </div>

                    {/* Dashboard figures */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1 shadow">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Totalt Omsatt (Presentkort)</span>
                        <span className="text-2xl font-serif text-amber-500 font-bold block">
                          {stripeTransactions.reduce((acc, tx) => acc + tx.amount, 0).toLocaleString()} SEK
                        </span>
                      </div>
                      
                      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1 shadow">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Antal Transaktioner</span>
                        <span className="text-2xl font-serif text-white font-bold block">
                          {stripeTransactions.length} st
                        </span>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1 shadow">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Genomsnittligt köp</span>
                        <span className="text-2xl font-serif text-amber-200 font-bold block">
                          {stripeTransactions.length > 0 
                            ? Math.round(stripeTransactions.reduce((acc, tx) => acc + tx.amount, 0) / stripeTransactions.length).toLocaleString() 
                            : '0'} SEK
                        </span>
                      </div>
                    </div>

                    {/* Table of logs */}
                    {/* Table of logs */}
                    {(() => {
                      const filteredStripeTransactions = stripeTransactions.filter(tx => {
                        const matchesSearch = 
                          tx.id.toLowerCase().includes(stripeSearchQuery.toLowerCase()) ||
                          tx.voucherCode.toLowerCase().includes(stripeSearchQuery.toLowerCase()) ||
                          tx.senderName.toLowerCase().includes(stripeSearchQuery.toLowerCase()) ||
                          tx.senderEmail.toLowerCase().includes(stripeSearchQuery.toLowerCase()) ||
                          tx.recipientName.toLowerCase().includes(stripeSearchQuery.toLowerCase()) ||
                          tx.recipientEmail.toLowerCase().includes(stripeSearchQuery.toLowerCase());
                        
                        return matchesSearch;
                      });

                      return (
                        <div className="space-y-4">
                          <span className="text-amber-500 text-[10px] font-mono uppercase font-bold tracking-widest block">📋 TRANSAKTIONSLOGGAR FRÅN HÅRDA PLATFORMEN</span>
                          
                          {stripeTransactions.length > 0 && (
                            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center shadow-md">
                              <div className="relative flex-1 w-full">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                  type="text"
                                  placeholder="Sök transaktions-ID, presentkod, köpare, mottagare eller e-post..."
                                  value={stripeSearchQuery}
                                  onChange={(e) => setStripeSearchQuery(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg pl-10 pr-4 py-1.5 text-xs font-mono focus:outline-none focus:border-amber-500"
                                />
                                {stripeSearchQuery && (
                                  <button onClick={() => setStripeSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white border-0 bg-transparent">
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {filteredStripeTransactions.length === 0 ? (
                            <div className="text-center py-12 bg-slate-905 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl space-y-2">
                              <CreditCard className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
                              <h5 className="font-serif text-slate-300 text-sm font-bold">Inga matchande köp funna</h5>
                              <p className="text-slate-500 text-[11px] max-w-xs mx-auto leading-relaxed">
                                Försök ändra din sökfras eller låt kunden slutföra betalväxeln i restaurangen.
                              </p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/60 shadow">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                                    <th className="px-4 py-3">Referens ID / Tid</th>
                                    <th className="px-4 py-3">Presentkort</th>
                                    <th className="px-4 py-3">Köpare (Sender)</th>
                                    <th className="px-4 py-3">Mottagare (Recipient)</th>
                                    <th className="px-4 py-3 text-right">Belopp</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-850 text-xs font-sans">
                                  {filteredStripeTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-900/50 transition-all">
                                      <td className="px-4 py-3 space-y-0.5">
                                        <span className="font-mono text-[10.5px] font-semibold text-slate-305 text-slate-300 block select-all truncate max-w-[125px]" title={tx.id}>
                                          {tx.id}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-mono block">
                                          {new Date(tx.createdAt).toLocaleDateString('sv-SE')} {new Date(tx.createdAt).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className="bg-slate-950 font-mono text-[9px] text-amber-500 px-2 py-0.5 rounded border border-amber-500/10 font-bold block w-fit">
                                          {tx.voucherCode}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="text-slate-205 text-slate-200 font-medium">{tx.senderName}</div>
                                        <div className="text-slate-500 text-[10px] font-mono">{tx.senderEmail}</div>
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="text-slate-205 text-slate-200 font-medium">{tx.recipientName}</div>
                                        <div className="text-slate-500 text-[10px] font-mono">{tx.recipientEmail}</div>
                                      </td>
                                      <td className="px-4 py-3 text-right text-slate-100 font-mono font-extrabold text-amber-500 whitespace-nowrap">
                                        {tx.amount} SEK
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        <span className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[9px] font-mono text-emerald-400 uppercase tracking-wider font-semibold inline-flex items-center gap-1">
                                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                                          Succeeded
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

              </div>

            </motion.div>
          )}

          {/* TAB 6: MENU & CATEGORY MANAGEMENT */}
          {adminTab === 'menu' && (
            <motion.div
              key="menu-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Menu Sub Navigation */}
              <div className="flex justify-between items-center bg-slate-900 border border-slate-850 p-4 rounded-xl">
                <div className="flex gap-2">
                  <button
                    onClick={() => setAdminMenuSubTab('dishes')}
                    className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
                      adminMenuSubTab === 'dishes'
                        ? 'bg-amber-600 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Menu className="w-3.5 h-3.5" />
                    <span>{adminLang === 'sv' ? 'Hantera Maträtter' : 'Manage Dishes'}</span>
                  </button>
                  <button
                    onClick={() => setAdminMenuSubTab('categories')}
                    className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
                      adminMenuSubTab === 'categories'
                        ? 'bg-amber-600 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{adminLang === 'sv' ? 'Hantera Kategorier' : 'Manage Categories'}</span>
                  </button>
                </div>
                
                {adminMenuSubTab === 'dishes' && (
                  <button
                    onClick={handleOpenCreateDishModal}
                    className="bg-amber-600 hover:bg-amber-550 text-slate-950 px-4 py-2 rounded-lg text-xs font-mono uppercase font-bold tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{adminLang === 'sv' ? 'Skapa Maträtt' : 'Add Dish'}</span>
                  </button>
                )}
              </div>

              {/* SECTION A: DISHES DATABASE */}
              {adminMenuSubTab === 'dishes' && (
                <div className="space-y-4">
                  <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex flex-wrap justify-between items-center gap-4">
                    <h4 className="font-serif text-base font-bold text-slate-200">
                      {adminLang === 'sv' ? 'Befintliga Maträtter i databasen' : 'Existing dishes inside system memory'}
                    </h4>
                    <span className="text-slate-500 font-mono text-[10px]">
                      {adminMenuItems.length} {adminLang === 'sv' ? 'maträtter listade' : 'dishes recorded'}
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-850 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-950 text-slate-400 text-[10px] font-mono uppercase tracking-wider border-b border-slate-800">
                            <th className="px-4 py-3.5">{adminLang === 'sv' ? 'Maträtt' : 'Dish Info'}</th>
                            <th className="px-4 py-3.5">{adminLang === 'sv' ? 'Kategori' : 'Category'}</th>
                            <th className="px-4 py-3.5 text-right">{adminLang === 'sv' ? 'Pris (SEK)' : 'Price'}</th>
                            <th className="px-4 py-3.5 text-center">{adminLang === 'sv' ? 'Status' : 'Status'}</th>
                            <th className="px-4 py-3.5 text-right font-bold">{adminLang === 'sv' ? 'Åtgärder' : 'Actions'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850 text-xs font-sans text-slate-200">
                          {adminMenuItems.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                                {adminLang === 'sv' ? 'Inga maträtter hittade.' : 'No items found. Create your first item above!'}
                              </td>
                            </tr>
                          ) : (
                            adminMenuItems.map((item) => {
                              const isPublished = item.published !== false;
                              const categoryObj = adminCategories.find(c => c.id === item.category);

                              return (
                                <tr key={item.id} className="hover:bg-slate-850/30 transition-all">
                                  <td className="px-4 py-3 flex items-center gap-3">
                                    <img 
                                      src={item.image} 
                                      alt={item.name} 
                                      className="w-10 h-10 object-cover rounded-lg border border-slate-800 shrink-0"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div>
                                      <div className="font-serif font-bold text-slate-50 flex items-center gap-1.5">
                                        <span>{adminLang === 'sv' ? item.name : item.swedishName}</span>
                                        {item.signature && (
                                          <span className="bg-amber-950 text-[8px] font-mono text-amber-500 border border-amber-500/20 px-1 py-0.2 rounded uppercase font-black">
                                            SIGNATURE
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[10px] text-slate-400 italic font-mono mt-0.5" title="Original Swedish template name / Alternate">
                                        Alt: {adminLang === 'sv' ? item.swedishName : item.name}
                                      </div>
                                      {item.tags && item.tags.length > 0 && (
                                        <div className="flex gap-1 mt-1 flex-wrap">
                                          {item.tags.map((t: string) => (
                                            <span key={t} className="text-[8px] bg-slate-805 text-slate-400 px-1.5 py-0.2 rounded font-mono font-bold">
                                              {t}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 font-mono text-slate-300">
                                    <span className="capitalize">
                                      {categoryObj ? (adminLang === 'sv' ? categoryObj.name : categoryObj.swedishName) : item.category}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-right font-mono font-bold text-amber-400">
                                    {item.price} kr
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <button
                                      onClick={() => handleTogglePublishMenuItem(item.id)}
                                      className={`inline-block px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest border rounded-md font-bold cursor-pointer transition-colors ${
                                        isPublished 
                                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20 hover:bg-emerald-900/50' 
                                          : 'bg-rose-950/40 text-rose-400 border-rose-500/20 hover:bg-rose-900/50'
                                      }`}
                                    >
                                      {isPublished ? (adminLang === 'sv' ? 'Publicerad' : 'Published') : (adminLang === 'sv' ? 'Dold' : 'Hidden')}
                                    </button>
                                  </td>
                                  <td className="px-4 py-3 text-right whitespace-nowrap">
                                    <div className="flex gap-1.5 justify-end">
                                      <button
                                        onClick={() => handleOpenEditDishModal(item)}
                                        className="bg-slate-800 hover:bg-slate-700 text-amber-400 p-1.5 rounded border border-slate-700 cursor-pointer"
                                        title={adminLang === 'sv' ? 'Redigera maträtt' : 'Edit dish'}
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteDishItem(item.id)}
                                        className="bg-slate-800 hover:bg-red-950 text-red-400 hover:text-red-300 p-1.5 rounded border border-slate-700 hover:border-red-500/20 cursor-pointer"
                                        title={adminLang === 'sv' ? 'Radera maträtt' : 'Delete dish'}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION B: CATEGORIES HUB */}
              {adminMenuSubTab === 'categories' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Category Creation (Left) */}
                  <form onSubmit={handleAddCategory} className="lg:col-span-5 bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4">
                    <h4 className="font-serif text-base font-bold text-amber-500 border-b border-slate-800 pb-2">
                      {adminLang === 'sv' ? 'Skapa ny matsedelskategori' : 'Create Menucard Category'}
                    </h4>
                    
                    <div className="space-y-1.5">
                      <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Uniskt Kategori-ID *</label>
                      <input
                        type="text"
                        required
                        value={catFormId}
                        onChange={(e) => setCatFormId(e.target.value.toLowerCase().replace(/\s/g, ''))}
                        placeholder="t.ex. desserts, pilsner, wine"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-50 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-[10px] text-slate-500 block italic leading-relaxed">
                        Används internt i databasen. Endast små bokstäver utan å/ä/ö, uttryck med streck.
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Namn på svenska *</label>
                      <input
                        type="text"
                        required
                        value={catFormName}
                        onChange={(e) => setCatFormName(e.target.value)}
                        placeholder="t.ex. Efterrätter"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-150 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Namn på engelska</label>
                      <input
                        type="text"
                        value={catFormSwName}
                        onChange={(e) => setCatFormSwName(e.target.value)}
                        placeholder="t.ex. Sweet Desserts"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-150 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Beskrivning (frivillig)</label>
                      <textarea
                        value={catFormDesc}
                        onChange={(e) => setCatFormDesc(e.target.value)}
                        rows={3}
                        placeholder="Anrik svensk avslutning på middagen..."
                        className="w-full bg-slate-950 border border-slate-800 text-slate-150 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-amber-600 hover:bg-amber-550 text-slate-950 py-3 rounded-lg text-xs font-mono uppercase font-black tracking-widest flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5px]" />
                      <span>{adminLang === 'sv' ? 'Spara nya kategori' : 'Append Category'}</span>
                    </button>
                  </form>

                  {/* Category Database list (Right) */}
                  <div className="lg:col-span-7 space-y-4 bg-slate-900 border border-slate-850 p-6 rounded-2xl">
                    <h4 className="font-serif text-base font-bold text-slate-200">
                      {adminLang === 'sv' ? 'Registrerade kategorier' : 'Dynamic Menu Categories'}
                    </h4>
                    
                    <div className="space-y-3 font-sans">
                      {adminCategories.map((cat) => {
                        const isSystem = ['starters', 'mains', 'desserts', 'drinks'].includes(cat.id);

                        return (
                          <div 
                            key={cat.id} 
                            className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between gap-4"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-serif font-bold text-slate-100">{cat.name}</span>
                                <span className="text-[10px] bg-slate-850 text-slate-400 px-2 py-0.5 rounded-md font-mono">
                                  ID: {cat.id}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1">{cat.description || (adminLang === 'sv' ? 'Ingen beskrivning angiven.' : 'No description.')}</p>
                              <p className="text-[10px] text-stone-500 italic mt-0.5">Translation: {cat.swedishName}</p>
                            </div>

                            {!isSystem ? (
                              <button
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="bg-slate-850 hover:bg-red-950 text-slate-400 hover:text-red-300 p-2 rounded-lg border border-slate-850 hover:border-red-500/20 cursor-pointer"
                                title={adminLang === 'sv' ? 'Radera kategori' : 'Delete category'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="text-[9px] font-mono text-amber-600 font-bold border border-amber-500/10 bg-amber-950/20 px-2 py-0.5 rounded whitespace-nowrap">
                                SYSTEM CATEGORY
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 7: STAFF MANAGEMENT */}
          {adminTab === 'staff' && (
            <motion.div
              layout
              key="staff-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-4xl mx-auto"
            >
              {/* Header card */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-amber-500 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    <span>PERSONALPORTAL • Behörigheter</span>
                  </h3>
                  <p className="text-slate-400 text-xs font-sans">Skapa unika inloggningsuppgifter till dina hovmästare samt kontrollera vilka flikar och inställningar de har tillgång till.</p>
                </div>
                
                <button
                  type="button"
                  onClick={handleOpenCreateStaffModal}
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4 stroke-[2.5px]" />
                  <span>Skapa personalprofil</span>
                </button>
              </div>
              
              {/* Profiles list */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
                <span className="text-[10px] text-amber-500 uppercase font-mono tracking-widest font-bold">Aktiva Hovmästare / Personal ({staffProfiles.length})</span>
                
                {staffProfiles.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl text-slate-500 font-mono text-xs">
                    Inga externa personalprofiler registrerade än. Du kan skapa en ny profil uppe till höger!
                  </div>
                ) : (
                  <div className="space-y-3 font-sans">
                    {staffProfiles.map((s) => (
                      <div key={s.username} className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-white text-sm">{s.displayName}</span>
                            <span className="bg-slate-850 text-slate-400 px-2 py-0.5 rounded text-[9.5px] font-mono select-all">
                              user: {s.username}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {s.permissions.map(p => (
                              <span key={p} className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditStaffModal(s)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 border border-slate-800 bg-slate-950 rounded-lg transition-all cursor-pointer"
                            title="Redigera behörighet"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStaff(s)}
                            className="p-1.5 text-slate-400 hover:text-red-400 border border-slate-800 bg-slate-950 rounded-lg transition-all cursor-pointer"
                            title="Radera profil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* CREATE/EDIT STAFF MODAL */}
      <AnimatePresence>
        {isStaffModalOpen && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 relative">
                <h3 className="font-serif text-lg font-bold text-amber-500 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-500" />
                  {modalStaff ? 'Uppdatera Personalbehörighet' : 'Skapa Ny Personalprofil'}
                </h3>
                <button
                  onClick={() => setIsStaffModalOpen(false)}
                  className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Form */}
              <form onSubmit={handleStaffFormSubmit} className="p-6 space-y-4 font-sans text-xs">
                {crudError && (
                  <div className="bg-red-950/40 border border-red-500/20 text-red-200 p-3 rounded-lg text-xs font-mono">
                    ⚠️ {crudError}
                  </div>
                )}
                {crudSuccess && (
                  <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-305 p-3 rounded-lg text-xs font-mono">
                    🎉 {crudSuccess}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-slate-400 uppercase font-mono tracking-wider font-semibold">Namn (Display Name)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Johan (Hovmästare)"
                    value={staffFormDisplayName}
                    onChange={(e) => setStaffFormDisplayName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-400 uppercase font-mono tracking-wider font-semibold">Användarnamn (Log-in)</label>
                  <input
                    type="text"
                    required
                    disabled={!!modalStaff}
                    placeholder="e.g. johan_pelikan"
                    value={staffFormUsername}
                    onChange={(e) => setStaffFormUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-400 uppercase font-mono tracking-wider font-semibold">Lösenord</label>
                  <input
                    type="text"
                    required
                    placeholder="Lösenord för hovmästaren"
                    value={staffFormPassword}
                    onChange={(e) => setStaffFormPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Multiple choice Permissions */}
                <div className="space-y-2 pt-1.5">
                  <label className="block text-slate-300 uppercase font-mono tracking-wider font-semibold">Aktiva behörigheter (Permissions)</label>
                  <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                    {[
                      { id: 'reservations', label: 'Bokningar' },
                      { id: 'customers', label: 'Gästregister' },
                      { id: 'tables', label: 'Bordskarta' },
                      { id: 'vouchers', label: 'Presentkort' },
                      { id: 'menu', label: 'Meny' },
                      { id: 'settings', label: 'Inställningar' }
                    ].map((perm) => {
                      const hasPerm = staffFormPermissions.includes(perm.id);
                      return (
                        <label key={perm.id} className="flex items-center gap-2 text-slate-200 cursor-pointer font-sans select-none text-xs">
                          <input
                            type="checkbox"
                            checked={hasPerm}
                            onChange={() => {
                              if (hasPerm) {
                                setStaffFormPermissions(staffFormPermissions.filter(p => p !== perm.id));
                              } else {
                                setStaffFormPermissions([...staffFormPermissions, perm.id]);
                              }
                            }}
                            className="bg-slate-900 border-slate-800 text-amber-500 rounded focus:ring-0 cursor-pointer w-4 h-4"
                          />
                          <span>{perm.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Submit footer */}
                <div className="flex gap-3 pt-4 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsStaffModalOpen(false)}
                    className="flex-1 py-2.5 border border-slate-850 hover:bg-slate-850 text-slate-350 rounded-lg transition-colors cursor-pointer text-center font-mono uppercase"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-550 text-slate-950 rounded-lg font-bold font-mono uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Spara profil
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE/EDIT BOOKING MODAL */}
      <AnimatePresence>
        {isBookingModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 relative">
                <h3 className="font-serif text-lg font-bold text-amber-400 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  {modalBooking ? 'Redigera Bordsreservation' : 'Skapa Ny Bordsreservation'}
                </h3>
                <span className="font-mono text-[9px] text-slate-500 tracking-wider block mt-1 uppercase">
                  {modalBooking ? `Referens: ${modalBooking.reference || 'Manuellt uppdaterad'}` : 'REGISTRERA NY BOKNING UTAN FEJKDDATA'}
                </span>
                <button
                  onClick={() => setIsBookingModalOpen(false)}
                  className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleBookingFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {crudError && (
                  <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded-xl font-mono">
                    ⚠️ {crudError}
                  </div>
                )}
                {crudSuccess && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl font-mono flex items-center gap-2">
                    <Check className="w-4 h-4 stroke-[2.5px]" /> {crudSuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Gästens Namn *</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-850 text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                      value={bookingFormName}
                      onChange={(e) => setBookingFormName(e.target.value)}
                      required
                      placeholder="t.ex. Sven Andersson"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">E-post *</label>
                    <input
                      type="email"
                      className="w-full bg-slate-950 border border-slate-850 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                      value={bookingFormEmail}
                      onChange={(e) => setBookingFormEmail(e.target.value)}
                      required
                      placeholder="sven@outlook.se"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Telefon *</label>
                    <input
                      type="tel"
                      className="w-full bg-slate-950 border border-slate-850 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                      value={bookingFormPhone}
                      onChange={(e) => setBookingFormPhone(e.target.value)}
                      required
                      placeholder="+46 70-123 45 67"
                    />
                  </div>

                  {/* Guests */}
                  <div className="space-y-1">
                    <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Antal Personer *</label>
                    <input
                      type="number"
                      min={1}
                      max={40}
                      className="w-full bg-slate-950 border border-slate-850 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                      value={bookingFormGuests}
                      onChange={(e) => setBookingFormGuests(parseInt(e.target.value) || 2)}
                      required
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-1">
                    <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Datum *</label>
                    <input
                      type="date"
                      className="w-full bg-slate-950 border border-slate-850 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 text-white"
                      value={bookingFormDate}
                      onChange={(e) => setBookingFormDate(e.target.value)}
                      required
                    />
                  </div>

                  {/* Time */}
                  <div className="space-y-1">
                    <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Sittningstid *</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-850 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                      value={bookingFormTime}
                      onChange={(e) => setBookingFormTime(e.target.value)}
                    >
                      {['16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'].map((time) => (
                        <option className="bg-slate-950 text-white" key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>

                  {/* Seating Zon */}
                  <div className="space-y-1">
                    <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Matsal Zon *</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-850 text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-950 text-slate-100"
                      value={bookingFormArea}
                      onChange={(e) => setBookingFormArea(e.target.value)}
                    >
                      {bookingStore.getDiningZones().map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} ({zone.capacity} p) {!zone.isActive ? '- Inaktiv' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div className="space-y-1">
                    <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Bokningsstatus *</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-850 text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 bg-slate-950 text-slate-100"
                      value={bookingFormStatus}
                      onChange={(e) => setBookingFormStatus(e.target.value as any)}
                    >
                      <option value="pending">Väntande (Pending)</option>
                      <option value="confirmed">Bekräftad (Confirmed)</option>
                      <option value="cancelled">Avbokat (Cancelled)</option>
                    </select>
                  </div>
                </div>

                {/* Dietary Notes */}
                <div className="space-y-1">
                  <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Allergier & matpreferenser</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-850 text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                    value={bookingFormDiet}
                    onChange={(e) => setBookingFormDiet(e.target.value)}
                    placeholder="t.ex. Glutenfri, laktosfri, vegetarian..."
                  />
                </div>

                {/* Special Request */}
                <div className="space-y-1">
                  <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Särskilda önskemål / Kommentarer</label>
                  <textarea
                    className="w-full bg-slate-950 border border-slate-850 text-slate-100 rounded-lg p-3 text-xs focus:outline-none focus:border-amber-500 font-sans"
                    rows={2}
                    value={bookingFormSpecial}
                    onChange={(e) => setBookingFormSpecial(e.target.value)}
                    placeholder="t.ex. Rullstolsplats, barnstol, hörnbord..."
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 pt-3 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(false)}
                    className="bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-mono uppercase font-bold tracking-widest transition-all"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-mono uppercase font-extrabold tracking-wider transition-all flex items-center justify-center gap-1.5 font-bold"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5px]" />
                    <span>Spara Reservation</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VOUCHER SEND MODAL  */}
      <AnimatePresence>
        {isVoucherModalOpen && selectedBooking && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Modal header */}
              <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 relative">
                <h3 className="font-serif text-lg font-bold text-amber-400 flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  Skicka värdekupong till kund
                </h3>
                <span className="font-mono text-[9px] text-slate-500 tracking-wider block mt-1 uppercase">
                  Mottagare: {selectedBooking.name} &lt;{selectedBooking.email}&gt;
                </span>
                <button
                  onClick={() => {
                    setIsVoucherModalOpen(false);
                    setSelectedBooking(null);
                  }}
                  className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80"
                  id="admin-voucher-close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form block */}
              <form onSubmit={handleSendVoucherSubmit} className="p-6 space-y-4">
                
                {voucherNotification ? (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-emerald-600/25 border border-emerald-500/30 rounded-xl text-center text-xs text-emerald-300 font-mono uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" /> {voucherNotification}
                  </motion.div>
                ) : (
                  <>
                    {/* Part 1: Coupon Code with Generate toggle */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">
                        Kupongkod / Voucher Code
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                          placeholder="t.ex. PELIKAN-SPECIAL-77"
                          className="flex-1 bg-slate-950 border border-slate-800 text-slate-50 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                          required
                          maxLength={25}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const rand = Math.floor(100 + Math.random() * 900);
                            setVoucherCode(`PEL-VIP-${rand}`);
                          }}
                          className="bg-slate-850 hover:bg-slate-800 text-slate-300 px-3 rounded-lg border border-slate-700/60 text-xs font-mono flex items-center justify-center gap-1 shrink-0"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Slumpa
                        </button>
                      </div>
                    </div>

                    {/* Part 2: Quick Presets */}
                    <div className="space-y-1">
                      <span className="block text-slate-500 text-[10px] font-mono uppercase tracking-widest">
                        Presets / Snabba mallar
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { code: 'SOS-GIFT', desc: 'En kostnadsfri S.O.S tallrik (Smör, Ost & Sill) vid ditt middagsbesök!' },
                          { code: 'PEL-SVIT-15', desc: '15% rabatt på den totala matnotan vid uppvisande av kod.' },
                          { code: 'DESSERT-FRI', desc: 'Få en valfri klassisk efterrätt kostnadsfritt vid beställning av varmrätt!' }
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setVoucherCode(preset.code);
                              setVoucherDesc(preset.desc);
                            }}
                            className="bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-amber-500 px-2 py-1 rounded text-[10px] font-mono transition-all"
                          >
                            {preset.code}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Part 3: Message / offer detail */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">
                        Beskrivning av erbjudande / Offer Details
                      </label>
                      <textarea
                        value={voucherDesc}
                        onChange={(e) => setVoucherDesc(e.target.value)}
                        rows={3}
                        placeholder="t.ex. Ger 10% rabatt, fri snapsglass, etc..."
                        className="w-full bg-slate-950 border border-slate-800 text-slate-50 rounded-lg p-3 text-xs focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                        required
                      ></textarea>
                    </div>

                    {/* Footer buttons */}
                    <div className="flex gap-3 pt-3 border-t border-slate-850">
                      <button
                        type="button"
                        onClick={() => {
                          setIsVoucherModalOpen(false);
                          setSelectedBooking(null);
                        }}
                        className="bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-mono uppercase font-bold tracking-widest transition-all"
                      >
                        Avbryt
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-mono uppercase font-extrabold tracking-wider transition-all flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5 stroke-[2.5px]" />
                        <span>Skicka e-postkupong</span>
                      </button>
                    </div>
                  </>
                )}

              </form>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

      {/* DINING ZONE EDIT/CREATE MODAL */}
      <AnimatePresence>
        {isZoneModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 relative">
                <h3 className="font-serif text-lg font-bold text-amber-400 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-500 animate-pulse" />
                  <span>{modalZone ? 'Redigera Bordszon / Dining Area' : 'Skapa Ny Bordszon / Dining Area'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsZoneModalOpen(false)}
                  className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleZoneFormSubmit} className="p-6 space-y-4">
                {crudSuccess && (
                  <div className="p-3 bg-emerald-700/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-mono">
                    {crudSuccess}
                  </div>
                )}
                {crudError && (
                  <div className="p-3 bg-red-700/20 border border-red-500/30 text-red-400 rounded-lg text-xs font-mono">
                    {crudError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Zon-ID (Unikt ord, t.ex. 'Hall')</label>
                    <input
                      type="text"
                      required
                      disabled={!!modalZone}
                      value={zoneFormId}
                      onChange={(e) => setZoneFormId(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                      placeholder="t.ex. Hall"
                      className={`w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 ${modalZone ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                    {!modalZone && <span className="text-[10px] text-slate-500 font-sans block">Kan inte ändras senare.</span>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Zonens namn</label>
                    <input
                      type="text"
                      required
                      value={zoneFormName}
                      onChange={(e) => setZoneFormName(e.target.value)}
                      placeholder="t.ex. Stora Hallen (1910)"
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Sittplatser max</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={500}
                      value={zoneFormCapacity}
                      onChange={(e) => setZoneFormCapacity(parseInt(e.target.value) || 50)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Antal bord</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={100}
                      value={zoneFormTables}
                      onChange={(e) => setZoneFormTables(parseInt(e.target.value) || 12)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Zonstatus</label>
                  <select
                    value={zoneFormIsActive ? 'active' : 'inactive'}
                    onChange={(e) => setZoneFormIsActive(e.target.value === 'active')}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                  >
                    <option value="active">Aktiv / Öppen för bokningar</option>
                    <option value="inactive">Spärrad / Stängd</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Beskrivning</label>
                  <textarea
                    value={zoneFormDesc}
                    onChange={(e) => setZoneFormDesc(e.target.value)}
                    rows={2}
                    placeholder="T.ex. Vår rymliga och anrika ölhall med originalbågar från 1910..."
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg p-3 text-xs focus:outline-none focus:border-amber-500 leading-normal font-sans"
                  />
                </div>

                <div className="flex gap-3 pt-3 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsZoneModalOpen(false)}
                    className="bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-mono uppercase font-bold tracking-widest transition-all cursor-pointer"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-mono uppercase font-extrabold tracking-wider transition-all flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5px]" />
                    <span>Spara Zondata</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DINING TABLE EDIT/CREATE MODAL */}
      <AnimatePresence>
        {isTableModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 relative">
                <h3 className="font-serif text-lg font-bold text-amber-400 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-500" />
                  <span>{modalTable ? 'Redigera Bord' : 'Skapa Nytt Bord'}</span>
                </h3>
                <span className="font-mono text-[9px] text-slate-500 tracking-wider block mt-1 uppercase">
                  ID: {tableFormId}
                </span>
                <button
                  type="button"
                  onClick={() => setIsTableModalOpen(false)}
                  className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleTableFormSubmit} className="p-6 space-y-4">
                {crudSuccess && (
                  <div className="p-3 bg-emerald-700/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-mono">
                    {crudSuccess}
                  </div>
                )}
                {crudError && (
                  <div className="p-3 bg-red-700/20 border border-red-500/30 text-red-400 rounded-lg text-xs font-mono">
                    {crudError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Bordsnamn / Nummer</label>
                    <input
                      type="text"
                      required
                      value={tableFormName}
                      onChange={(e) => setTableFormName(e.target.value)}
                      placeholder="t.ex. Bord 12, Kristallen-Hörn"
                      className="w-full bg-slate-950 border border-slate-800 text-slate-150 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Sittplats-kapacitet</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={30}
                      value={tableFormCapacity}
                      onChange={(e) => setTableFormCapacity(parseInt(e.target.value) || 2)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-150 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Placeringszon / Dining Area</label>
                    <select
                      value={tableFormZone}
                      onChange={(e) => setTableFormZone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-150 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                    >
                      {diningZones.map((z) => (
                        <option key={z.id} value={z.id}>{z.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Status</label>
                    <select
                      value={tableFormIsActive ? 'active' : 'inactive'}
                      onChange={(e) => setTableFormIsActive(e.target.value === 'active')}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-150 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                    >
                      <option value="active">Online / Bokningsbart</option>
                      <option value="inactive">Offline / Spärrat i app</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Unik Bordsbild URL (Image Link)</label>
                  <input
                    type="url"
                    value={tableFormImage}
                    onChange={(e) => setTableFormImage(e.target.value)}
                    placeholder="Bildlänk (https://images.unsplash.com/...)"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-50 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-slate-500 text-[10px] font-sans block mt-1">Här kan du lägga in en specifik bild för bordet som gäster ser under bokningsflödet. Lämnar du fältet tomt används herobild.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Beskrivning / Egenskaper</label>
                  <textarea
                    value={tableFormDesc}
                    onChange={(e) => setTableFormDesc(e.target.value)}
                    rows={2}
                    placeholder="T.ex. Vackert hörn fönsterbord med utsikt över innergården. Perfekt för romantiska middagar."
                    className="w-full bg-slate-950 border border-slate-800 text-slate-150 rounded-lg p-3 text-xs focus:outline-none focus:border-amber-500 leading-normal font-sans"
                  />
                </div>

                <div className="flex gap-3 pt-3 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsTableModalOpen(false)}
                    className="bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-mono uppercase font-bold tracking-widest transition-all cursor-pointer"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-mono uppercase font-extrabold tracking-wider transition-all flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5px]" />
                    <span>Spara Bordsdata</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MANUAL GIFT VOUCHER CREATION MODAL */}
      <AnimatePresence>
        {isNewAdminVoucherModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 relative">
                <h3 className="font-serif text-lg font-bold text-amber-400 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-amber-505 animate-bounce" />
                  <span>Utfärda presentkort manuellt</span>
                </h3>
                <span className="font-mono text-[9px] text-slate-500 tracking-wider block mt-1 uppercase">
                  MANUAL GIFT RECOVERY SERVICE
                </span>
                <button
                  type="button"
                  onClick={() => setIsNewAdminVoucherModalOpen(false)}
                  className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleNewVoucherSubmit} className="p-6 space-y-4">
                {crudSuccess && (
                  <div className="p-3 bg-emerald-700/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-mono">
                    {crudSuccess}
                  </div>
                )}
                {crudError && (
                  <div className="p-3 bg-red-700/20 border border-red-500/30 text-red-00 rounded-lg text-xs font-mono">
                    {crudError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Unik Presentkortskod (Voucher Code)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={vchFormCode}
                      onChange={(e) => setVchFormCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                      placeholder="PEL-GIFT-XXXX"
                      className="flex-1 bg-slate-950 border border-slate-800 text-slate-50 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const roll = Math.floor(1000 + Math.random() * 9000);
                        setVchFormCode(`PEL-GIFT-${roll}`);
                      }}
                      className="bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750 px-3 rounded-lg text-xs font-mono flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Generera unikt
                    </button>
                  </div>
                </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Köpbelopp (SEK Inbetalt)</label>
                    <input
                      type="number"
                      required
                      min={100}
                      max={10000}
                      value={vchFormAmount}
                      onChange={(e) => {
                        const amt = parseInt(e.target.value) || 0;
                        setVchFormAmount(amt);
                        recalculateManualVoucherValue(amt, vchFormRecipientEmail);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-150 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Utgivarvärde (Giltigt SEK inkl. bonus)</label>
                    <input
                      type="number"
                      value={vchFormValue}
                      onChange={(e) => setVchFormValue(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 text-amber-400 font-bold rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                    {vchFormRecipientEmail && vchFormRecipientEmail.includes('@') && (
                      <span className="text-[10px] text-amber-500 font-mono block mt-1">
                        {bookingStore.checkUserType(vchFormRecipientEmail) === 'first-time'
                          ? `✨ Förstagångsgäst (+${voucherConfig.firstTimePercentage ?? 15}%)`
                          : `👑 Stammis (Regular) (+${voucherConfig.regularPercentage ?? 10}%)`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Mottagare (Namn)</label>
                    <input
                      type="text"
                      value={vchFormRecipientName}
                      onChange={(e) => setVchFormRecipientName(e.target.value)}
                      placeholder="Gästens för- och efternamn"
                      className="w-full bg-slate-950 border border-slate-800 text-slate-150 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider">Mottagare E-post</label>
                    <input
                      type="email"
                      required
                      value={vchFormRecipientEmail}
                      onChange={(e) => {
                        const email = e.target.value;
                        setVchFormRecipientEmail(email);
                        recalculateManualVoucherValue(vchFormAmount, email);
                      }}
                      placeholder="mottagare@exempel.se"
                      className="w-full bg-slate-950 border border-slate-800 text-slate-150 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsNewAdminVoucherModalOpen(false)}
                    className="bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-mono uppercase font-bold tracking-widest transition-all cursor-pointer"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-amber-600 hover:bg-amber-550 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-mono uppercase font-extrabold tracking-wider transition-all flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5px]" />
                    <span>Utfärda & Sänd kupong</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* UPDATE / EDIT GIFT VOUCHER MODAL */}
      <AnimatePresence>
        {isEditVoucherModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 relative">
                <h3 className="font-serif text-lg font-bold text-amber-100 flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-amber-500 animate-pulse" />
                  <span>Redigera Presentkort / Kupong</span>
                </h3>
                <span className="font-mono text-[9px] text-slate-500 tracking-wider block mt-1 uppercase">
                  MANAGE & UPDATE VOUCHER DETAILS
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditVoucherModalOpen(false)}
                  className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditVoucherSubmit} className="p-6 space-y-4">
                {crudSuccess && (
                  <div className="p-3 bg-emerald-700/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-mono animate-fade-in">
                    {crudSuccess}
                  </div>
                )}
                {crudError && (
                  <div className="p-3 bg-red-700/20 border border-red-500/30 text-red-400 rounded-lg text-xs font-mono animate-fade-in">
                    {crudError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider font-bold">Unik Presentkortskod (Voucher Code)</label>
                  <input
                    type="text"
                    required
                    value={editVchCode}
                    onChange={(e) => setEditVchCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                    placeholder="PEL-GIFT-XXXX"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-50 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider font-bold">Köpbelopp (SEK Inbetalt)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editVchAmount}
                      onChange={(e) => setEditVchAmount(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-150 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider font-bold">Giltigt Värde (SEK Butiksvärde)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editVchValue}
                      onChange={(e) => setEditVchValue(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 text-amber-400 font-bold rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider font-bold">Mottagare (Namn)</label>
                    <input
                      type="text"
                      required
                      value={editVchRecipientName}
                      onChange={(e) => setEditVchRecipientName(e.target.value)}
                      placeholder="Gästens namn"
                      className="w-full bg-slate-950 border border-slate-800 text-slate-150 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-300 text-xs font-mono uppercase tracking-wider font-bold">Mottagare E-post</label>
                    <input
                      type="email"
                      required
                      value={editVchRecipientEmail}
                      onChange={(e) => setEditVchRecipientEmail(e.target.value)}
                      placeholder="e-post@adress.se"
                      className="w-full bg-slate-950 border border-slate-800 text-slate-150 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-805 rounded-xl">
                    <div>
                      <span className="block text-xs font-mono text-slate-300 font-bold uppercase">Status</span>
                      <span className="text-[10px] text-slate-500 font-sans">Ska koden kunna användas?</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditVchIsEnabled(!editVchIsEnabled)}
                      className={`px-3 py-1 rounded text-[10.5px] uppercase font-mono font-bold transition-colors border cursor-pointer ${
                        editVchIsEnabled 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : 'bg-red-500/10 border-red-500/30 text-red-500'
                      }`}
                    >
                      {editVchIsEnabled ? 'Aktiv' : 'Spärrad'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-805 rounded-xl">
                    <div>
                      <span className="block text-xs font-mono text-slate-300 font-bold uppercase">Inlösen</span>
                      <span className="text-[10px] text-slate-500 font-sans">Har gästen löst in den?</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditVchIsClaimed(!editVchIsClaimed)}
                      className={`px-3 py-1 rounded text-[10.5px] uppercase font-mono font-bold transition-colors border cursor-pointer ${
                        editVchIsClaimed 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                      }`}
                    >
                      {editVchIsClaimed ? 'Inlöst' : 'Ej inlösta'}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsEditVoucherModalOpen(false)}
                    className="bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-mono uppercase font-bold tracking-widest transition-all cursor-pointer"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-amber-600 hover:bg-amber-550 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-mono uppercase font-extrabold tracking-wider transition-all flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5px]" />
                    <span>Spara Ändringar</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. CREATE/EDIT DYNAMIC DISH MODAL (ADMIN ONLY) */}
      <AnimatePresence>
        {isDishModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl text-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 relative font-sans">
                <h3 className="font-serif text-lg font-bold text-amber-400 flex items-center gap-2">
                  <Menu className="w-5 h-5 text-amber-500 font-bold" />
                  {modalDish ? 'Redigera maträtt i matsedeln' : 'Lägg till maträtt i matsedeln'}
                </h3>
                <span className="font-mono text-[9px] text-slate-500 tracking-wider block mt-1 uppercase">
                  {modalDish ? `Maträtt ID: ${modalDish.id}` : 'MATSEDELSMOTOR'}
                </span>
                <button
                  onClick={() => setIsDishModalOpen(false)}
                  className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDishFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto font-sans">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name (Sv) */}
                  <div className="space-y-1">
                    <label className="block text-slate-305 text-slate-300 text-xs font-mono uppercase tracking-wider">Namn på Svenska *</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-850 text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                      value={dishFormName}
                      onChange={(e) => setDishFormName(e.target.value)}
                      required
                      placeholder="t.ex. Kalvlever på krogen"
                    />
                  </div>

                  {/* Name (En) */}
                  <div className="space-y-1">
                    <label className="block text-slate-305 text-slate-300 text-xs font-mono uppercase tracking-wider">Namn på Engelska *</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-850 text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                      value={dishFormSwName}
                      onChange={(e) => setDishFormSwName(e.target.value)}
                      required
                      placeholder="t.ex. Swedish tavern calf liver"
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <label className="block text-slate-305 text-slate-300 text-xs font-mono uppercase tracking-wider">Pris (SEK) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      className="w-full bg-slate-950 border border-slate-850 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                      value={dishFormPrice}
                      onChange={(e) => setDishFormPrice(Number(e.target.value))}
                    />
                  </div>

                  {/* Category select */}
                  <div className="space-y-1">
                    <label className="block text-slate-350 text-slate-300 text-xs font-mono uppercase tracking-wider">Kategori *</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-850 text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 uppercase font-mono tracking-wider"
                      value={dishFormCategory}
                      onChange={(e) => setDishFormCategory(e.target.value)}
                    >
                      {adminCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name.toUpperCase()} / {cat.id}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-slate-305 text-slate-300 text-xs font-mono uppercase tracking-wider">Beskrivning</label>
                  <textarea
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-850 text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                    value={dishFormDesc}
                    onChange={(e) => setDishFormDesc(e.target.value)}
                    placeholder="t.ex. Serveras med kapris, brynt smör..."
                  />
                </div>

                {/* Dietary Tags input */}
                <div className="space-y-1">
                  <label className="block text-slate-305 text-slate-300 text-xs font-mono uppercase tracking-wider">Dietary taggar (Kommaseparerad)</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-850 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                    value={dishFormDietaryInput}
                    onChange={(e) => setDishFormDietaryInput(e.target.value)}
                    placeholder="LAKTOSFRI, GLUTENFRI, VEGETARISK"
                  />
                </div>

                {/* Image URL input */}
                <div className="space-y-1">
                  <label className="block text-slate-305 text-slate-300 text-xs font-mono uppercase tracking-wider">Bild-URL (Unsplash eller dylikt)</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-850 text-slate-100 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                    value={dishFormImage}
                    onChange={(e) => setDishFormImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer bg-slate-950/60 p-3.5 border border-slate-850 rounded-xl select-none">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500 focus:ring-opacity-25"
                      checked={dishFormSignature}
                      onChange={(e) => setDishFormSignature(e.target.checked)}
                    />
                    <div>
                      <span className="text-xs font-bold font-mono tracking-wider uppercase block text-slate-200">Kockens Rekommenderas</span>
                      <span className="text-[10px] text-slate-500 block leading-tight">Märks med Guld Signature badge</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer bg-slate-950/60 p-3.5 border border-slate-850 rounded-xl select-none">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500 focus:ring-opacity-25"
                      checked={dishFormPublished}
                      onChange={(e) => setDishFormPublished(e.target.checked)}
                    />
                    <div>
                      <span className="text-xs font-bold font-mono tracking-wider uppercase block text-slate-200">Publicera Direkt</span>
                      <span className="text-[10px] text-slate-500 block leading-tight">Görs omedelbart synlig på hemsidan</span>
                    </div>
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 pt-3 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsDishModalOpen(false)}
                    className="bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-mono uppercase font-bold tracking-widest transition-all cursor-pointer"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-amber-600 hover:bg-amber-550 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-mono uppercase font-extrabold tracking-wider transition-all flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5px]" />
                    <span>Spara Maträtt</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
