export interface TranslationDictionary {
  navbar: {
    menu: string;
    bookTable: string;
    voucher: string;
    gallery: string;
    ourStory: string;
    contact: string;
    admin: string;
    ctaButton: string;
  };
  restaurantStatus: {
    hoursPrefix: string;
    locPrefix: string;
    timeLabel: string;
    tel: string;
    cookingSchedules: string;
    kitchenClosesDisclaimer: string;
    travelRecommendation: string;
  };
  hero: {
    subtitle: string;
    title: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  story: {
    quote: string;
    yearLabel: string;
    capacityLabel: string;
    recipesLabel: string;
    envTitle: string;
  };
  menu: {
    title: string;
    categoryStarters: string;
    categoryMains: string;
    categoryDesserts: string;
    categoryDrinks: string;
    dietaryNotice: string;
    signatureTag: string;
  };
  booking: {
    title: string;
    subtitle: string;
    step1: string;
    step2: string;
    step3: string;
    guests: string;
    date: string;
    time: string;
    zone: string;
    notesPlaceholder: string;
    dietaryPlaceholder: string;
    nameLabel: string;
    emailLabel: string;
    phoneLabel: string;
    notesLabel: string;
    dietaryLabel: string;
    allergenCheck: string;
    submitStep1: string;
    submitStep2: string;
    backButton: string;
    successTitle: string;
    successSubtitle: string;
    refLabel: string;
    secNote: string;
    guestsLabel: string;
    zoneLabel: string;
    dateLabel: string;
    timeLabel: string;
    specialNotesLabel: string;
    backBtn: string;
    submitting: string;
    submitBtn: string;
    successSub: string;
    receiptTitle: string;
    guestsReceipt: string;
    dateReceipt: string;
    timeReceipt: string;
    zoneReceipt: string;
    nameReceipt: string;
    dietReceipt: string;
    doneButton: string;
  };
  vouchers: {
    title: string;
    subtitle: string;
    amountLabel: string;
    senderName: string;
    senderEmail: string;
    recipientName: string;
    recipientEmail: string;
    deliveryDate: string;
    personalMessage: string;
    messagePlaceholder: string;
    themeLabel: string;
    themeClassic: string;
    themeGolden: string;
    themeWinter: string;
    customDesignTitle: string;
    btnBuild: string;
    successMessage: string;
  };
  testimonials: {
    title: string;
    reasonPrefix: string;
  };
  footer: {
    desc: string;
    coordinatesTitle: string;
    directionTitle: string;
    directionDesc: string;
    contactTitle: string;
    placeholderName: string;
    placeholderEmail: string;
    placeholderSubject: string;
    placeholderMessage: string;
    btnSend: string;
    successMessage: string;
    loadingMessage: string;
    rights: string;
    privacy: string;
    cookies: string;
  };
  admin: {
    authTitle: string;
    authSubtitle: string;
    authHint: string;
    username: string;
    password: string;
    signInBtn: string;
    backToRest: string;
    panelTitle: string;
    loggedAs: string;
    logOut: string;
    refresh: string;
    
    // Stats
    statBookings: string;
    statPending: string;
    statConfirmed: string;
    statGuests: string;
    statRealtime: string;
    
    // Tabs
    tabReservations: string;
    tabGuests: string;
    tabZones: string;
    tabSettings: string;
    
    // Reservations Tab
    searchPlaceholder: string;
    filterAll: string;
    filterConfirmed: string;
    filterPending: string;
    filterCancelled: string;
    btnAddBooking: string;
    colGuest: string;
    colGuestsQty: string;
    colDateTime: string;
    colZone: string;
    colStatus: string;
    colNotes: string;
    colActions: string;
    
    // Zone Tab
    zoneTitle: string;
    zoneSubtitle: string;
    btnAddZone: string;
    zoneSeating: string;
    zoneTables: string;
    
    // Settings Sub-Tabs
    subTheme: string;
    subSMTP: string;
    subInbox: string;
    subCompose: string;
    subSimulate: string;
    
    // Modals
    modalEditBooking: string;
    modalCreateBooking: string;
    btnSave: string;
    btnCancel: string;
  };
}

export const translations: Record<'sv' | 'en', TranslationDictionary> = {
  sv: {
    navbar: {
      menu: "Menyn",
      bookTable: "Boka Bord",
      voucher: "Presentkort",
      gallery: "Bilder/Video",
      ourStory: "Vår Saga",
      contact: "Tider & Hitta",
      admin: "Hovmästare • Admin",
      ctaButton: "Boka Nu"
    },
    restaurantStatus: {
      hoursPrefix: "MÅNDAG - TORSDAG: 16:00 - 24:00 | FREDAG: 16:00 - 01:00 | LÖRDAG: 13:00 - 01:00 | SÖNDAG: 13:00 - 23:00",
      locPrefix: "Blekingegatan 40, Södermalm",
      timeLabel: "Lokaltid i Stockholm",
      tel: "Tel: +46 (0)8 556 413 10",
      cookingSchedules: "Öppettider • Opening Hours",
      kitchenClosesDisclaimer: "* Köket stänger kl 22:00 på vardagar och söndagar, samt kl 23:00 på fredagar och lördagar.",
      travelRecommendation: "Södermalm har begränsat med p-platser. Vi rekommenderar buss nr 3, 4 eller tunnelbana till Skanstull (3 min gångavstånd)."
    },
    hero: {
      subtitle: "Sedan 1664 • En hyllning till Södermalms hjärta",
      title: "En tidsresa till det äkta Stockholmska krogfyllda mathantverket",
      ctaPrimary: "Reservera det runda bordet",
      ctaSecondary: "Utforska Grosshandlarmenyn"
    },
    story: {
      quote: "I över hundra år har konstnärer, musiker, författare och arbetare samsats på samma bänkar över rejäla tallrikar med Svensk Husmanskost. Det är denna tidlösa, genuina gemenskap och hantverkskänsla vi fortsätter att vårda varje dag.",
      yearLabel: "Grundat år 1664",
      capacityLabel: "Unika historiska zoner",
      recipesLabel: "Klassiska recept",
      envTitle: "MILJÖN I STORA HALLEN"
    },
    menu: {
      title: "Grosshandlarmenyn på Krog Pelikan",
      categoryStarters: "Förrätter",
      categoryMains: "Varmrätter",
      categoryDesserts: "Efterrätter",
      categoryDrinks: "Pelikan Dryckeslista",
      dietaryNotice: "* Allergeninformation: Fråga din hovmästare om du är allergisk mot gluten, laktos eller nötter. Vi anpassar gärna rätterna.",
      signatureTag: "SIGNATURRÄTT"
    },
    booking: {
      title: "Reservera ett bord på Krog Pelikan",
      subtitle: "Varje kväll dukar vi upp för gille i den anrika ölhallen på Södermalm. Boka ditt bord live nedan för garanteras sittplats under takkronorna.",
      step1: "Platser & Tid",
      step2: "Gästuppgifter",
      step3: "Bekräftat!",
      guests: "Antal gäster",
      date: "Välj datum",
      time: "Välj sittningstid",
      zone: "Välj rumszon",
      notesPlaceholder: "T.ex. barnstol önskas, rullstolsanpassning...",
      dietaryPlaceholder: "Skriv allergier (t.ex. glutenfri, celiaki, laktos, vegan)...",
      nameLabel: "Ditt fullständiga namn",
      emailLabel: "E-postadress för bekräftelse",
      phoneLabel: "Mobiltelefonnummer",
      notesLabel: "Särskilda önskemål eller bordsönskningar",
      dietaryLabel: "Allergier, dieter eller matpreferenser",
      allergenCheck: "Jag intygar att uppgifterna är korrekta för säkert mathantverk",
      submitStep1: "Gå vidare till uppgifter",
      submitStep2: "Slutför och boka bordet",
      backButton: "Tillbaka",
      successTitle: "Ditt bord är reserverat!",
      successSubtitle: "En officiell bekräftelse och hovmästarbiljett har framställts och skickats till din e-postadress.",
      refLabel: "Referensnummer",
      secNote: "Anländ senast 15 minuter efter bokad tid. Vid försening, ring oss på +46 (0)8 556 413 10.",
      guestsLabel: "Antal gäster",
      zoneLabel: "Välj rumszon",
      dateLabel: "Välj datum",
      timeLabel: "Sittningstid",
      specialNotesLabel: "Särskilda önskemål (t.ex. barnstol...)",
      backBtn: "Tillbaka",
      submitting: "Reserverar bord...",
      submitBtn: "Slutför och boka bordet",
      successSub: "BOKNINGSREKVISITION SKAPAD",
      receiptTitle: "OFFICIELL BOKNINGSKVITTO",
      guestsReceipt: "Antal gäster",
      dateReceipt: "Bokat datum",
      timeReceipt: "Sittningstid",
      zoneReceipt: "Matsalszon",
      nameReceipt: "Gästnamn",
      dietReceipt: "Allergier/dieter",
      doneButton: "Klar, stäng"
    },
    vouchers: {
      title: "Pelikan Presentkortsstudio",
      subtitle: "Ge bort ett anrikt hantverk. Skapa ett skräddarsytt fysiskt gåvobevis med unikt serienummer direkt i vår studio och skriv ut eller skicka digitalt.",
      amountLabel: "Värdebelopp (SEK)",
      senderName: "Ditt Namn (Avsändare)",
      senderEmail: "Din E-post",
      recipientName: "Mottagarens Namn",
      recipientEmail: "Mottagarens E-post",
      deliveryDate: "Leveransdatum",
      personalMessage: "Personlig hälsning",
      messagePlaceholder: "Skriv en varm hälsning till mottagaren...",
      themeLabel: "Visuellt Gåvotema",
      themeClassic: "Klassisk Ärlig (Pelikan-Blå)",
      themeGolden: "Anrik & Gyllene (Gjutjärn)",
      themeWinter: "Nordiskt Vintermys",
      customDesignTitle: "FÖRHANDSVISNING AV DITT GÅVOBEVIS",
      btnBuild: "Generera & Sänd Presentkort",
      successMessage: "✓ Presentkortet har framställts! Ett kvitto samt gåvobevis har skickats till din och mottagarens e-postadress."
    },
    testimonials: {
      title: "Röster från den anrika ölhallen",
      reasonPrefix: "Besökte för"
    },
    footer: {
      desc: "Krog Pelikan är en av Stockholms mest anrika krogar. Här vårdar vi den svenska husmanskosten och den levande dryckeskulturen med största vördnad.",
      coordinatesTitle: "Kontaktuppgifter • Coordinates",
      directionTitle: "Hitta till Blekingegatan 40",
      directionDesc: "T-bana Skanstull (Gröna linjen). Gå norrut på Götgatan, sväng vänster in på Blekingegatan. Pelikan ligger på höger sida.",
      contactTitle: "Kontakta oss • Instant Inquiries",
      placeholderName: "Ditt Namn • Your Name",
      placeholderEmail: "Din E-post • Your Email",
      placeholderSubject: "Ämne • Subject (t.ex. Fest, Julbord, Frågor)",
      placeholderMessage: "Skriv ditt meddelande här...",
      btnSend: "Skicka Förfrågan",
      successMessage: "✓ Tack! Ditt meddelande har skickats till bokningsansvarig. Vi återkopplar inom 24 timmar.",
      loadingMessage: "Skickar meddelande...",
      rights: "© 2026 KROG PELIKAN AB. ALLA RÄTTIGHETER FÖRBEHÅLLNA. VARUMÄRKESSKYDDAT.",
      privacy: "Integritetspolicy",
      cookies: "Cookieinställningar"
    },
    admin: {
      authTitle: "HOVMÄSTARPORTAL • SECURE LOG IN",
      authSubtitle: "Tradition och kontroll sedan 1910",
      authHint: "Standardbehörighet: användarnamn admin, lösenord admin",
      username: "Användarnamn",
      password: "Lösenord",
      signInBtn: "Autentisera / Sign In",
      backToRest: "Tillbaka till restaurangen",
      panelTitle: "BOKNINGSHANTERING & ADMINISTRATION",
      loggedAs: "Inloggad som",
      logOut: "Logga ut • Avsluta",
      refresh: "Uppdatera listor",
      statBookings: "Inkomna bokningar",
      statPending: "Väntar på godkännande",
      statConfirmed: "Bekräftade bord",
      statGuests: "Bokade gäster",
      statRealtime: "REALTIDSDATA FRÅN SYSTEMET",
      tabReservations: "Reservationer",
      tabGuests: "Gästregister",
      tabZones: "Matsalszoner",
      tabSettings: "Inställningar",
      searchPlaceholder: "Sök gästnamn, e-post, telefon eller referenskod...",
      filterAll: "Alla statusar",
      filterConfirmed: "Bekräftade bord",
      filterPending: "Väntande",
      filterCancelled: "Inställda",
      btnAddBooking: "Skapa ny bokning",
      colGuest: "Gästnamn / Kontakt",
      colGuestsQty: "Sittplatser",
      colDateTime: "Datum och Tid",
      colZone: "Önskat rum",
      colStatus: "Status",
      colNotes: "Allergier / Önskemål",
      colActions: "Åtgärder",
      zoneTitle: "Matsal & Bordszoner",
      zoneSubtitle: "Definiera rymliga rumszoner på Krog Pelikan, sätt sittplatskapacitet samt hantera bordskonfigurationer",
      btnAddZone: "Skapa ny rumszon",
      zoneSeating: "Sittplatser",
      zoneTables: "Bordskapacitet",
      subTheme: "Grafisk profil & Teman",
      subSMTP: "SMTP Inställningar",
      subInbox: "Inkorg & Loggar",
      subCompose: "Skicka E-post",
      subSimulate: "Simulera Gäst-mejl",
      modalEditBooking: "Redigera Bordsreservation",
      modalCreateBooking: "Skapa Ny Reservation",
      btnSave: "Spara ändringar",
      btnCancel: "Avbryt"
    }
  },
  en: {
    navbar: {
      menu: "The Menu",
      bookTable: "Book a Table",
      voucher: "Gift Cards",
      gallery: "Media Gallery",
      ourStory: "Our History",
      contact: "Hours & Location",
      admin: "Hostess • Admin",
      ctaButton: "Book Now"
    },
    restaurantStatus: {
      hoursPrefix: "MONDAY - THURSDAY: 16:00 - 24:00 | FRIDAY: 16:00 - 01:00 | SATURDAY: 13:00 - 01:00 | SUNDAY: 13:00 - 23:00",
      locPrefix: "Blekingegatan 40, Södermalm",
      timeLabel: "Stockholm Local Time",
      tel: "Tel: +46 (0)8 556 413 10",
      cookingSchedules: "Opening Hours",
      kitchenClosesDisclaimer: "* The kitchen closes at 22:00 on weekdays and Sundays, and at 23:00 on Fridays and Saturdays.",
      travelRecommendation: "Södermalm district has limited local car parking. We highly recommend using Bus 3, 4 or the Skanstull Subway Station (3 minutes walk)."
    },
    hero: {
      subtitle: "Since 1664 • A tribute to the heart of Södermalm",
      title: "A journey through time into authentic Stockholm culinary craftsmanship",
      ctaPrimary: "Reserve the Round Table",
      ctaSecondary: "Explore the Grand Menu"
    },
    story: {
      quote: "For more than a century, artists, musicians, writers, and local workers have gathered on these same wooden benches to share hearty plates of Swedish Husmanskost. It is this timeless, genuine sense of community and craft that we nurse every day.",
      yearLabel: "Founded in 1664",
      capacityLabel: "Historical Dining Zones",
      recipesLabel: "Classic Formulations",
      envTitle: "THE ATMOSPHERE OF THE GREAT HALL"
    },
    menu: {
      title: "The Grand Menu at Krog Pelikan",
      categoryStarters: "Starters / Appetizers",
      categoryMains: "Main Courses",
      categoryDesserts: "Desserts",
      categoryDrinks: "Pelikan Beverages & Beers",
      dietaryNotice: "* Allergen Information: Ask your host if you are allergic to gluten, lactose, or nuts. We are happy to modify your courses.",
      signatureTag: "SIGNATURE COURSE"
    },
    booking: {
      title: "Reserve a Table at Krog Pelikan",
      subtitle: "Every evening we set the stage for dining in our historic Södermalm beer hall. Secure your dynamic reservation live below to dine under our high vaults.",
      step1: "Seats & Time",
      step2: "Guest Details",
      step3: "Confirmed!",
      guests: "Number of guests",
      date: "Select Date",
      time: "Select Sitting Time",
      zone: "Select Seating Room",
      notesPlaceholder: "E.g. baby highchair, wheelchair access...",
      dietaryPlaceholder: "Write any allergies (e.g., gluten-free, celiac, dairy-free, vegan)...",
      nameLabel: "Your Full Name",
      emailLabel: "Confirmation Email Address",
      phoneLabel: "Mobile Phone Number",
      notesLabel: "Special requests or seating preferences",
      dietaryLabel: "Allergies, diets, or ingredient preferences",
      allergenCheck: "I certify that these details are correct for safe culinary operations",
      submitStep1: "Proceed to guest details",
      submitStep2: "Complete & Book Table",
      backButton: "Back",
      successTitle: "Your table is reserved!",
      successSubtitle: "An official reservation certificate and dining pass has been generated and sent to your email address.",
      refLabel: "Reference Number",
      secNote: "Please arrive within 15 minutes of your booking. To report a delay, please call us at +46 (0)8 556 413 10.",
      guestsLabel: "Number of guests",
      zoneLabel: "Select Dining Zone",
      dateLabel: "Select Date",
      timeLabel: "Sitting Time",
      specialNotesLabel: "Special requests (e.g. high chair...)",
      backBtn: "Back",
      submitting: "Reserving table...",
      submitBtn: "Complete & Book Table",
      successSub: "RESERVATION REQUEST RECORDED SUCCESSFULLY",
      receiptTitle: "OFFICIAL DINING PASS & RECEIPT",
      guestsReceipt: "Guests Count",
      dateReceipt: "Reserved Date",
      timeReceipt: "Arrival Time",
      zoneReceipt: "Seating Zone",
      nameReceipt: "Guest Name",
      dietReceipt: "Allergies/Diet",
      doneButton: "Done, Close"
    },
    vouchers: {
      title: "Pelikan Gift Card Studio",
      subtitle: "Give a gift of historic craft. Fabricate a custom physical booking voucher with a unique verification serial number directly in our real-time studio.",
      amountLabel: "Value Amount (SEK)",
      senderName: "Your Name (Sender)",
      senderEmail: "Your Email Address",
      recipientName: "Recipient Name",
      recipientEmail: "Recipient Email",
      deliveryDate: "Delivery Date",
      personalMessage: "Personal Dedication Message",
      messagePlaceholder: "Write a warm message for the recipient...",
      themeLabel: "Visual Gift Theme",
      themeClassic: "Classic Honest (Pelikan Blue)",
      themeGolden: "Historic & Golden (Cast Iron)",
      themeWinter: "Nordic Winter Cozy",
      customDesignTitle: "GIFT VOUCHER VISUAL PREVIEW",
      btnBuild: "Generate & Send Gift Card",
      successMessage: "✓ Gift card created! A receipt and the printable dining voucher have been sent to both email coordinates."
    },
    testimonials: {
      title: "Voices from the Famous Beer Hall",
      reasonPrefix: "Visited for"
    },
    footer: {
      desc: "Krog Pelikan is one of Stockholm's most historic restaurants. Here, we preserve Swedish culinary heritage and active beverage traditions with great reverence.",
      coordinatesTitle: "Contact Details & Coordinates",
      directionTitle: "Find us at Blekingegatan 40",
      directionDesc: "Skanstull Subway Station (Green Line). Walk north on Götgatan, turn left on Blekingegatan. Pelikan is on the right hand side.",
      contactTitle: "Quick Contact & Inquiries",
      placeholderName: "Your Name",
      placeholderEmail: "Your Email Address",
      placeholderSubject: "Subject (e.g. Banquet, Christmas buffet, Inquiries)",
      placeholderMessage: "Write your message here...",
      btnSend: "Submit Inquiry",
      successMessage: "✓ Thank you! Your message has been routed to the hostess. We will respond within 24 hours.",
      loadingMessage: "Routing message...",
      rights: "© 2026 KROG PELIKAN AB. ALL RIGHTS RESERVED. REGISTERED TRADEMARK.",
      privacy: "Privacy Policy",
      cookies: "Cookie Settings"
    },
    admin: {
      authTitle: "HOSTESS PORTAL • SECURE LOG IN",
      authSubtitle: "Tradition and Command since 1910",
      authHint: "Default credentials: username admin, password admin",
      username: "Username",
      password: "Password",
      signInBtn: "Authenticate / Sign In",
      backToRest: "Back to Restaurant",
      panelTitle: "RESERVATIONS ENGINE & ADMINISTRATION",
      loggedAs: "Logged in as",
      logOut: "Log Out & Exit",
      refresh: "Refresh Lists",
      statBookings: "Total Bookings",
      statPending: "Awaiting Action",
      statConfirmed: "Confirmed Tables",
      statGuests: "Dined Guests",
      statRealtime: "SYSTEM DATA REALTIME COUNTER",
      tabReservations: "Reservations",
      tabGuests: "Guest Registry",
      tabZones: "Seating Rooms",
      tabSettings: "Control Settings",
      searchPlaceholder: "Search guest name, email, phone or reference...",
      filterAll: "All statuses",
      filterConfirmed: "Confirmed Tables",
      filterPending: "Pending Action",
      filterCancelled: "Cancelled Bookings",
      btnAddBooking: "Create Manual Booking",
      colGuest: "Guest / Contacts",
      colGuestsQty: "Seats",
      colDateTime: "Date & Sitting",
      colZone: "Room Zone",
      colStatus: "Status",
      colNotes: "Aliments & Requests",
      colActions: "Actions",
      zoneTitle: "Dining Rooms & Zones",
      zoneSubtitle: "Define wide seating corridors inside Krog Pelikan, specify seating ceilings, and fine-tune active floor counts",
      btnAddZone: "Provisional Zone",
      zoneSeating: "Seating Caps",
      zoneTables: "Floor Counts",
      subTheme: "Graphic Profile & Theming",
      subSMTP: "SMTP Infrastructure",
      subInbox: "Inbox & System Logs",
      subCompose: "Manual Transmission",
      subSimulate: "Simulate Customer Mail",
      modalEditBooking: "Modify Table Reservation",
      modalCreateBooking: "Formulate Manual Booking",
      btnSave: "Save Modifications",
      btnCancel: "Cancel"
    }
  }
};
