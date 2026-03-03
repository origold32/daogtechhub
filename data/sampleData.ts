export interface Gadget {
  id: string;
  name: string;
  brand: string;
  type: "phone" | "laptop" | "game" | "tablet" | "accessory";
  price: number;
  image: string;
  description: string;
  condition: string;
  specs: Record<string, string>;
}

export interface Jersey {
  id: string;
  name: string;
  team: string;
  type: "club" | "country" | "nfl" | "basketball" | "retro";
  category: "current" | "retro" | "special";
  price: number;
  image: string;
  description: string;
  size: string[];
  season: string;
}

export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  image: string;
  description: string;
  mileage: string;
  condition: string;
  fuelType: string;
  transmission: string;
}

export interface RealEstate {
  id: string;
  name: string;
  type: "house" | "land" | "apartment" | "commercial";
  location: string;
  price: number;
  image: string;
  description: string;
  size: string;
  bedrooms?: number;
  bathrooms?: number;
  features: string[];
}

export const gadgets: Gadget[] = [
  {
    id: "g1",
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    type: "phone",
    price: 1250000,
    image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500&auto=format&fit=crop",
    description: "Latest iPhone with titanium design and A17 Pro chip",
    condition: "Brand New",
    specs: { storage: "256GB", color: "Natural Titanium", battery: "100%" },
  },
  {
    id: "g2",
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    type: "phone",
    price: 1150000,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&auto=format&fit=crop",
    description: "Flagship Android with S Pen and AI features",
    condition: "Brand New",
    specs: { storage: "512GB", color: "Titanium Gray", battery: "100%" },
  },
  {
    id: "g3",
    name: "MacBook Pro 16\" M3",
    brand: "Apple",
    type: "laptop",
    price: 2800000,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=500&auto=format&fit=crop",
    description: "Professional laptop with M3 Max chip",
    condition: "Brand New",
    specs: { ram: "32GB", storage: "1TB SSD", display: "16.2\" Liquid Retina" },
  },
  {
    id: "g4",
    name: "Dell XPS 15",
    brand: "Dell",
    type: "laptop",
    price: 1500000,
    image: "https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=500&auto=format&fit=crop",
    description: "Premium Windows laptop with InfinityEdge display",
    condition: "Used - Like New",
    specs: { ram: "16GB", storage: "512GB SSD", display: "15.6\" 4K OLED" },
  },
  {
    id: "g5",
    name: "PlayStation 5",
    brand: "Sony",
    type: "game",
    price: 550000,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop",
    description: "Next-gen gaming console with DualSense controller",
    condition: "Brand New",
    specs: { storage: "825GB SSD", edition: "Standard", color: "White" },
  },
  {
    id: "g6",
    name: "Xbox Series X",
    brand: "Microsoft",
    type: "game",
    price: 500000,
    image: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=500&auto=format&fit=crop",
    description: "Most powerful Xbox with 12 teraflops",
    condition: "Brand New",
    specs: { storage: "1TB SSD", edition: "Standard", color: "Black" },
  },
  {
    id: "g7",
    name: "iPad Pro 12.9\" M2",
    brand: "Apple",
    type: "tablet",
    price: 950000,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop",
    description: "Professional tablet with M2 chip and mini-LED",
    condition: "Used - Excellent",
    specs: { storage: "256GB", color: "Space Gray", connectivity: "Wi-Fi + Cellular" },
  },
  {
    id: "g8",
    name: "AirPods Pro 2",
    brand: "Apple",
    type: "accessory",
    price: 180000,
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&auto=format&fit=crop",
    description: "Premium noise-canceling earbuds",
    condition: "Brand New",
    specs: { color: "White", case: "MagSafe", features: "ANC, Spatial Audio" },
  },
  {
    id: "g9",
    name: "HP Spectre x360",
    brand: "HP",
    type: "laptop",
    price: 1200000,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop",
    description: "2-in-1 convertible laptop with OLED display",
    condition: "Used - Good",
    specs: { ram: "16GB", storage: "1TB SSD", display: "13.5\" 3K2K OLED" },
  },
  {
    id: "g10",
    name: "Google Pixel 8 Pro",
    brand: "Google",
    type: "phone",
    price: 750000,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop",
    description: "AI-powered smartphone with best-in-class camera",
    condition: "Brand New",
    specs: { storage: "128GB", color: "Obsidian", battery: "100%" },
  },
];

