export const CATEGORIES = [
  "biryani",
  "kebab",
  "bakery",
  "sweets",
  "street-food",
  "heritage",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type PriceRange = "৳" | "৳৳" | "৳৳৳";

export interface Spot {
  id: string;
  name: string;
  nameBn: string;
  category: Category;
  /** Approximate, lane-level coordinates. */
  lat: number;
  lng: number;
  area: string;
  famousFor: string;
  description: string;
  mustTry: string[];
  priceRange: PriceRange;
  /** Human-readable hours, shown as-is. */
  hours: string;
  /** Structured hours ("HH:MM", close may be "24:00") used for arrival-time warnings. */
  openTime: string;
  closeTime: string;
  /** 0 = Sunday … 6 = Saturday. */
  closedDays?: number[];
  /** Indicative spend per person in BDT: [low, high]. */
  costBdt: [number, number];
  /** Typical time spent eating / looking around, in minutes. */
  dwellMinutes: number;
  tips: string;
}

export const CATEGORY_META: Record<Category, { label: string; color: string; emoji: string }> = {
  biryani: { label: "Biryani & Kacchi", color: "#B4432B", emoji: "🍛" },
  kebab: { label: "Kebab & Grill", color: "#7A2E1C", emoji: "🍢" },
  bakery: { label: "Bakarkhani & Bakery", color: "#E59A1B", emoji: "🥯" },
  sweets: { label: "Sweets & Drinks", color: "#C2577A", emoji: "🍮" },
  "street-food": { label: "Street Food", color: "#5B6B2F", emoji: "🥟" },
  heritage: { label: "Heritage Stop", color: "#2F6B4F", emoji: "🏛️" },
};

export const SPOTS: Spot[] = [
  {
    id: "nanna-biryani",
    name: "Haji Nanna Biryani",
    nameBn: "হাজী নান্না বিরিয়ানি",
    category: "biryani",
    lat: 23.7148,
    lng: 90.4019,
    area: "Bechu Mia Lane, Moulvibazar",
    famousFor: "Morog polao and mutton kacchi",
    description:
      "One of Old Dhaka's best-known biryani houses. The morog polao — fragrant rice with a whole piece of chicken, egg and a light hand of ghee — is the dish people queue for.",
    mustTry: ["Morog polao", "Mutton kacchi", "Borhani"],
    priceRange: "৳৳",
    hours: "11:00 – 22:00",
    openTime: "11:00",
    closeTime: "22:00",
    costBdt: [300, 450],
    dwellMinutes: 35,
    tips: "Go before 1 pm or after 3 pm to avoid the lunch rush; order borhani to cut the richness.",
  },
  {
    id: "haji-biryani",
    name: "Haji Biryani",
    nameBn: "হাজীর বিরিয়ানি",
    category: "biryani",
    lat: 23.7191,
    lng: 90.4048,
    area: "Kazi Alauddin Road, Nazira Bazar",
    famousFor: "Mutton biryani served in leaf bowls since 1939",
    description:
      "A legendary narrow shop where goat-meat biryani is cooked in mustard oil and served on lotus-leaf plates. Often sells out by the afternoon.",
    mustTry: ["Mutton biryani (half plate)"],
    priceRange: "৳৳",
    hours: "Early morning until sold out",
    openTime: "07:00",
    closeTime: "15:00",
    costBdt: [250, 350],
    dwellMinutes: 25,
    tips: "Arrive by late morning — when the pots are empty they close.",
  },
  {
    id: "star-kabab",
    name: "Star Hotel & Kabab",
    nameBn: "স্টার হোটেল এন্ড কাবাব",
    category: "kebab",
    lat: 23.7183,
    lng: 90.4114,
    area: "Thatari Bazar",
    famousFor: "Mutton chaap, leg roast and brain masala",
    description:
      "A bustling multi-floor canteen famous for heavy Old-Dhaka style breakfasts and dinners: chaap with paratha, kebabs and rich curries at very fair prices.",
    mustTry: ["Mutton chaap with naan", "Shami kebab", "Firni"],
    priceRange: "৳৳",
    hours: "06:00 – 24:00",
    openTime: "06:00",
    closeTime: "24:00",
    costBdt: [250, 500],
    dwellMinutes: 35,
    tips: "Upstairs seating is calmer than the ground floor.",
  },
  {
    id: "al-razzak",
    name: "Hotel Al-Razzak",
    nameBn: "হোটেল আল-রাজ্জাক",
    category: "kebab",
    lat: 23.7211,
    lng: 90.4066,
    area: "North-South Road, Bangshal",
    famousFor: "Kacchi biryani and kebab platters",
    description:
      "A long-running family restaurant serving Old Dhaka classics — kacchi, rezala and grilled kebabs — in a busy, no-frills dining hall.",
    mustTry: ["Kacchi biryani", "Mutton rezala", "Lassi"],
    priceRange: "৳৳",
    hours: "07:00 – 23:00",
    openTime: "07:00",
    closeTime: "23:00",
    costBdt: [300, 600],
    dwellMinutes: 35,
    tips: "Good choice if you want a proper sit-down meal with a full menu.",
  },
  {
    id: "chankharpul-kebab",
    name: "Chankharpul Kebab Street",
    nameBn: "চানখারপুল কাবাব",
    category: "kebab",
    lat: 23.7232,
    lng: 90.3984,
    area: "Chankharpul, near Nazimuddin Road",
    famousFor: "Sutli kebab, chicken grill and naan by the roadside",
    description:
      "A cluster of evening grill shops where kebabs come straight off charcoal. Atmosphere is the point — smoke, crowds and fresh naan.",
    mustTry: ["Sutli kebab", "Beef boti", "Butter naan"],
    priceRange: "৳",
    hours: "17:00 – late",
    openTime: "17:00",
    closeTime: "24:00",
    costBdt: [200, 400],
    dwellMinutes: 30,
    tips: "An evening stop — most grills only fire up after sunset.",
  },
  {
    id: "bakarkhani-lalbagh",
    name: "Lalbagh Bakarkhani Bakeries",
    nameBn: "লালবাগের বাকরখানি",
    category: "bakery",
    lat: 23.7177,
    lng: 90.3909,
    area: "Lalbagh Road",
    famousFor: "Flaky, crisp bakarkhani baked in clay tandoors",
    description:
      "Rows of tiny bakeries slap layered dough against the walls of clay ovens to make bakarkhani, Old Dhaka's signature tea-time bread with Mughal roots.",
    mustTry: ["Plain bakarkhani", "Sweet (mishti) bakarkhani", "Cheese bakarkhani"],
    priceRange: "৳",
    hours: "07:00 – 21:00",
    openTime: "07:00",
    closeTime: "21:00",
    costBdt: [30, 80],
    dwellMinutes: 15,
    tips: "Buy straight from the oven and eat warm; ask to watch the tandoor.",
  },
  {
    id: "bakarkhani-amligola",
    name: "Amligola Bakarkhani Lane",
    nameBn: "আমলীগোলার বাকরখানি",
    category: "bakery",
    lat: 23.7158,
    lng: 90.3866,
    area: "Amligola, Lalbagh",
    famousFor: "Wholesale bakarkhani ovens",
    description:
      "A quieter lane of family-run bakarkhani ovens supplying shops across the city. Great place to see the bread being made at scale.",
    mustTry: ["Fresh bakarkhani by the dozen"],
    priceRange: "৳",
    hours: "06:00 – 20:00",
    openTime: "06:00",
    closeTime: "20:00",
    costBdt: [30, 80],
    dwellMinutes: 15,
    tips: "Mornings are the busiest baking hours — best for photos.",
  },
  {
    id: "lalbagh-fort",
    name: "Lalbagh Fort",
    nameBn: "লালবাগ কেল্লা",
    category: "heritage",
    lat: 23.7188,
    lng: 90.3882,
    area: "Lalbagh",
    famousFor: "Unfinished 17th-century Mughal fort",
    description:
      "Begun in 1678 by Prince Muhammad Azam and left unfinished, the fort holds the tomb of Pari Bibi, a mosque and the Diwan-i-Aam. A peaceful green break between meals.",
    mustTry: ["Pari Bibi's tomb", "Fort gardens at golden hour"],
    priceRange: "৳",
    hours: "10:00 – 17:00 (closed Sunday; hours vary)",
    openTime: "10:00",
    closeTime: "17:00",
    closedDays: [0],
    costBdt: [20, 50],
    dwellMinutes: 45,
    tips: "Pair with the bakarkhani bakeries a few minutes' walk away.",
  },
  {
    id: "alauddin-sweetmeat",
    name: "Alauddin Sweetmeat",
    nameBn: "আলাউদ্দিন সুইটমিট",
    category: "sweets",
    lat: 23.7183,
    lng: 90.3963,
    area: "Chawkbazar",
    famousFor: "Heritage sweetshop dating to the 1860s",
    description:
      "One of Dhaka's oldest sweet brands. Try the classic mishti, nimki and the famous halwa between savoury stops.",
    mustTry: ["Roshmalai", "Kalojam", "Nimki"],
    priceRange: "৳",
    hours: "09:00 – 22:00",
    openTime: "09:00",
    closeTime: "22:00",
    costBdt: [80, 200],
    dwellMinutes: 15,
    tips: "Get a small mixed box to carry along the trail.",
  },
  {
    id: "chawkbazar-iftar",
    name: "Chawkbazar Iftar Market",
    nameBn: "চকবাজারের ইফতার বাজার",
    category: "street-food",
    lat: 23.7176,
    lng: 90.3954,
    area: "Shahi Mosque Road, Chawkbazar",
    famousFor: "'Boro baper polay khay' and Ramadan street feasts",
    description:
      "During Ramadan the lanes around Chawkbazar Shahi Mosque turn into Dhaka's most famous iftar bazaar. Outside Ramadan the area still has shami kebab, jilapi and snacks stalls.",
    mustTry: ["Boro baper polay khay", "Shahi jilapi", "Suti kebab"],
    priceRange: "৳",
    hours: "Afternoons; peak before iftar in Ramadan",
    openTime: "14:00",
    closeTime: "21:00",
    costBdt: [100, 300],
    dwellMinutes: 30,
    tips: "Very crowded in Ramadan — keep valuables close and go with a friend.",
  },
  {
    id: "nazira-bazar-street",
    name: "Nazira Bazar Street Food",
    nameBn: "নাজিরা বাজার",
    category: "street-food",
    lat: 23.7198,
    lng: 90.4035,
    area: "Nazira Bazar",
    famousFor: "Bhuna khichuri, pitha and milk-tea stalls",
    description:
      "The dense heart of Old Dhaka's food scene — snack stalls, khichuri pots and tea shops packed together around the biryani houses.",
    mustTry: ["Bhuna khichuri", "Doodh cha", "Shingara"],
    priceRange: "৳",
    hours: "All day",
    openTime: "07:00",
    closeTime: "23:00",
    costBdt: [60, 150],
    dwellMinutes: 20,
    tips: "Use it as a snack stop between bigger meals.",
  },
  {
    id: "beauty-lassi",
    name: "Beauty Lassi & Faluda",
    nameBn: "বিউটি লাচ্ছি ও ফালুদা",
    category: "sweets",
    lat: 23.7124,
    lng: 90.4128,
    area: "Johnson Road, Raysaheb Bazar",
    famousFor: "Thick lassi and faluda since 1922",
    description:
      "A tiny century-old shop serving ice-cold lassi topped with malai and colourful faluda — the classic way to cool down after biryani.",
    mustTry: ["Malai lassi", "Faluda", "Lebur shorbot"],
    priceRange: "৳",
    hours: "09:00 – 22:00",
    openTime: "09:00",
    closeTime: "22:00",
    costBdt: [80, 150],
    dwellMinutes: 15,
    tips: "Ideal last stop of a walking tour on a hot afternoon.",
  },
  {
    id: "beauty-boarding",
    name: "Beauty Boarding",
    nameBn: "বিউটি বোর্ডিং",
    category: "heritage",
    lat: 23.7092,
    lng: 90.4115,
    area: "Shirishdas Lane, Banglabazar",
    famousFor: "Legendary 1949 literary adda and home-style rice meals",
    description:
      "A yellow colonial house where poets and artists gathered for decades. Still serves simple Bengali rice-and-fish lunches in its courtyard.",
    mustTry: ["Bhaat with fish curry", "Shorshe ilish (seasonal)"],
    priceRange: "৳",
    hours: "11:00 – 22:00",
    openTime: "11:00",
    closeTime: "22:00",
    costBdt: [150, 300],
    dwellMinutes: 40,
    tips: "Ask about the walls of photos — the staff love sharing its history.",
  },
  {
    id: "ahsan-manzil",
    name: "Ahsan Manzil",
    nameBn: "আহসান মঞ্জিল",
    category: "heritage",
    lat: 23.7086,
    lng: 90.4061,
    area: "Kumartoli, on the Buriganga",
    famousFor: "The pink palace of the Dhaka Nawabs",
    description:
      "The 19th-century residence of the Nawabs of Dhaka, now a museum. The riverfront gives a great view of boat traffic on the Buriganga.",
    mustTry: ["Museum galleries", "Riverfront view"],
    priceRange: "৳",
    hours: "10:30 – 17:30 (closed Thursday; hours vary)",
    openTime: "10:30",
    closeTime: "17:30",
    closedDays: [4],
    costBdt: [20, 50],
    dwellMinutes: 50,
    tips: "Combine with Beauty Boarding and Beauty Lassi for a southern loop.",
  },
  {
    id: "shakhari-bazar",
    name: "Shakhari Bazar",
    nameBn: "শাঁখারী বাজার",
    category: "street-food",
    lat: 23.7097,
    lng: 90.4092,
    area: "Shakhari Bazar",
    famousFor: "Conch-shell artisans and Hindu sweet & snack stalls",
    description:
      "A narrow, centuries-old street of conch-shell bangle makers with sweetshops and snack stalls tucked between the workshops.",
    mustTry: ["Sandesh", "Nimki", "Ghugni"],
    priceRange: "৳",
    hours: "10:00 – 21:00",
    openTime: "10:00",
    closeTime: "21:00",
    costBdt: [60, 150],
    dwellMinutes: 25,
    tips: "Look up — the tall, thin heritage houses are as famous as the food.",
  },
];

export const SPOT_BY_ID: ReadonlyMap<string, Spot> = new Map(SPOTS.map((s) => [s.id, s]));

export const OLD_DHAKA_CENTER: [number, number] = [23.7155, 90.4005];
