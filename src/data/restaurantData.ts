import { MenuItem, GalleryItem, Testimonial } from '../types';

export const MENU_ITEMS: MenuItem[] = [
  // STARTERS
  {
    id: 'starter-1',
    name: 'S.O.S. (Butter, Cheese & Herring)',
    swedishName: 'Smör, Ost & Sill',
    price: 185,
    description: 'A legendary Swedish appetizer: three styles of premium house-cured herring, vintage Swedish Västerbotten cheese, rolled brown butter, served with hot dill potatoes and traditional rye crispbread.',
    category: 'starters',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
    dietary: ['Can be Gluten-free', 'High Protein'],
    signature: true
  },
  {
    id: 'starter-2',
    name: 'Toast Skagen',
    swedishName: 'Skagenröra på Smörstekt Bröd',
    price: 195,
    description: 'Fresh hand-peeled Arctic shrimp dressed in rich homemade mayonnaise with fresh dill, red onion, a touch of horseradish, topped with a generous dollop of whitefish roe (löjrom) on crispy butter-fried sourdough toast.',
    category: 'starters',
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800',
    dietary: ['Can be Gluten-free'],
    signature: true
  },
  {
    id: 'starter-3',
    name: 'Cured Salmon with Dill Cream',
    swedishName: 'Gravad Lax med Dillstuvad Potatis',
    price: 175,
    description: 'Lightly salt-and-sugar cured salmon sliced thin, drizzled with sweet Swedish mustard-dill sauce (hovmästarsås), accompanied by classic warm dill-infused cream potatoes.',
    category: 'starters',
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800',
    dietary: ['Gluten-Free'],
    signature: false
  },
  {
    id: 'starter-4',
    name: 'Västerbotten Cheese Tart',
    swedishName: 'Västerbottensostpaj',
    price: 165,
    description: 'A savory tart baked with sharp, aged northern Swedish Västerbotten cheese, served with cold-pressed sour cream (gräddfil), finely chopped red onions, and bleak roe.',
    category: 'starters',
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=800',
    dietary: ['Vegetarian'],
    signature: false
  },

  // MAINS
  {
    id: 'main-1',
    name: "Pelikan's Famous Swedish Meatballs",
    swedishName: 'Pelikans Hemlagade Köttbullar',
    price: 255,
    description: 'Grand-sized, tender hand-rolled meatballs prepared with traditional recipe beef and pork. Drenched in a silky, rich brown veal cream gravy, paired with velvety butter-whipped potato puree, tart-sweet wild lingonberries, and crisp house-pickled pressed cucumbers.',
    category: 'mains',
    imageUrl: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&q=80&w=800',
    dietary: ['Nut-Free'],
    signature: true
  },
  {
    id: 'main-2',
    name: 'Pork Knuckle with Root Puree',
    swedishName: 'Ugnsbakad Fläsklägg med Rotmos',
    price: 265,
    description: 'Hearty, slow-simmered and oven-finished pork shank on the bone, characterized by crackling skin and tender meat. Served over a sweet and savory swede root mash, accompanied by a trio of mustards (sweet Scanian, whole-grain, and sharp English).',
    category: 'mains',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
    dietary: ['Gluten-Free', 'Dairy-Free option'],
    signature: true
  },
  {
    id: 'main-3',
    name: 'Wholesale Merchant Beef',
    swedishName: 'Grosshandlarbiff',
    price: 295,
    description: 'A majestic pan-fried ribeye steak medallions sautéed with hickory-smoked bacon, sweet caramelized onions, and tender mushrooms, deglazed in a dark porter beer reduction sauce and served with grated horseradish.',
    category: 'mains',
    imageUrl: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&q=80&w=800',
    dietary: ['Dairy-Free', 'Gluten-Free'],
    signature: false
  },
  {
    id: 'main-4',
    name: 'Roasted Reindeer Loin',
    swedishName: 'Renytterfilé med Kantarellsås',
    price: 365,
    description: 'Pan-seared premium Lapland reindeer loin, roasted medium-rare. Accompanied by a luxurious forest golden chanterelle cream sauce, winter root vegetable potato terrine, and sweet blackcurrant jelly.',
    category: 'mains',
    imageUrl: 'https://images.unsplash.com/photo-1514516345957-556ca7d90a29?auto=format&fit=crop&q=80&w=800',
    dietary: ['Gluten-Free'],
    signature: true
  },
  {
    id: 'main-5',
    name: 'Fried Baltic Herring',
    swedishName: 'Stekt Strömming med Skirat Smör',
    price: 195,
    description: 'Crispiest pan-fried Baltic dwarf herring coated in crunchy rye flour, served swimming in golden clarified butter with potato mash, tart lingonberries, and sharp dill sprigs.',
    category: 'mains',
    imageUrl: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&q=80&w=800',
    dietary: ['Nut-free'],
    signature: false
  },

  // DESSERTS
  {
    id: 'dessert-1',
    name: 'Warm Swedish Curd Cake',
    swedishName: 'Småländsk Ostkaka',
    price: 125,
    description: 'Authentic warm almond curd cake baked to golden brown crust, served with rare, warm hand-picked Arctic cloudberries (the gold of the north) and fresh bourbon whipped cream.',
    category: 'desserts',
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=800',
    dietary: ['Contains Nuts'],
    signature: true
  },
  {
    id: 'dessert-2',
    name: 'Swedish Apple Pie with Vanilla Custard',
    swedishName: 'Klassisk Äppelkaka med Vaniljsås',
    price: 115,
    description: 'Cinnamon and cardamom spiced local Swedish apples baked under a rich, buttery almond-shingle oat crumble crust. Accompanied by velvety hot vanilla custard sauce.',
    category: 'desserts',
    imageUrl: 'https://images.unsplash.com/photo-1507226983735-a838615193b0?auto=format&fit=crop&q=80&w=800',
    dietary: ['Vegetarian'],
    signature: false
  },

  // DRINKS
  {
    id: 'drink-1',
    name: 'O.P. Anderson Aquavit',
    swedishName: 'O.P. Anderson Akvavit (5cl)',
    price: 110,
    description: 'The definitive organic Swedish snaps since 1891, spiced with aniseed, caraway, and fennel, aged in oak. Explodes on the palate alongside traditional herring.',
    category: 'drinks',
    imageUrl: 'https://images.unsplash.com/photo-1569529465841-dfeddcd7503b?auto=format&fit=crop&q=80&w=800',
    dietary: ['Gluten-Free', 'Vegan'],
    signature: true
  },
  {
    id: 'drink-2',
    name: 'Pelikan Special House IPA',
    swedishName: 'Pelikan Södermalm Pilsner',
    price: 95,
    description: 'Brewed locally in Södermalm, Stockholm. A crisp, organic unfiltered, citrus-forward modern lager designed to match the heavy cream gravy of husmanskost.',
    category: 'drinks',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=800',
    dietary: ['Vegan'],
    signature: false
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'review-1',
    name: 'Elena K. (Munich)',
    rating: 5,
    comment: 'Authentic beyond words. Sitting in the grand hall feels like steping directly into a 1910 novel. The meatballs are massive and easily the best in Stockholm, and the service was warm and dignified. An absolute bucket list item in Sweden.',
    date: '2026-04-18',
    source: 'TripAdvisor',
    visitReason: 'Heritage Dinner'
  },
  {
    id: 'review-2',
    name: 'Lars Bergström (Stockholm)',
    rating: 5,
    comment: 'Pelikan is Södermalms jewel. Many places try to dress up Swedish food, but Pelikan respects the humble roots and serves Husmanskost as it was meant to be—with robust flavors, incredible scale, and perfect pairings. The SOS plate and snaps are mandatory.',
    date: '2026-05-02',
    source: 'Local Legend',
    visitReason: 'Regular Family Friday'
  },
  {
    id: 'review-3',
    name: 'Marcus Vance (New York)',
    rating: 5,
    comment: 'The architectural design inside Krog Pelikan is stunning. Beautiful high-vaulted wood pillars and deep amber glass. Their reservation system made booking online so easy, and the cured salmon was extremely fresh. Highly professional!',
    date: '2026-05-14',
    source: 'Google',
    visitReason: 'Business Culinary Tour'
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'The Great Dining Hall',
    category: 'interior',
    imageUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=800',
    description: 'The monumental wood-paneled beer hall built in 1910, showing the iconic vaulted curves and authentic Jugendstil architecture.'
  },
  {
    id: 'gal-2',
    title: 'The Famous Meatballs',
    category: 'cuisine',
    imageUrl: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&q=80&w=800',
    description: 'Plate of Pelikan’s signature Swedish Köttbullar served with rich cream gravy, tart lingonberries, and butter-whipped potato puree.'
  },
  {
    id: 'gal-3',
    title: 'Historic Södermalm Corner',
    category: 'history',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
    description: 'Krog Pelikan stands tall as a beacon of Södermalm district history, preserving pre-war dining culture since relocating here over 115 years ago.'
  },
  {
    id: 'gal-4',
    title: 'Kristallen Bar Lounge',
    category: 'interior',
    imageUrl: 'https://images.unsplash.com/photo-1511018556340-d16986a1c194?auto=format&fit=crop&q=80&w=800',
    description: 'The sparkling Kristallen room, a luxurious and cozy bar adorned with vintage crystal chandeliers and rich mahogany paneling.'
  },
  {
    id: 'gal-5',
    title: 'The S.O.S Herring Board',
    category: 'cuisine',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
    description: 'Elegant arrangement of traditional herring fillets, mature Västerbotten cheese cuts, crisp rye bread, and hot boiled dill potatoes.'
  },
  {
    id: 'gal-6',
    title: 'The Spirit of Aquavit',
    category: 'cuisine',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=800',
    description: 'A selection of traditional Swedish schnapps and artisanal beers brewed locally to balance the rich rustic meals.'
  }
];
