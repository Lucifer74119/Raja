import { BookingDetails, DiningAreaZone, DiningTable, GiftVoucherConfig, AdminVoucher, StripeConfig, StripeTransaction, MenuItem, StaffProfile, StaffLog, VoucherBuyingOption, Customer } from '../types';
import { MENU_ITEMS } from '../data/restaurantData';

export const cookieHelper = {
  set(name: string, value: string, days: number = 7) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  },
  get(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : null;
  },
  delete(name: string) {
    this.set(name, '', -1);
  }
};

export interface EmailMessage {
  id: string;
  to: string;
  from: string;
  subject: string;
  body: string;
  sentAt: string;
  type: 'booking_confirm' | 'voucher' | 'admin_notify' | 'incoming' | 'general_reply';
  bookingId?: string;
  voucherCode?: string;
}

export interface AdminEmailProfile {
  displayName: string;
  emailAddress: string;
  smtpHost: string;
  smtpPort: number;
  useSsl: boolean;
  status: 'connected' | 'disconnected';
  lastChecked?: string;
  smtpUsername?: string;
  smtpPassword?: string;
  position?: string;
  phone?: string;
  accessLevel?: string;
}

// Initial bookings and emails are completely empty by default to ensure only real data is shown!
const INITIAL_BOOKINGS: BookingDetails[] = [];
const INITIAL_EMAILS: EmailMessage[] = [];

const DEFAULT_PROFILE: AdminEmailProfile = {
  displayName: 'Raja',
  emailAddress: 'MS_n0wzy3@test-zkq340e30vxgd796.mlsender.net',
  smtpHost: 'smtp.mailersend.net',
  smtpPort: 587,
  useSsl: false,
  status: 'connected',
  lastChecked: new Date().toISOString(),
  smtpUsername: 'MS_n0wzy3@test-zkq340e30vxgd796.mlsender.net',
  smtpPassword: 'mssp.mpCe5Nm.k68zxl2n363lj905.2qhDHTn',
  position: 'Hovmästare / Restaurant Manager',
  phone: '+46 (0)8 556 413 10',
  accessLevel: 'Super Administrator'
};

