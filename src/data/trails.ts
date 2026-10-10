export interface CuratedTrail {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  /** Suggested start time, "HH:MM". */
  bestStart: string;
  spotIds: string[];
}

export const TRAILS: CuratedTrail[] = [
  {
    id: "biryani-crawl",
    name: "The Biryani Crawl",
    emoji: "🍛",
    tagline: "Three legendary pots, half plates only, a lassi to finish.",
    bestStart: "11:00",
    spotIds: ["haji-biryani", "nazira-bazar-street", "nanna-biryani", "al-razzak", "beauty-lassi"],
  },
  {
    id: "mughal-heritage",
    name: "Mughal Heritage Walk",
    emoji: "🏛️",
    tagline: "Lalbagh Fort, warm bakarkhani and a 160-year-old sweetshop.",
    bestStart: "12:30",
    spotIds: ["lalbagh-fort", "bakarkhani-amligola", "bakarkhani-lalbagh", "alauddin-sweetmeat", "chawkbazar-iftar"],
  },
  {
    id: "riverside-south",
    name: "Riverside & Old Bookstreets",
    emoji: "⛵",
    tagline: "The pink palace, conch-shell lanes and a literary lunch.",
    bestStart: "10:30",
    spotIds: ["ahsan-manzil", "shakhari-bazar", "beauty-boarding", "beauty-lassi", "star-kabab"],
  },
  {
    id: "sweet-tooth",
    name: "Sweet Tooth Trail",
    emoji: "🍮",
    tagline: "Bakarkhani, mishti, sandesh and faluda — dessert all the way.",
    bestStart: "15:00",
    spotIds: ["bakarkhani-lalbagh", "alauddin-sweetmeat", "shakhari-bazar", "beauty-lassi"],
  },
  {
    id: "night-grill",
    name: "After-Dark Grill Night",
    emoji: "🔥",
    tagline: "Charcoal kebabs at Chankharpul, chaap at Star, lassi nightcap.",
    bestStart: "18:00",
    spotIds: ["chankharpul-kebab", "al-razzak", "star-kabab", "beauty-lassi"],
  },
];

export const TRAIL_BY_ID: ReadonlyMap<string, CuratedTrail> = new Map(TRAILS.map((t) => [t.id, t]));