export const jerseys: Jersey[] = [
  {
    id: "j1",
    name: "Real Madrid Home 2024/25",
    team: "Real Madrid",
    type: "club",
    category: "current",
    price: 45000,
    image: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=500&auto=format&fit=crop",
    description: "Official home jersey with sponsor logos",
    size: ["S", "M", "L", "XL", "XXL"],
    season: "2024/25",
  },
  {
    id: "j2",
    name: "Barcelona Home 2024/25",
    team: "Barcelona",
    type: "club",
    category: "current",
    price: 42000,
    image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=500&auto=format&fit=crop",
    description: "Authentic home kit with Dri-FIT technology",
    size: ["S", "M", "L", "XL"],
    season: "2024/25",
  },
  {
    id: "j3",
    name: "Manchester United Home 2024/25",
    team: "Manchester United",
    type: "club",
    category: "current",
    price: 40000,
    image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=500&auto=format&fit=crop",
    description: "Official home jersey with club crest",
    size: ["M", "L", "XL", "XXL"],
    season: "2024/25",
  },
  {
    id: "j4",
    name: "Nigeria Super Eagles 2024",
    team: "Nigeria",
    type: "country",
    category: "current",
    price: 35000,
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&auto=format&fit=crop",
    description: "National team home jersey",
    size: ["S", "M", "L", "XL"],
    season: "2024",
  },
  {
    id: "j5",
    name: "Brazil Home 2024",
    team: "Brazil",
    type: "country",
    category: "current",
    price: 38000,
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=500&auto=format&fit=crop",
    description: "Iconic yellow and green jersey",
    size: ["S", "M", "L", "XL", "XXL"],
    season: "2024",
  },
  {
    id: "j6",
    name: "Kansas City Chiefs Jersey",
    team: "Kansas City Chiefs",
    type: "nfl",
    category: "current",
    price: 55000,
    image: "https://images.unsplash.com/photo-1508609540374-67d1601ba520?w=500&auto=format&fit=crop",
    description: "Official NFL game jersey",
    size: ["M", "L", "XL", "XXL"],
    season: "2024",
  },
  {
    id: "j7",
    name: "LA Lakers LeBron James",
    team: "LA Lakers",
    type: "basketball",
    category: "current",
    price: 48000,
    image: "https://images.unsplash.com/photo-1519861531473-9200263931a2?w=500&auto=format&fit=crop",
    description: "Swingman jersey with player name",
    size: ["S", "M", "L", "XL"],
    season: "2024",
  },
  {
    id: "j8",
    name: "Arsenal Invincibles 2003/04",
    team: "Arsenal",
    type: "club",
    category: "retro",
    price: 60000,
    image: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=500&auto=format&fit=crop",
    description: "Classic retro jersey from the unbeaten season",
    size: ["M", "L", "XL"],
    season: "2003/04",
  },
  {
    id: "j9",
    name: "AC Milan 2007 UCL Final",
    team: "AC Milan",
    type: "club",
    category: "retro",
    price: 55000,
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=500&auto=format&fit=crop",
    description: "Champions League final retro jersey",
    size: ["L", "XL", "XXL"],
    season: "2006/07",
  },
  {
    id: "j10",
    name: "Golden State Warriors Curry",
    team: "Golden State Warriors",
    type: "basketball",
    category: "current",
    price: 50000,
    image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=500&auto=format&fit=crop",
    description: "Stephen Curry city edition jersey",
    size: ["S", "M", "L", "XL"],
    season: "2024",
  },
];

export const cars: Car[] = [
  {
    id: "c1",
    name: "Toyota Camry XSE",
    brand: "Toyota",
    model: "Camry",
    year: 2023,
    price: 18500000,
    image: "https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?w=500&auto=format&fit=crop",
    description: "Sporty sedan with premium features",
    mileage: "15,000 km",
    condition: "Used - Excellent",
    fuelType: "Petrol",
    transmission: "Automatic",
  },
  {
    id: "c2",
    name: "Lexus RX 350",
    brand: "Lexus",
    model: "RX",
    year: 2022,
    price: 42000000,
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=500&auto=format&fit=crop",
    description: "Luxury SUV with spacious interior",
    mileage: "25,000 km",
    condition: "Used - Excellent",
    fuelType: "Petrol",
    transmission: "Automatic",
  },
  {
    id: "c3",
    name: "Mercedes-Benz C300",
    brand: "Mercedes-Benz",
    model: "C-Class",
    year: 2023,
    price: 35000000,
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500&auto=format&fit=crop",
    description: "Executive sedan with premium comfort",
    mileage: "12,000 km",
    condition: "Used - Like New",
    fuelType: "Petrol",
    transmission: "Automatic",
  },
  {
    id: "c4",
    name: "BMW X5 xDrive40i",
    brand: "BMW",
    model: "X5",
    year: 2022,
    price: 55000000,
    image: "https://images.unsplash.com/photo-1556189250-72ba95452da9?w=500&auto=format&fit=crop",
    description: "Premium SUV with advanced technology",
    mileage: "30,000 km",
    condition: "Used - Excellent",
    fuelType: "Petrol",
    transmission: "Automatic",
  },
  {
    id: "c5",
    name: "Honda Accord Touring",
    brand: "Honda",
    model: "Accord",
    year: 2023,
    price: 22000000,
    image: "https://images.unsplash.com/photo-1605816988079-7f58c9bda35b?w=500&auto=format&fit=crop",
    description: "Reliable family sedan with modern features",
    mileage: "8,000 km",
    condition: "Used - Like New",
    fuelType: "Petrol",
    transmission: "CVT",
  },
  {
    id: "c6",
    name: "Range Rover Sport",
    brand: "Land Rover",
    model: "Range Rover Sport",
    year: 2021,
    price: 75000000,
    image: "https://images.unsplash.com/photo-1606220838315-056192d5e927?w=500&auto=format&fit=crop",
    description: "Luxury off-road SUV with commanding presence",
    mileage: "45,000 km",
    condition: "Used - Good",
    fuelType: "Diesel",
    transmission: "Automatic",
  },
  {
    id: "c7",
    name: "Toyota Corolla LE",
    brand: "Toyota",
    model: "Corolla",
    year: 2024,
    price: 12000000,
    image: "https://images.unsplash.com/photo-1623869675781-23b97332777c?w=500&auto=format&fit=crop",
    description: "Compact sedan with excellent fuel economy",
    mileage: "0 km",
    condition: "Brand New",
    fuelType: "Petrol",
    transmission: "CVT",
  },
  {
    id: "c8",
    name: "Audi A4 Premium",
    brand: "Audi",
    model: "A4",
    year: 2022,
    price: 28000000,
    image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=500&auto=format&fit=crop",
    description: "German engineering with elegant design",
    mileage: "35,000 km",
    condition: "Used - Good",
    fuelType: "Petrol",
    transmission: "Automatic",
  },
];