export const bookingStore = {
  // Get and set custom Admin Email Profile settings
  getAdminProfile(): AdminEmailProfile {
    const data = localStorage.getItem('pelikan_admin_profile');
    if (!data) {
      localStorage.setItem('pelikan_admin_profile', JSON.stringify(DEFAULT_PROFILE));
      return DEFAULT_PROFILE;
    }
    try {
      const parsed = JSON.parse(data);
      // Automatically migrate if using mock defaults to allow Raja's credentials to load flawlessly!
      if (parsed.smtpHost === 'smtp.pelikan.se' || parsed.emailAddress === 'hovmastare@pelikan.se') {
        localStorage.setItem('pelikan_admin_profile', JSON.stringify(DEFAULT_PROFILE));
        return DEFAULT_PROFILE;
      }
      return parsed;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveAdminProfile(profile: AdminEmailProfile): void {
    localStorage.setItem('pelikan_admin_profile', JSON.stringify(profile));
  },

  // Get all bookings from localStorage or load empty
  getBookings(): BookingDetails[] {
    const list = localStorage.getItem('pelikan_bookings');
    if (!list) {
      localStorage.setItem('pelikan_bookings', JSON.stringify(INITIAL_BOOKINGS));
      return INITIAL_BOOKINGS;
    }
    try {
      return JSON.parse(list);
    } catch {
      return INITIAL_BOOKINGS;
    }
  },

  // Save the complete bookings list
  saveBookings(bookings: BookingDetails[]): void {
    localStorage.setItem('pelikan_bookings', JSON.stringify(bookings));
  },

  // Create a new booking
  addBooking(booking: BookingDetails): BookingDetails {
    const bookings = this.getBookings();
    const newBooking: BookingDetails = {
      ...booking,
      id: booking.id || `BK-${Math.floor(100 + Math.random() * 900)}`,
      status: booking.status || 'pending',
      createdAt: new Date().toISOString()
    };
    bookings.unshift(newBooking);
    this.saveBookings(bookings);

    const profile = this.getAdminProfile();

    const confirmationEmailBody = `Hej ${newBooking.name},

Tack för din bordsreservation på Krog Pelikan! 

Här är dina bokningsdetaljer:
• Referensnummer: ${newBooking.reference}
• Gällande datum: ${newBooking.date}
• Tid: Kl. ${newBooking.time}
• Antal gäster: ${newBooking.guests} personer
• Avdelning: ${newBooking.area === 'Hall' ? 'Stora Hallen (1910)' : newBooking.area === 'Kristallen' ? 'Kristallen bar' : 'Pelikan Terrassen'}
${newBooking.dietaryNotes ? `• Allergier: ${newBooking.dietaryNotes}\n` : ''}${newBooking.specialNotes ? `• Särskilda önskemål: ${newBooking.specialNotes}\n` : ''}
Sittningstiden är 2.5 timmar. Om ni blir försenade eller önskar ändra er bokning, ring oss på +46 (0)8 556 413 10 eller svara direkt på detta e-postmeddelande.

Varmt välkomna till en anrik kväll hos oss!
Krog Pelikan, Stockholm`;

    // Automatically trigger Booking Confirmation Email simulation from custom admin email
    this.addEmail({
      to: newBooking.email,
      from: `${profile.displayName} <${profile.emailAddress}>`,
      subject: `Bokningsbekräftelse: Krog Pelikan (Ref: ${newBooking.reference})`,
      body: `Hej ${newBooking.name},

Tack för din bordsreservation på Krog Pelikan! 

Här är dina bokningsdetaljer:
• Referensnummer: ${newBooking.reference}
• Gällande datum: ${newBooking.date}
• Tid: Kl. ${newBooking.time}
• Antal gäster: ${newBooking.guests} personer
• Avdelning: ${newBooking.area === 'Hall' ? 'Stora Hallen (1910)' : newBooking.area === 'Kristallen' ? 'Kristallen bar' : 'Pelikan Terrassen'}
${newBooking.dietaryNotes ? `• Allergier: ${newBooking.dietaryNotes}\n` : ''}${newBooking.specialNotes ? `• Särskilda önskemål: ${newBooking.specialNotes}\n` : ''}
Sittningstiden är 2.5 timmar. Om ni blir försenade eller önskar ändra er bokning, ring oss på +46 (0)8 556 413 10 eller svara direkt på detta e-postmeddelande.

Varmt välkomna till en anrik kväll hos oss!
Krog Pelikan, Stockholm`,
      type: 'booking_confirm',
      bookingId: newBooking.id
    });

    // Notify administrators as well
    this.addEmail({
      to: profile.emailAddress,
      from: 'system@pelikan.se',
      subject: `[NY BOKNING] ${newBooking.name} (${newBooking.guests} p) - ${newBooking.date}`,
      body: `Ny onlinebokning från hemsidan:
      
• Kund: ${newBooking.name}
• Epost: ${newBooking.email}
• Telefon: ${newBooking.phone}
• Gäster: ${newBooking.guests} st
• Datum: ${newBooking.date}
• Tid: ${newBooking.time}
• Avdelning: ${newBooking.area}
• Meddelande: ${newBooking.specialNotes || 'Inga'}

Hantera bokningen i adminpanelen!`,
      type: 'admin_notify',
      bookingId: newBooking.id
    });

    try {
      this.triggerRealSmtpEmail({
        to: newBooking.email,
        subject: `Bokningsbekräftelse: Krog Pelikan (Ref: ${newBooking.reference})`,
        body: confirmationEmailBody,
        emailType: 'reservation',
        reservationDetails: {
          name: newBooking.name,
          date: newBooking.date,
          time: newBooking.time,
          area: newBooking.area === 'Hall' ? 'Stora Hallen (1910)' : newBooking.area === 'Kristallen' ? 'Kristallen Bar' : 'Pelikan Terrassen',
          guests: newBooking.guests,
          reference: newBooking.reference,
          status: newBooking.status,
          specialNotes: (newBooking.dietaryNotes ? `Allergier: ${newBooking.dietaryNotes}. ` : "") + (newBooking.specialNotes || "")
        }
      });
    } catch (err) {
      console.warn("SMTP send failed on booking", err);
    }

    return newBooking;
  },

  updateBooking(updatedBooking: BookingDetails): BookingDetails | null {
    const bookings = this.getBookings();
    const idx = bookings.findIndex(b => b.id === updatedBooking.id);
    if (idx === -1) return null;

    bookings[idx] = {
      ...bookings[idx],
      ...updatedBooking
    };
    this.saveBookings(bookings);
    return bookings[idx];
  },

  // Update a booking status
  updateBookingStatus(id: string, status: 'confirmed' | 'cancelled' | 'pending'): BookingDetails | null {
    const bookings = this.getBookings();
    const idx = bookings.findIndex(b => b.id === id);
    if (idx === -1) return null;

    bookings[idx].status = status;
    this.saveBookings(bookings);

    // Send a status change email notification
    const b = bookings[idx];
    const profile = this.getAdminProfile();

    if (status === 'confirmed') {
      this.addEmail({
        to: b.email,
        from: `${profile.displayName} <${profile.emailAddress}>`,
        subject: `Bekräftad bokning: Krog Pelikan (Ref: ${b.reference})`,
        body: `Hej ${b.name},

Glada nyheter! Din bordsreservation hos oss på Krog Pelikan är nu officiellt BEKRÄFTAD av hovmästaren.

• Referens: ${b.reference}
• Datum: ${b.date}
• Tid: ${b.time}
• Gäster: ${b.guests} personer

Vi har förberett ett trevligt bord till er i ${b.area === 'Hall' ? 'Stora Hallen (1910)' : b.area === 'Kristallen' ? 'Kristallen Bar' : 'Terrassen'}.

Varmt välkomna till oss!
Hovmästaren, Krog Pelikan`,
        type: 'booking_confirm',
        bookingId: b.id
      });
    } else if (status === 'cancelled') {
      this.addEmail({
        to: b.email,
        from: `${profile.displayName} <${profile.emailAddress}>`,
        subject: `Avbokad reservation: Krog Pelikan (Ref: ${b.reference})`,
        body: `Hej ${b.name},

Detta meddelande bekräftar att din bordsreservation med referensnummer ${b.reference} för den ${b.date} tyvärr har blivit avbokad.

Om detta var ett misstag, är du varmt välkommen att göra en ny bokning via vår hemsida eller kontakta oss på telefon.

Hoppas vi får chansen att välkomna dig en annan gång!
Krog Pelikan, Stockholm`,
        type: 'booking_confirm',
        bookingId: b.id
      });
    }

    try {
      if (status === 'confirmed') {
        const confirmedEmailBody = `Hej ${b.name},

Glada nyheter! Din bordsreservation hos oss på Krog Pelikan är nu officiellt BEKRÄFTAD av hovmästaren.

• Referens: ${b.reference}
• Datum: ${b.date}
• Tid: ${b.time}
• Gäster: ${b.guests} personer

Vi har förberett ett trevligt bord till er i ${b.area === 'Hall' ? 'Stora Hallen (1910)' : b.area === 'Kristallen' ? 'Kristallen Bar' : 'Terrassen'}.

Varmt välkomna till oss!
Hovmästaren, Krog Pelikan`;

        this.triggerRealSmtpEmail({
          to: b.email,
          subject: `Bekräftad bokning: Krog Pelikan (Ref: ${b.reference})`,
          body: confirmedEmailBody,
          emailType: 'reservation',
          reservationDetails: {
            name: b.name,
            date: b.date,
            time: b.time,
            area: b.area === 'Hall' ? 'Stora Hallen (1910)' : b.area === 'Kristallen' ? 'Kristallen Bar' : 'Terrassen',
            guests: b.guests,
            reference: b.reference,
            status: 'confirmed',
            specialNotes: b.specialNotes
          }
        });
      } else if (status === 'cancelled') {
        const cancelledEmailBody = `Hej ${b.name},

Detta meddelande bekräftar att din bordsreservation med referensnummer ${b.reference} för den ${b.date} tyvärr har blivit avbokad.

Om detta var ett misstag, är du varmt välkommen att göra en ny bokning via vår hemsida eller kontakta oss på telefon.

Hoppas vi får chansen att välkomna dig en annan gång!
Krog Pelikan, Stockholm`;

        this.triggerRealSmtpEmail({
          to: b.email,
          subject: `Avbokad reservation: Krog Pelikan (Ref: ${b.reference})`,
          body: cancelledEmailBody,
          emailType: 'reservation',
          reservationDetails: {
            name: b.name,
            date: b.date,
            time: b.time,
            area: b.area === 'Hall' ? 'Stora Hallen (1910)' : b.area === 'Kristallen' ? 'Kristallen Bar' : 'Terrassen',
            guests: b.guests,
            reference: b.reference,
            status: 'cancelled',
            specialNotes: b.specialNotes
          }
        });
      }
    } catch (err) {
      console.warn("Real status change SMTP fail", err);
    }

    return b;
  },

  // Delete a booking entirely
  deleteBooking(id: string): void {
    const bookings = this.getBookings();
    const filtered = bookings.filter(b => b.id !== id);
    this.saveBookings(filtered);
  },

  // Get simulated emails from localStorage
  getEmails(): EmailMessage[] {
    const list = localStorage.getItem('pelikan_emails');
    if (!list) {
      localStorage.setItem('pelikan_emails', JSON.stringify(INITIAL_EMAILS));
      return INITIAL_EMAILS;
    }
    try {
      return JSON.parse(list);
    } catch {
      return INITIAL_EMAILS;
    }
  },

  // Save emails list
  saveEmails(emails: EmailMessage[]): void {
    localStorage.setItem('pelikan_emails', JSON.stringify(emails));
  },

  // Store new sent / received email
  addEmail(email: Omit<EmailMessage, 'id' | 'sentAt'>): EmailMessage {
    const emails = this.getEmails();
    const newEmail: EmailMessage = {
      ...email,
      id: `EM-${Math.floor(1000 + Math.random() * 9000)}`,
      sentAt: new Date().toISOString()
    };
    emails.unshift(newEmail);
    this.saveEmails(emails);
    return newEmail;
  },

  // Trigger voucher send via email
  sendVoucherEmail(bookingId: string, voucherCode: string, valueDescription: string): { success: boolean; email?: EmailMessage } {
    const bookings = this.getBookings();
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx === -1) return { success: false };

    const booking = bookings[idx];
    if (!booking.vouchersSent) {
      booking.vouchersSent = [];
    }
    booking.vouchersSent.push(voucherCode);
    this.saveBookings(bookings);

    const profile = this.getAdminProfile();

    // Create a beautiful coupon style email!
    const emailBody = `Hej ${booking.name},

Som tack för din reservation på Krog Pelikan och för att förgylla ditt besök vill vi härmed erbjuda dig ett exklusivt värdebevis!

DITT GÅVOKORT / VOUCHER CODE:
★ ★ ★ ${voucherCode.toUpperCase()} ★ ★ ★

Erbjudande: ${valueDescription}
Giltighet: Gäller vid uppvisande i samband med din inbokade middag den ${booking.date}.

Hur du löser in din kod:
Uppge koden "${voucherCode}" för din servitör när ni beställer, så drar vi av beloppet på er nota. Koden är personlig och bunden till din bokning.

Vi ser oerhört mycket fram emot att servera dig enastående svensk husmanskost!

Med varma hälsningar,
Restauratörerna på Krog Pelikan, Stockholm
Blekingegatan 40, Södermalm`;

    const e = this.addEmail({
      to: booking.email,
      from: `${profile.displayName} <${profile.emailAddress}>`,
      subject: `Gåva inför ditt besök! Din exklusiva kupongkod: ${voucherCode.toUpperCase()}`,
      body: emailBody,
      type: 'voucher',
      bookingId: booking.id,
      voucherCode: voucherCode
    });

    return { success: true, email: e };
  },

  // Get all dining zones from localStorage
  getDiningZones(): DiningAreaZone[] {
    const list = localStorage.getItem('pelikan_dining_zones');
    const DEFAULT_ZONES: DiningAreaZone[] = [
      { id: 'Hall', name: 'Stora Hallen', desc: 'Arched Beer Hall (1910)', capacity: 120, tableCount: 30, isActive: true },
      { id: 'Kristallen', name: 'Kristallen', desc: 'Cozy Chandelier Bar', capacity: 40, tableCount: 15, isActive: true },
      { id: 'Outdoor', name: 'Terrassen', desc: 'Blekingegatan Patio', capacity: 60, tableCount: 20, isActive: true }
    ];
    if (!list) {
      localStorage.setItem('pelikan_dining_zones', JSON.stringify(DEFAULT_ZONES));
      return DEFAULT_ZONES;
    }
    try {
      return JSON.parse(list);
    } catch {
      return DEFAULT_ZONES;
    }
  },

  // Save dining zones
  saveDiningZones(zones: DiningAreaZone[]): void {
    localStorage.setItem('pelikan_dining_zones', JSON.stringify(zones));
  },

  // Add a zone
  addDiningZone(zone: DiningAreaZone): DiningAreaZone {
    const zones = this.getDiningZones();
    zones.push(zone);
    this.saveDiningZones(zones);
    return zone;
  },

  // Update a zone
  updateDiningZone(updatedZone: DiningAreaZone): DiningAreaZone | null {
    const zones = this.getDiningZones();
    const idx = zones.findIndex(z => z.id === updatedZone.id);
    if (idx === -1) return null;
    zones[idx] = updatedZone;
    this.saveDiningZones(zones);
    return updatedZone;
  },

  // Delete a zone
  deleteDiningZone(id: string): void {
    const zones = this.getDiningZones();
    const filtered = zones.filter(z => z.id !== id);
    this.saveDiningZones(filtered);
  },

  // Get all dining tables
  getDiningTables(): DiningTable[] {
    const list = localStorage.getItem('pelikan_dining_tables');
    const DEFAULT_TABLES: DiningTable[] = [
      { id: 'T101', tableName: 'Bord 101 (Fönster)', zoneId: 'Hall', capacity: 4, description: 'Cozy traditional table next to the large windows overlooking Götgatan.', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80', isActive: true },
      { id: 'T102', tableName: 'Bord 102 (Hallen)', zoneId: 'Hall', capacity: 2, description: 'Intimate table for two near the grand arched pillar.', imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80', isActive: true },
      { id: 'T103', tableName: 'Bord 103 (Stor)', zoneId: 'Hall', capacity: 8, description: 'Large central wooden table perfect for family gatherings.', imageUrl: 'https://images.unsplash.com/photo-1544015759-11246944e7c0?auto=format&fit=crop&w=600&q=80', isActive: true },
      { id: 'T201', tableName: 'Bord 201 (Hörn)', zoneId: 'Kristallen', capacity: 2, description: 'Quiet corner table under the crystals.', imageUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=600&q=80', isActive: true },
      { id: 'T202', tableName: 'Bord 202 (Krona)', zoneId: 'Kristallen', capacity: 4, description: 'Directly beneath the vintage Swedish lead crystal.', imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80', isActive: true },
      { id: 'T301', tableName: 'Bord 301 (Terrass)', zoneId: 'Outdoor', capacity: 4, description: 'Pergola shaded patio seating under the Södermalm afternoon sun.', imageUrl: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=600&q=80', isActive: true },
      { id: 'T302', tableName: 'Bord 302 (Altan)', zoneId: 'Outdoor', capacity: 2, description: 'Cozy street-side terrace view with heating elements and blankets.', imageUrl: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=600&q=80', isActive: true }
    ];
    if (!list) {
      localStorage.setItem('pelikan_dining_tables', JSON.stringify(DEFAULT_TABLES));
      return DEFAULT_TABLES;
    }
    try {
      return JSON.parse(list);
    } catch {
      return DEFAULT_TABLES;
    }
  },

  saveDiningTables(tables: DiningTable[]): void {
    localStorage.setItem('pelikan_dining_tables', JSON.stringify(tables));
  },

  addDiningTable(table: DiningTable): DiningTable {
    const list = this.getDiningTables();
    list.push(table);
    this.saveDiningTables(list);
    return table;
  },

  updateDiningTable(updatedTable: DiningTable): DiningTable | null {
    const list = this.getDiningTables();
    const idx = list.findIndex(t => t.id === updatedTable.id);
    if (idx === -1) return null;
    list[idx] = updatedTable;
    this.saveDiningTables(list);
    return updatedTable;
  },

  deleteDiningTable(id: string): void {
    const list = this.getDiningTables();
    const filtered = list.filter(t => t.id !== id);
    this.saveDiningTables(filtered);
  },

  // Gift Voucher Globals & Configuration
  getGiftVoucherConfig(): GiftVoucherConfig {
    const saved = localStorage.getItem('pelikan_voucher_config');
    const DEFAULT_CONFIG: GiftVoucherConfig = {
      defaultPercentage: 10,
      isEnabled: true,
      firstTimePercentage: 15,
      regularPercentage: 5,
      firstTimeAutoSendEnabled: true,
      firstTimeAutoSendAmount: 250,
      claimTasks: [
        'Skapa ett gästkonto på Krog Pelikans hemsida',
        'Sök efter tillgängliga presentkoder eller välkomstgåvor i din e-postlogg',
        'Koppla värdekoden i Kundportalen för att lösa in och spåra dess saldo',
        'Boka bord och uppge din aktiva presentkod i rutan för särskilda önskemål'
      ]
    };
    if (!saved) {
      localStorage.setItem('pelikan_voucher_config', JSON.stringify(DEFAULT_CONFIG));
      return DEFAULT_CONFIG;
    }
    try {
      const config = JSON.parse(saved);
      return {
        ...DEFAULT_CONFIG,
        ...config
      };
    } catch {
      return DEFAULT_CONFIG;
    }
  },

  saveGiftVoucherConfig(config: GiftVoucherConfig): void {
    localStorage.setItem('pelikan_voucher_config', JSON.stringify(config));
  },

  // Custom persistent Vouchers Studio items
  getVouchers(): AdminVoucher[] {
    const saved = localStorage.getItem('pelikan_admin_vouchers');
    const DEFAULT_VOUCHERS: AdminVoucher[] = [
      { id: 'V1', code: 'PELIKAN20', amount: 500, value: 550, recipientEmail: 'johan@domain.se', recipientName: 'Johan Silfver', createdAt: new Date().toISOString(), isEnabled: true },
      { id: 'V2', code: 'SÖDERMALM', amount: 1000, value: 1100, recipientEmail: 'elin@domain.se', recipientName: 'Elin Bergman', createdAt: new Date().toISOString(), isEnabled: true }
    ];
    if (!saved) {
      localStorage.setItem('pelikan_admin_vouchers', JSON.stringify(DEFAULT_VOUCHERS));
      return DEFAULT_VOUCHERS;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return DEFAULT_VOUCHERS;
    }
  },

  saveVouchers(vouchers: AdminVoucher[]): void {
    localStorage.setItem('pelikan_admin_vouchers', JSON.stringify(vouchers));
  },

  addVoucher(voucher: AdminVoucher): AdminVoucher {
    const list = this.getVouchers();
    list.push(voucher);
    this.saveVouchers(list);
    return voucher;
  },

  updateVoucher(updated: AdminVoucher): AdminVoucher | null {
    const list = this.getVouchers();
    const idx = list.findIndex(v => v.id === updated.id);
    if (idx === -1) return null;
    list[idx] = updated;
    this.saveVouchers(list);
    return updated;
  },

  deleteVoucher(id: string): void {
    const list = this.getVouchers();
    const filtered = list.filter(v => v.id !== id);
    this.saveVouchers(filtered);
  },

  getStripeConfig(): StripeConfig {
    const saved = localStorage.getItem('pelikan_stripe_config');
    const DEFAULT_STRIPE_CONFIG: StripeConfig = {
      publishableKey: '',
      secretKey: ''
    };
    if (!saved) {
      localStorage.setItem('pelikan_stripe_config', JSON.stringify(DEFAULT_STRIPE_CONFIG));
      return DEFAULT_STRIPE_CONFIG;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return DEFAULT_STRIPE_CONFIG;
    }
  },

  saveStripeConfig(config: StripeConfig): void {
    localStorage.setItem('pelikan_stripe_config', JSON.stringify(config));
  },

  getTransactions(): StripeTransaction[] {
    const saved = localStorage.getItem('pelikan_transactions');
    if (!saved) {
      const defaultTx: StripeTransaction[] = [
        {
          id: 'ch_3OpPliIm3Qv8bE9q1N6gT9h2',
          voucherCode: 'PELIKAN20',
          amount: 500,
          currency: 'SEK',
          recipientName: 'Johan Silfver',
          recipientEmail: 'johan@domain.se',
          senderName: 'Lachlan Silfver',
          senderEmail: 'lachlan@exempel.se',
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          status: 'succeeded'
        },
        {
          id: 'ch_3OpPliIm3Qv8bE9q5G7bV3d4',
          voucherCode: 'SÖDERMALM',
          amount: 1000,
          currency: 'SEK',
          recipientName: 'Elin Bergman',
          recipientEmail: 'elin@domain.se',
          senderName: 'Aron Bergman',
          senderEmail: 'aron@domain.se',
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          status: 'succeeded'
        }
      ];
      localStorage.setItem('pelikan_transactions', JSON.stringify(defaultTx));
      return defaultTx;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  },

  addTransaction(tx: StripeTransaction): void {
    const list = this.getTransactions();
    list.unshift(tx);
    localStorage.setItem('pelikan_transactions', JSON.stringify(list));
  },

  async triggerRealSmtpEmail(payload: {
    to: string;
    subject: string;
    body: string;
    emailType?: string;
    voucherDetails?: any;
    reservationDetails?: any;
  }): Promise<any> {
    const adminProfile = this.getAdminProfile();
    try {
      const response = await fetch('/api/smtp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: payload.to,
          subject: payload.subject,
          body: payload.body,
          emailType: payload.emailType,
          voucherDetails: payload.voucherDetails,
          reservationDetails: payload.reservationDetails,
          fromName: adminProfile.displayName,
          fromEmail: adminProfile.emailAddress,
          smtpHost: adminProfile.smtpHost,
          smtpPort: adminProfile.smtpPort,
          smtpUsername: adminProfile.smtpUsername,
          smtpPassword: adminProfile.smtpPassword,
          useSsl: adminProfile.useSsl
        })
      });
      return await response.json();
    } catch (err) {
      console.warn("Real SMTP deliver error:", err);
      return { success: false, error: err };
    }
  },

  // --- MENU MANAGEMENT ---
  getMenuCategories(): { id: string; name: string; swedishName: string; description?: string }[] {
    const saved = localStorage.getItem('pelikan_menu_categories');
    const DEFAULT_CATEGORIES = [
      { id: 'starters', name: 'Förrätter', swedishName: 'Starters', description: 'Traditional Swedish appetizers' },
      { id: 'mains', name: 'Varmrätter', swedishName: 'Mains', description: 'Massive iconic mains' },
      { id: 'desserts', name: 'Efterrätter', swedishName: 'Desserts', description: 'Ardent sweet finishes' },
      { id: 'drinks', name: 'Dryck', swedishName: 'Snaps & Beer / Drinks', description: 'Akvavit and craft brew pilsner' }
    ];
    if (!saved) {
      localStorage.setItem('pelikan_menu_categories', JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  saveMenuCategories(categories: any[]): void {
    localStorage.setItem('pelikan_menu_categories', JSON.stringify(categories));
  },

  getMenuItems(): MenuItem[] {
    const saved = localStorage.getItem('pelikan_menu_items');
    if (!saved) {
      // Lazy load standard MENU_ITEMS from restaurantData
      const items = MENU_ITEMS.map(item => ({ ...item, published: true }));
      localStorage.setItem('pelikan_menu_items', JSON.stringify(items));
      return items;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return MENU_ITEMS.map(item => ({ ...item, published: true }));
    }
  },

  saveMenuItems(items: MenuItem[]): void {
    localStorage.setItem('pelikan_menu_items', JSON.stringify(items));
  },

  // --- OTP AUTHENTICATION & LOGIN ---
  generateOtpForEmail(email: string): string {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Save generated OTP to localStorage to allow verification
    const otps = JSON.parse(localStorage.getItem('pelikan_login_otps') || '{}');
    otps[email.toLowerCase()] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes expiry
    };
    localStorage.setItem('pelikan_login_otps', JSON.stringify(otps));

    // Also store as simulated system email to log
    const profile = this.getAdminProfile();
    this.addEmail({
      to: email,
      from: 'system@pelikan.se',
      subject: `Krog Pelikan - Din engångskod (OTP) för inloggning`,
      body: `Hej!

Du har begärt att logga in på "Mitt Pelikan" hovmästarportal för gäster.

Din engångskod (OTP) är:
${otp}

Denna kod är giltig i 10 minuter. Ange koden på hemsidan för att slutföra din inloggning.

Om det inte var du som begärde denna kod kan du bortse från detta e-postmeddelande.

Vänliga hälsningar,
Krog Pelikan, Stockholm`,
      type: 'admin_notify'
    });

    // Attempt real SMTP mail dispatch
    try {
      this.triggerRealSmtpEmail({
        to: email,
        subject: `Krog Pelikan - Din engångskod (OTP) för inloggning`,
        body: `Hej!

Du har begärt att logga in på "Mitt Pelikan" hovmästarportal för gäster.

Din engångskod (OTP) är:
${otp}

Denna kod är giltig i 10 minuter. Ange koden på hemsidan för att slutföra din inloggning.

Om det inte var du som begärde denna kod kan du bortse från detta e-postmeddelande.

Vänliga hälsningar,
Krog Pelikan, Stockholm`
      });
    } catch (err) {
      console.warn("SMTP OTP email send failed", err);
    }

    return otp;
  },

  isCustomerBlocked(email: string): boolean {
    const list = localStorage.getItem('pelikan_manual_customers');
    if (!list) return false;
    try {
      const customers = JSON.parse(list);
      const emailLower = email.toLowerCase().trim();
      const match = customers.find((c: any) => c.email.toLowerCase().trim() === emailLower);
      return match ? !!match.isBlocked : false;
    } catch {
      return false;
    }
  },

  verifyOtp(email: string, otpInput: string): boolean {
    if (this.isCustomerBlocked(email)) {
      throw new Error("BLOCK_ERROR");
    }
    const otps = JSON.parse(localStorage.getItem('pelikan_login_otps') || '{}');
    const record = otps[email.toLowerCase()];
    if (!record) return false;
    if (record.expiresAt < Date.now()) {
      delete otps[email.toLowerCase()];
      localStorage.setItem('pelikan_login_otps', JSON.stringify(otps));
      return false;
    }
    if (record.otp === otpInput.trim()) {
      // Valid! Clean up
      delete otps[email.toLowerCase()];
      localStorage.setItem('pelikan_login_otps', JSON.stringify(otps));
      return true;
    }
    return false;
  },

  getCustomersList(): Customer[] {
    const list = localStorage.getItem('pelikan_manual_customers');
    if (!list) return [];
    try {
      return JSON.parse(list);
    } catch {
      return [];
    }
  },

  saveCustomersList(customers: Customer[]): void {
    localStorage.setItem('pelikan_manual_customers', JSON.stringify(customers));
  },

  customerSignUp(name: string, email: string, phone: string, password: string): { success: boolean; message: string } {
    const emailLower = email.toLowerCase().trim();
    if (this.isCustomerBlocked(emailLower)) {
      return { success: false, message: 'Denna e-postadress har blockerats av hovmästaren.' };
    }

    const customers = this.getCustomersList();
    const existingIdx = customers.findIndex(c => c.email.toLowerCase().trim() === emailLower);

    if (existingIdx !== -1) {
      const existing = customers[existingIdx];
      if (existing.password) {
        return { success: false, message: 'Det finns redan ett konto registrerat med denna e-postadress. Vänligen logga in.' };
      } else {
        // Exists from a historical manual save or reservation, set password to sign them up!
        existing.password = password;
        if (name && !existing.name) existing.name = name;
        if (phone && !existing.phone) existing.phone = phone;
        this.saveCustomersList(customers);
        
        // Log to system activity
        this.addStaffLog('Gästportal', `Gästkonto aktiverat för stammis: ${existing.name || name} (${emailLower})`);
        
        // Auto-send welcome voucher if enabled
        this.autoSendFirstTimeVoucher(existing.name || name, emailLower);
        
        return { success: true, message: 'Konto skapat framgångsrikt!' };
      }
    }

    // Completely new customer
    const newCustomer: Customer = {
      id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      email: emailLower,
      phone,
      totalVisits: 0,
      password
    };
    customers.push(newCustomer);
    this.saveCustomersList(customers);

    // Log to system activity
    this.addStaffLog('Gästportal', `Ny registreringsförfrågan! Gästkonto skapat för ny gäst: ${name} (${emailLower})`);

    // Auto-send welcome voucher if enabled
    this.autoSendFirstTimeVoucher(name, emailLower);

    return { success: true, message: 'Konto skapat framgångsrikt!' };
  },

  autoSendFirstTimeVoucher(name: string, email: string): void {
    const config = this.getGiftVoucherConfig();
    if (!config.isEnabled || !config.firstTimeAutoSendEnabled) {
      return;
    }
    const amount = config.firstTimeAutoSendAmount || 250;
    // Check if a welcome voucher has already been sent to this user
    const vouchers = this.getVouchers();
    const emailLower = email.toLowerCase().trim();
    const alreadySent = vouchers.some(v => v.recipientEmail.toLowerCase().trim() === emailLower && v.code.toUpperCase().startsWith('VÄLKOMMEN'));
    if (alreadySent) {
      return;
    }

    const code = `VÄLKOMMEN-${Math.floor(1000 + Math.random() * 9000)}`;
    const welcomeVoucher: AdminVoucher = {
      id: `VCH-AUTO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      code,
      amount,
      value: amount, // Direct welcome voucher with full SEK value
      recipientEmail: emailLower,
      recipientName: name,
      createdAt: new Date().toISOString(),
      isEnabled: true,
      isClaimed: false
    };
    this.addVoucher(welcomeVoucher);

    // Send a simulator confirmation e-mail (as requested)
    const profile = this.getAdminProfile();
    const mailBody = `Hej ${name},\n\nVarmt välkommen till Krog Pelikan!\n\nEftersom detta är ditt första gästkonto hos oss har vi utfärdat ett automatiskt välkomstpresentkort värt ${amount} kr!\n\nDin presentkod är: ${code}\n\nDu kan lösa in detta presentkort, spåra ditt saldo direkt i din profil samt visa upp koden vid ditt nästa matsalsbesök.\n\nVänliga hälsningar,\nHovmästaren, Krog Pelikan\nBlekingegatan 40, Södermalm`;
    
    this.addEmail({
      to: emailLower,
      from: `${profile.displayName} <${profile.emailAddress}>`,
      subject: `Välkomstgåva! Gratis presentkort på ${amount} kr hos Krog Pelikan (Kod: ${code})`,
      body: mailBody,
      type: 'voucher',
      voucherCode: code
    });

    // Notify staff logs
    this.addStaffLog('Systemautomatisering', `Skickade automatiskt ett välkomstpresentkort (${code}) värt ${amount} kr till ny gäst ${name} (${emailLower})`);
  },

  customerLogin(email: string, password: string): { success: boolean; message: string; customer?: Customer } {
    const emailLower = email.toLowerCase().trim();
    if (this.isCustomerBlocked(emailLower)) {
      return { success: false, message: 'Inloggning nekad. Ditt konto har blockerats.' };
    }

    const customers = this.getCustomersList();
    const customer = customers.find(c => c.email.toLowerCase().trim() === emailLower);

    if (!customer) {
      return { success: false, message: 'Det finns inget konto registrerat med denna e-postadress. Vänligen välj Skapa konto.' };
    }

    if (!customer.password) {
      return { success: false, message: 'Ditt gästkonto har inga inloggningsuppgifter kopplade än. Tryck på Skapa konto för återskapa lösenord.' };
    }

    if (customer.password !== password) {
      return { success: false, message: 'Felaktigt lösenord. Vänligen återställ ditt lösenord.' };
    }

    return { success: true, message: 'Inloggad framgångsrikt!', customer };
  },

  initiatePasswordReset(email: string): { success: boolean; message: string; resetCode?: string } {
    const emailLower = email.toLowerCase().trim();
    const customers = this.getCustomersList();
    const customer = customers.find(c => c.email.toLowerCase().trim() === emailLower);

    if (!customer || !customer.password) {
      return { success: false, message: 'Det finns inget registrerat gästkonto med denna e-postadress.' };
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    customer.passwordResetCode = resetCode;
    this.saveCustomersList(customers);

    const emailBody = `Hej!\n\nDu har begärt en återställning av lösenordet för ditt gästkonto på Krog Pelikan.\n\nDin engångskod för lösenordsåterställning är:\n${resetCode}\n\nAnge denna kod på hemsidan för att ange ditt nya lösenord.\n\nOm du inte begärt detta kan du bortse från detta e-postmeddelande.\n\nVänliga hälsningar,\nKrog Pelikan`;

    // Add to email logging
    this.addEmail({
      to: emailLower,
      from: `system@pelikan.se`,
      subject: `Krog Pelikan - Återställning av lösenord (Kod: ${resetCode})`,
      body: emailBody,
      type: 'admin_notify'
    });

    // Real SMTP
    try {
      this.triggerRealSmtpEmail({
        to: emailLower,
        subject: `Krog Pelikan - Återställning av lösenord`,
        body: emailBody
      });
    } catch (err) {
      console.warn("Reset email dispatch failed", err);
    }

    return { success: true, message: 'En återställningskod har skickats till din e-post!', resetCode };
  },

  verifyResetCode(email: string, code: string): { success: boolean; message: string } {
    const emailLower = email.toLowerCase().trim();
    const customers = this.getCustomersList();
    const customer = customers.find(c => c.email.toLowerCase().trim() === emailLower);

    if (!customer || !customer.passwordResetCode) {
      return { success: false, message: 'Lösenordsåterställning har inte påbörjats för denna e-postadress.' };
    }

    if (customer.passwordResetCode !== code.trim()) {
      return { success: false, message: 'Felaktig återställningskod. Vänligen kontrollera koden.' };
    }

    return { success: true, message: 'Koden har verifierats framgångsfullt!' };
  },

  resetPasswordWithCode(email: string, code: string, newPassword: string): { success: boolean; message: string } {
    const emailLower = email.toLowerCase().trim();
    const customers = this.getCustomersList();
    const customer = customers.find(c => c.email.toLowerCase().trim() === emailLower);

    if (!customer || !customer.passwordResetCode) {
      return { success: false, message: 'Lösenordsåterställning har inte påbörjats för denna e-postadress.' };
    }

    if (customer.passwordResetCode !== code.trim()) {
      return { success: false, message: 'Felaktig återställningskod. Vänligen kontrollera koden.' };
    }

    customer.password = newPassword;
    customer.passwordResetCode = undefined;
    this.saveCustomersList(customers);

    // Notify password changed successfully
    const emailBody = `Hej!\n\nDitt lösenord på Krog Pelikan har uppdaterats framgångsrikt!\n\nOm du inte har genomfört detta, kontakta omgående vår hovmästare.\n\nVänliga hälsningar,\nKrog Pelikan`;
    this.addEmail({
      to: emailLower,
      from: `system@pelikan.se`,
      subject: `Lösenordet har ändrats - Krog Pelikan`,
      body: emailBody,
      type: 'admin_notify'
    });

    return { success: true, message: 'Lösenordet har uppdaterats! Du kan nu logga in med ditt nya lösenord.' };
  },

  checkUserType(email: string): 'first-time' | 'regular' {
    const emailLower = email.toLowerCase().trim();
    const bookings = this.getBookings();
    const userBookings = bookings.filter(b => b.email.toLowerCase().trim() === emailLower && b.status !== 'cancelled');
    if (userBookings.length > 0) {
      return 'regular';
    }
    return 'first-time';
  },

  getVoucherBuyingOptions(): VoucherBuyingOption[] {
    const saved = localStorage.getItem('pelikan_voucher_options');
    const DEFAULT_OPTIONS: VoucherBuyingOption[] = [
      { id: 'opt_1', name: 'Middag Gåvokort', swedishName: 'Dinner Gift Card', cost: 500, value: 550, isEnabled: true, description: 'Perfekt som födelsedagspresent eller julgåva.' },
      { id: 'opt_2', name: 'Södermalm Lyxpaket', swedishName: 'Södermalm Luxury Package', cost: 1000, value: 1200, isEnabled: true, description: 'Inkluderar extra gästbonus.' },
      { id: 'opt_3', name: 'Artonhundratio Fest', swedishName: '1910 Grand Celebration', cost: 2000, value: 2500, isEnabled: true, description: 'Vårt mest exklusiva värdebevis med bonusfördel.' }
    ];
    if (!saved) {
      localStorage.setItem('pelikan_voucher_options', JSON.stringify(DEFAULT_OPTIONS));
      return DEFAULT_OPTIONS;
    }
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return DEFAULT_OPTIONS;
      return parsed.map((item: any) => ({
        id: item.id,
        name: item.name || item.nameSv || `Presentkort ${item.rewardValue || item.value} kr`,
        swedishName: item.swedishName || item.nameEn || `${item.rewardValue || item.value} kr Gift Card`,
        cost: item.cost !== undefined ? item.cost : (item.price !== undefined ? item.price : 500),
        value: item.value !== undefined ? item.value : (item.rewardValue !== undefined ? item.rewardValue : 500),
        isEnabled: item.isEnabled !== undefined ? item.isEnabled : (item.isActive !== undefined ? item.isActive : true),
        description: item.description || ''
      }));
    } catch {
      return DEFAULT_OPTIONS;
    }
  },

  saveVoucherBuyingOptions(options: VoucherBuyingOption[]): void {
    const normalized = options.map((item: any) => ({
      id: item.id,
      name: item.name || item.nameSv || '',
      nameSv: item.nameSv || item.name || '',
      swedishName: item.swedishName || item.nameEn || '',
      nameEn: item.nameEn || item.swedishName || '',
      cost: item.cost !== undefined ? item.cost : (item.price !== undefined ? item.price : 0),
      price: item.price !== undefined ? item.price : (item.cost !== undefined ? item.cost : 0),
      value: item.value !== undefined ? item.value : (item.rewardValue !== undefined ? item.rewardValue : 0),
      rewardValue: item.rewardValue !== undefined ? item.rewardValue : (item.value !== undefined ? item.value : 0),
      isEnabled: item.isEnabled !== undefined ? item.isEnabled : (item.isActive !== undefined ? item.isActive : true),
      isActive: item.isActive !== undefined ? item.isActive : (item.isEnabled !== undefined ? item.isEnabled : true),
      description: item.description || ''
    }));
    localStorage.setItem('pelikan_voucher_options', JSON.stringify(normalized));
  },

  getStaffProfiles(): StaffProfile[] {
    const saved = localStorage.getItem('pelikan_staff_profiles');
    const DEFAULT_STAFF: StaffProfile[] = [
      { id: 'st_1', username: 'kalle', displayName: 'Kalle Hovmästare', permissions: ['reservations', 'customers'], createdAt: new Date().toISOString() },
      { id: 'st_2', username: 'sara', displayName: 'Sara Sommelier', permissions: ['menu', 'tables'], createdAt: new Date().toISOString() }
    ];
    if (!saved) {
      localStorage.setItem('pelikan_staff_profiles', JSON.stringify(DEFAULT_STAFF));
      return DEFAULT_STAFF;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return DEFAULT_STAFF;
    }
  },

  saveStaffProfiles(profiles: StaffProfile[]): void {
    localStorage.setItem('pelikan_staff_profiles', JSON.stringify(profiles));
  },

  getStaffLogs(): StaffLog[] {
    const saved = localStorage.getItem('pelikan_staff_logs');
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  },

  saveStaffLogs(logs: StaffLog[]): void {
    localStorage.setItem('pelikan_staff_logs', JSON.stringify(logs));
  },

  addStaffLog(staffName: string, action: string): void {
    const logs = this.getStaffLogs();
    const newLog: StaffLog = {
      id: `LOG-${Math.floor(100000 + Math.random() * 900000)}`,
      staffName,
      action,
      timestamp: new Date().toISOString(),
      operatorName: staffName,
      description: action
    };
    logs.unshift(newLog);
    this.saveStaffLogs(logs);
  }
};
