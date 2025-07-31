/**
 * Моки данных автомобилей для разработки и тестирования
 * Структура соответствует API Che168.com
 */

/**
 * @typedef {import('../types/vehicle').Vehicle} Vehicle
 */

/**
 * @type {Vehicle[]}
 */
export const mockVehicles = [
  {
    id: "che168_12345",
    title: "2023 比亚迪汉 EV 创世版",
    english_title: "2023 BYD Han EV Creation Edition",
    brand: "BYD",
    model: "Han",
    trim: "Creation Edition",
    year: 2023,
    engine: "Electric",
    transmission: "Single-speed",
    fuel_type: "Electric",
    mileage: {
      value: 8000,
      unit: "km",
      formatted: "8,000 км"
    },
    price: {
      amount: 280000,
      currency: "CNY",
      formatted: "¥280,000",
      negotiable: true
    },
    location: {
      city: "Beijing",
      region: "Chaoyang District",
      address: "朝阳区建国门外大街1号",
      coordinates: {
        lat: 39.9042,
        lng: 116.4074
      }
    },
    seller: {
      type: "dealer",
      name: "北京比亚迪4S店",
      english_name: "Beijing BYD 4S Store",
      rating: 4.6,
      reviews_count: 89,
      certified: true,
      phone: "+86-10-1234-5678"
    },
    specifications: {
      battery_capacity: "85.4kWh",
      range: "715km",
      power: "380kW",
      torque: "700Nm",
      acceleration: "3.9s (0-100km/h)",
      seats: 5,
      doors: 4,
      color: "Dragon Red",
      interior_color: "Black"
    },
    features: [
      "Electric Vehicle", 
      "Long Range Battery", 
      "Fast Charging", 
      "Autonomous Driving", 
      "Premium Sound System", 
      "Panoramic Sunroof"
    ],
    history: {
      accident_free: true,
      owners_count: 1,
      import_type: "domestic",
      warranty: "8 years battery warranty"
    },
    market_data: {
      days_listed: 5,
      views: 75,
      price_trend: "stable",
      market_position: "competitive"
    },
    images: [
      "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop"
    ]
  },
  {
    id: "che168_23456",
    title: "2022 蔚来 ES8",
    english_title: "2022 NIO ES8",
    brand: "NIO",
    model: "ES8",
    trim: "Premium",
    year: 2022,
    engine: "Electric",
    transmission: "Single-speed",
    fuel_type: "Electric",
    mileage: {
      value: 15000,
      unit: "km",
      formatted: "15,000 км"
    },
    price: {
      amount: 420000,
      currency: "CNY",
      formatted: "¥420,000",
      negotiable: false
    },
    location: {
      city: "Shanghai",
      region: "Pudong District",
      address: "浦东新区世纪大道1号",
      coordinates: {
        lat: 31.2304,
        lng: 121.4737
      }
    },
    seller: {
      type: "dealer",
      name: "上海蔚来汽车",
      english_name: "Shanghai NIO Auto",
      rating: 4.8,
      reviews_count: 156,
      certified: true,
      phone: "+86-21-5678-9012"
    },
    specifications: {
      battery_capacity: "100kWh",
      range: "580km",
      power: "480kW",
      torque: "840Nm",
      acceleration: "4.1s (0-100km/h)",
      seats: 7,
      doors: 5,
      color: "Pearl White",
      interior_color: "Beige"
    },
    features: [
      "7 Seats",
      "Battery Swap",
      "Air Suspension", 
      "NOMI AI Assistant",
      "Premium Interior",
      "Advanced Driver Assistance"
    ],
    history: {
      accident_free: true,
      owners_count: 1,
      import_type: "domestic",
      warranty: "3 years comprehensive warranty"
    },
    market_data: {
      days_listed: 12,
      views: 143,
      price_trend: "rising",
      market_position: "premium"
    },
    images: [
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop"
    ]
  },
  {
    id: "che168_34567",
    title: "2021 特斯拉 Model 3",
    english_title: "2021 Tesla Model 3",
    brand: "Tesla",
    model: "Model 3",
    trim: "Performance",
    year: 2021,
    engine: "Electric",
    transmission: "Single-speed",
    fuel_type: "Electric",
    mileage: {
      value: 25000,
      unit: "km",
      formatted: "25,000 км"
    },
    price: {
      amount: 260000,
      currency: "CNY",
      formatted: "¥260,000",
      negotiable: true
    },
    location: {
      city: "Shenzhen",
      region: "Nanshan District",
      address: "南山区科技园南区1号",
      coordinates: {
        lat: 22.5431,
        lng: 114.0579
      }
    },
    seller: {
      type: "private",
      name: "私人卖家",
      english_name: "Private Seller",
      rating: 4.2,
      reviews_count: 23,
      certified: false,
      phone: "+86-138-0013-8000"
    },
    specifications: {
      battery_capacity: "75kWh",
      range: "460km",
      power: "340kW",
      torque: "639Nm",
      acceleration: "3.3s (0-100km/h)",
      seats: 5,
      doors: 4,
      color: "Midnight Silver",
      interior_color: "Black"
    },
    features: [
      "Performance Version",
      "Autopilot",
      "Premium Connectivity",
      "Track Mode",
      "Sport Wheels",
      "Glass Roof"
    ],
    history: {
      accident_free: false,
      owners_count: 2,
      import_type: "imported",
      warranty: "1 year remaining"
    },
    market_data: {
      days_listed: 28,
      views: 89,
      price_trend: "declining",
      market_position: "competitive"
    },
    images: [
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop"
    ]
  },
  {
    id: "che168_45678",
    title: "2023 小鹏 P7",
    english_title: "2023 XPeng P7",
    brand: "XPeng",
    model: "P7",
    trim: "AWD Performance",
    year: 2023,
    engine: "Electric",
    transmission: "Single-speed",
    fuel_type: "Electric",
    mileage: {
      value: 3500,
      unit: "km",
      formatted: "3,500 км"
    },
    price: {
      amount: 320000,
      currency: "CNY",
      formatted: "¥320,000",
      negotiable: false
    },
    location: {
      city: "Guangzhou",
      region: "Tianhe District",
      address: "天河区珠江新城1号",
      coordinates: {
        lat: 23.1291,
        lng: 113.2644
      }
    },
    seller: {
      type: "dealer",
      name: "广州小鹏汽车",
      english_name: "Guangzhou XPeng Motors",
      rating: 4.7,
      reviews_count: 67,
      certified: true,
      phone: "+86-20-8765-4321"
    },
    specifications: {
      battery_capacity: "80.9kWh",
      range: "670km",
      power: "316kW",
      torque: "655Nm",
      acceleration: "4.3s (0-100km/h)",
      seats: 5,
      doors: 4,
      color: "Space Gray",
      interior_color: "Orange"
    },
    features: [
      "NGP Highway Pilot",
      "XPILOT 3.0",
      "Scissor Doors",
      "Premium Audio",
      "Ambient Lighting",
      "Smart Cockpit"
    ],
    history: {
      accident_free: true,
      owners_count: 1,
      import_type: "domestic",
      warranty: "4 years warranty remaining"
    },
    market_data: {
      days_listed: 8,
      views: 67,
      price_trend: "stable",
      market_position: "premium"
    },
    images: [
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1502877828070-33b89f1da9a2?w=800&h=600&fit=crop"
    ]
  },
  {
    id: "che168_56789",
    title: "2020 奥迪 e-tron",
    english_title: "2020 Audi e-tron",
    brand: "Audi",
    model: "e-tron",
    trim: "55 quattro",
    year: 2020,
    engine: "Electric",
    transmission: "Single-speed",
    fuel_type: "Electric",
    mileage: {
      value: 45000,
      unit: "km",
      formatted: "45,000 км"
    },
    price: {
      amount: 380000,
      currency: "CNY",
      formatted: "¥380,000",
      negotiable: true
    },
    location: {
      city: "Hangzhou",
      region: "West Lake District",
      address: "西湖区文三路1号",
      coordinates: {
        lat: 30.2741,
        lng: 120.1551
      }
    },
    seller: {
      type: "dealer",
      name: "杭州奥迪中心",
      english_name: "Hangzhou Audi Center",
      rating: 4.5,
      reviews_count: 134,
      certified: true,
      phone: "+86-571-1234-5678"
    },
    specifications: {
      battery_capacity: "95kWh",
      range: "470km",
      power: "300kW",
      torque: "664Nm",
      acceleration: "5.7s (0-100km/h)",
      seats: 5,
      doors: 5,
      color: "Glacier White",
      interior_color: "Black"
    },
    features: [
      "Quattro AWD",
      "Virtual Cockpit",
      "Air Suspension",
      "Matrix LED Lights",
      "Premium Plus Package",
      "Bang & Olufsen Audio"
    ],
    history: {
      accident_free: true,
      owners_count: 2,
      import_type: "imported",
      warranty: "2 years warranty remaining"
    },
    market_data: {
      days_listed: 18,
      views: 92,
      price_trend: "stable",
      market_position: "luxury"
    },
    images: [
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&h=600&fit=crop"
    ]
  },
  {
    id: "che168_67890",
    title: "2022 BMW iX3",
    english_title: "2022 BMW iX3",
    brand: "BMW",
    model: "iX3",
    trim: "xDrive30",
    year: 2022,
    engine: "Electric",
    transmission: "Single-speed",
    fuel_type: "Electric",
    mileage: {
      value: 18000,
      unit: "km",
      formatted: "18,000 км"
    },
    price: {
      amount: 410000,
      currency: "CNY",
      formatted: "¥410,000",
      negotiable: false
    },
    location: {
      city: "Chengdu",
      region: "Jinjiang District",
      address: "锦江区春熙路1号",
      coordinates: {
        lat: 30.5728,
        lng: 104.0668
      }
    },
    seller: {
      type: "dealer",
      name: "成都宝马中心",
      english_name: "Chengdu BMW Center",
      rating: 4.6,
      reviews_count: 78,
      certified: true,
      phone: "+86-28-9876-5432"
    },
    specifications: {
      battery_capacity: "74kWh",
      range: "500km",
      power: "210kW",
      torque: "400Nm",
      acceleration: "6.8s (0-100km/h)",
      seats: 5,
      doors: 5,
      color: "Storm Bay",
      interior_color: "Cognac"
    },
    features: [
      "xDrive AWD",
      "iDrive 7.0",
      "Harman Kardon Audio",
      "Comfort Access",
      "Parking Assistant",
      "Live Cockpit Professional"
    ],
    history: {
      accident_free: true,
      owners_count: 1,
      import_type: "imported",
      warranty: "3 years warranty remaining"
    },
    market_data: {
      days_listed: 21,
      views: 134,
      price_trend: "rising",
      market_position: "luxury"
    },
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800&h=600&fit=crop"
    ]
  }
];