export const realEstates: RealEstate[] = [
  {
    id: "r1",
    name: "Luxury 5-Bedroom Duplex",
    type: "house",
    location: "Lekki, Lagos",
    price: 150000000,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500&auto=format&fit=crop",
    description: "Modern duplex with swimming pool and smart home features",
    size: "600 sqm",
    bedrooms: 5,
    bathrooms: 6,
    features: ["Swimming Pool", "Smart Home", "Security", "Parking"],
  },
  {
    id: "r2",
    name: "Prime Land Plot",
    type: "land",
    location: "Ibeju-Lekki, Lagos",
    price: 25000000,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&auto=format&fit=crop",
    description: "Strategic land for residential or commercial development",
    size: "1000 sqm",
    features: ["Fenced", "Road Access", "Dry Land"],
  },
  {
    id: "r3",
    name: "3-Bedroom Apartment",
    type: "apartment",
    location: "Ikoyi, Lagos",
    price: 85000000,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&auto=format&fit=crop",
    description: "Serviced apartment in high-rise building with amenities",
    size: "200 sqm",
    bedrooms: 3,
    bathrooms: 3,
    features: ["Gym", "Elevator", "24/7 Power", "Security"],
  },
  {
    id: "r4",
    name: "4-Bedroom Terrace House",
    type: "house",
    location: "Victoria Island, Lagos",
    price: 120000000,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&auto=format&fit=crop",
    description: "Contemporary terrace in gated estate",
    size: "400 sqm",
    bedrooms: 4,
    bathrooms: 5,
    features: ["Gated Estate", "Garden", "Parking", "Security"],
  },
  {
    id: "r5",
    name: "Commercial Plaza Space",
    type: "commercial",
    location: "Ikeja, Lagos",
    price: 200000000,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop",
    description: "Prime commercial property for office or retail",
    size: "1500 sqm",
    features: ["Parking", "Elevator", "Generator", "AC"],
  },
  {
    id: "r6",
    name: "2-Bedroom Flat",
    type: "apartment",
    location: "Yaba, Lagos",
    price: 35000000,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&auto=format&fit=crop",
    description: "Affordable apartment in tech hub area",
    size: "120 sqm",
    bedrooms: 2,
    bathrooms: 2,
    features: ["Parking", "Prepaid Meter", "Water"],
  },
  {
    id: "r7",
    name: "Beachfront Land",
    type: "land",
    location: "Epe, Lagos",
    price: 45000000,
    image: "https://images.unsplash.com/photo-1433838552652-f9a46b332c40?w=500&auto=format&fit=crop",
    description: "Ocean view land perfect for resort development",
    size: "5000 sqm",
    features: ["Beach Access", "Road Access", "Survey Plan"],
  },
  {
    id: "r8",
    name: "Penthouse Suite",
    type: "apartment",
    location: "Banana Island, Lagos",
    price: 250000000,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500&auto=format&fit=crop",
    description: "Ultra-luxury penthouse with panoramic views",
    size: "500 sqm",
    bedrooms: 4,
    bathrooms: 5,
    features: ["Rooftop Terrace", "Private Pool", "Smart Home", "Concierge"],
  },
];
