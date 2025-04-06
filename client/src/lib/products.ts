import { Product, ProductStatus, ProductCondition } from "@/types/product";

export const products: Product[] = [
  {
    id: "1",
    name: "Tesla Model S",
    price: 79999,
    description: "Electric luxury sedan with insane acceleration. The Tesla Model S is an all-electric five-door liftback sedan produced by Tesla, Inc. The Model S features a dual-motor all-wheel drive setup and has one of the lowest drag coefficients of any production car.",
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=2064&auto=format&fit=crop",
    category: "cars",
    status: "available",
    condition: "new",
    mileage: 0
  },
  {
    id: "2",
    name: "Yamaha R1",
    price: 17499,
    description: "Superbike performance for the streets. The Yamaha YZF-R1 is a sport motorcycle packed with MotoGP technology, featuring a high-revving crossplane crankshaft engine and advanced electronics package.",
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=2070&auto=format&fit=crop",
    category: "motorcycles",
    status: "available",
    condition: "pre-owned",
    mileage: 3450
  },
  {
    id: "3",
    name: "iPhone 15 Pro",
    price: 999,
    description: "Apple's latest flagship phone with Titanium body. Features the A17 Pro chip, a 48MP main camera with innovative low-light capture, and an industry-leading ProMotion display.",
    image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=2070&auto=format&fit=crop",
    category: "phones",
    status: "available",
    condition: "new"
  },
  {
    id: "4",
    name: "BMW i8",
    price: 147500,
    description: "Hybrid sports car with futuristic design and butterfly doors. The BMW i8 combines a turbocharged three-cylinder engine with an electric motor for exhilarating performance while maintaining impressive fuel efficiency.",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop",
    category: "cars",
    status: "reserved",
    condition: "pre-owned",
    mileage: 12500
  },
  {
    id: "5",
    name: "Audi R8",
    price: 169900,
    description: "Mid-engine supercar with Quattro all-wheel drive. The Audi R8 features a naturally aspirated V10 engine, offering breathtaking acceleration and the stability of Audi's legendary Quattro system.",
    image: "https://images.unsplash.com/photo-1619362280286-f1f8fd5032ed?q=80&w=1901&auto=format&fit=crop",
    category: "cars",
    status: "available",
    condition: "new",
    mileage: 0
  },
  {
    id: "6",
    name: "Ducati Panigale V4",
    price: 23295,
    description: "The pinnacle of Ducati sports bikes. The Panigale V4 is powered by a 1,103cc Desmosedici Stradale engine derived from MotoGP, producing 214 horsepower in a lightweight, agile chassis.",
    image: "https://images.unsplash.com/photo-1568708587290-62507254950c?q=80&w=2070&auto=format&fit=crop",
    category: "motorcycles",
    status: "available",
    condition: "new",
    mileage: 0
  },
  {
    id: "7",
    name: "Samsung Galaxy S23 Ultra",
    price: 1199,
    description: "Samsung's flagship smartphone with 200MP camera. Features the Snapdragon 8 Gen 2 processor, S Pen functionality, and a stunning 6.8-inch Dynamic AMOLED 2X display.",
    image: "https://images.unsplash.com/photo-1675785931264-578d09aaff60?q=80&w=2071&auto=format&fit=crop",
    category: "phones",
    status: "available",
    condition: "new"
  },
  {
    id: "8",
    name: "Porsche 911 GT3",
    price: 169700,
    description: "Track-focused variant of the iconic 911. The GT3 features a naturally aspirated 4.0-liter flat-six engine, aerodynamic enhancements, and suspension tuned for maximum performance on both road and track.",
    image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=2070&auto=format&fit=crop",
    category: "cars",
    status: "sold",
    condition: "pre-owned",
    mileage: 8900
  },
  {
    id: "9",
    name: "Google Pixel 7 Pro",
    price: 899,
    description: "Google's premium smartphone with advanced AI capabilities. Features the Google Tensor G2 chip, a versatile camera system with 5x telephoto, and a smooth 120Hz LTPO display.",
    image: "https://images.unsplash.com/photo-1666863668501-1584fd38f3bd?q=80&w=2070&auto=format&fit=crop",
    category: "phones",
    status: "available",
    condition: "pre-owned"
  }
];

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => product.category === category);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const categoryDescriptions = {
  cars: "Luxury and performance vehicles to elevate your driving experience.",
  motorcycles: "High-performance bikes for the ultimate riding adventure.",
  phones: "The latest and greatest in smartphone technology."
};