/**
 * Функция для получения случайных автомобилей (имитация API)
 * @param {number} count - Количество автомобилей
 * @returns {Vehicle[]}
 */
export const getRandomVehicles = (count = 6) => {
  const shuffled = [...mockVehicles].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, mockVehicles.length));
};

/**
 * Функция для получения автомобиля по ID (имитация API)
 * @param {string} id - ID автомобиля
 * @returns {Vehicle|null}
 */
export const getVehicleById = (id) => {
  return mockVehicles.find(vehicle => vehicle.id === id) || null;
};

/**
 * Функция для поиска автомобилей (имитация API)
 * @param {Object} filters - Фильтры поиска
 * @returns {Vehicle[]}
 */
export const searchVehicles = (filters = {}) => {
  let filtered = [...mockVehicles];

  if (filters.brand) {
    filtered = filtered.filter(v => 
      v.brand.toLowerCase().includes(filters.brand.toLowerCase())
    );
  }

  if (filters.fuel_type) {
    filtered = filtered.filter(v => 
      v.fuel_type.toLowerCase() === filters.fuel_type.toLowerCase()
    );
  }

  if (filters.year_from) {
    filtered = filtered.filter(v => v.year >= filters.year_from);
  }

  if (filters.year_to) {
    filtered = filtered.filter(v => v.year <= filters.year_to);
  }

  if (filters.price_min) {
    filtered = filtered.filter(v => v.price.amount >= filters.price_min);
  }

  if (filters.price_max) {
    filtered = filtered.filter(v => v.price.amount <= filters.price_max);
  }

  if (filters.city) {
    filtered = filtered.filter(v => 
      v.location.city.toLowerCase().includes(filters.city.toLowerCase())
    );
  }

  return filtered;
}; 