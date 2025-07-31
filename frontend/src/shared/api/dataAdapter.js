/**
 * Адаптер данных для преобразования Backend API в Frontend структуру
 */

/**
 * Преобразует цену из backend формата в frontend формат
 * @param {string} backendPrice - Цена в формате "28万"
 * @returns {Object} Объект цены в frontend формате
 */
const adaptPrice = (backendPrice) => {
  if (!backendPrice || typeof backendPrice !== 'string') {
    return {
      amount: 0,
      currency: 'CNY',
      formatted: '¥0',
      negotiable: true
    };
  }

  // Извлекаем число из строки "28万" -> 28
  const numericValue = parseFloat(backendPrice.replace('万', '').replace(/[^\d.]/g, ''));
  const amount = isNaN(numericValue) ? 0 : numericValue * 10000; // 万 = 10000

  return {
    amount,
    currency: 'CNY',
    formatted: `¥${amount.toLocaleString()}`,
    negotiable: true
  };
};

/**
 * Генерирует ID из названия автомобиля
 * @param {string} title - Название автомобиля
 * @param {number} index - Индекс в списке
 * @returns {string} Уникальный ID
 */
const generateId = (title, index) => {
  if (!title || title.length < 3) {
    // Если название слишком короткое, используем индекс
    return `che168_vehicle_${index}_${Date.now()}`;
  }
  
  // Создаем более стабильный ID на основе названия
  const baseId = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 30);
  
  // Добавляем хеш для уникальности
  const hash = title.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Добавляем индекс для дополнительной уникальности
  return `che168_${baseId}_${Math.abs(hash)}_${index}`;
};

/**
 * Извлекает бренд из названия автомобиля
 * @param {string} title - Название автомобиля
 * @returns {string} Предполагаемый бренд
 */
const extractBrand = (title) => {
  // Список известных китайских брендов для распознавания
  const chineseBrands = [
    '比亚迪', '蔚来', '小鹏', '理想', '特斯拉', '奔驰', '宝马', '奥迪', 
    '大众', '丰田', '本田', '日产', '现代', '起亚', '沃尔沃', '捷豹',
    'BYD', 'NIO', 'XPeng', 'Tesla', 'Mercedes', 'BMW', 'Audi'
  ];

  for (const brand of chineseBrands) {
    if (title.includes(brand)) {
      return brand;
    }
  }

  // Если не найден известный бренд, берем первое слово
  return title.split(' ')[0] || 'Unknown';
};

/**
 * Извлекает модель из названия
 * @param {string} title - Название автомобиля
 * @param {string} brand - Бренд
 * @returns {string} Предполагаемая модель
 */
const extractModel = (title, brand) => {
  const withoutBrand = title.replace(brand, '').trim();
  const words = withoutBrand.split(' ').filter(word => word);
  return words.slice(0, 2).join(' ') || 'Unknown Model';
};

/**
 * Извлекает год из названия
 * @param {string} title - Название автомобиля  
 * @returns {number} Год выпуска
 */
const extractYear = (title) => {
  const yearMatch = title.match(/20[0-9]{2}/);
  return yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
};

/**
 * Генерирует дефолтные значения для недостающих полей
 */
const generateDefaults = (index) => ({
  mileage: {
    value: Math.floor(Math.random() * 50000) + 5000,
    unit: 'km',
    formatted: `${Math.floor(Math.random() * 50000) + 5000} км`
  },
  location: {
    city: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Hangzhou'][index % 5],
    region: 'City Center',
    address: '汽车交易市场',
    coordinates: {
      lat: 39.9042 + (Math.random() - 0.5) * 0.1,
      lng: 116.4074 + (Math.random() - 0.5) * 0.1
    }
  },
  seller: {
    type: Math.random() > 0.7 ? 'private' : 'dealer',
    name: '专业汽车经销商',
    english_name: 'Professional Auto Dealer',
    rating: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
    reviews_count: Math.floor(Math.random() * 200) + 10,
    certified: Math.random() > 0.3,
    phone: '+86-138-0000-0000'
  },
  specifications: {
    battery_capacity: 'N/A',
    range: 'N/A',
    power: 'N/A',
    torque: 'N/A',
    acceleration: 'N/A',
    seats: 5,
    doors: 4,
    color: 'N/A',
    interior_color: 'N/A'
  },
  features: ['Professional Inspection', 'Quality Guarantee', 'After-sales Service'],
  history: {
    accident_free: Math.random() > 0.2,
    owners_count: Math.floor(Math.random() * 3) + 1,
    import_type: Math.random() > 0.5 ? 'domestic' : 'imported',
    warranty: 'Standard warranty included'
  },
  market_data: {
    days_listed: Math.floor(Math.random() * 30) + 1,
    views: Math.floor(Math.random() * 200) + 20,
    price_trend: ['stable', 'rising', 'declining'][Math.floor(Math.random() * 3)],
    market_position: ['competitive', 'premium', 'budget'][Math.floor(Math.random() * 3)]
  }
});

/**
 * Основная функция адаптации одного автомобиля
 * @param {Object} backendCar - Данные автомобиля из backend
 * @param {number} index - Индекс для генерации уникальных значений
 * @returns {Object} Адаптированные данные в формате frontend
 */
export const adaptVehicle = (backendCar, index = 0) => {
  if (!backendCar || !backendCar.title) {
    return null;
  }

  const brand = extractBrand(backendCar.title);
  const model = extractModel(backendCar.title, brand);
  const year = extractYear(backendCar.title);
  const defaults = generateDefaults(index);

  return {
    id: generateId(backendCar.title, index),
    title: backendCar.title,
    english_title: `${year} ${brand} ${model}`,
    brand,
    model,
    trim: 'Standard',
    year,
    engine: 'N/A',
    transmission: 'Automatic',
    fuel_type: 'Petrol',
    mileage: defaults.mileage,
    price: adaptPrice(backendCar.price),
    location: defaults.location,
    seller: defaults.seller,
    specifications: defaults.specifications,
    features: defaults.features,
    history: defaults.history,
    market_data: defaults.market_data,
    images: backendCar.local_image_url ? 
      [`http://localhost:8000${backendCar.local_image_url}`] : 
      (backendCar.image_url ? [backendCar.image_url] : ['/placeholder-car.svg'])
  };
};

/**
 * Адаптирует список автомобилей из backend
 * @param {Array} backendCars - Массив автомобилей из backend
 * @returns {Array} Массив адаптированных автомобилей
 */
export const adaptVehicleList = (backendCars) => {
  if (!Array.isArray(backendCars)) {
    return [];
  }

  return backendCars
    .map((car, index) => adaptVehicle(car, index))
    .filter(car => car !== null);
};

/**
 * Адаптирует ответ API с пагинацией
 * @param {Object} backendResponse - Ответ backend API
 * @returns {Object} Адаптированный ответ с vehicles
 */
export const adaptApiResponse = (backendResponse) => {
  if (!backendResponse || !backendResponse.data) {
    return {
      vehicles: [],
      total: 0,
      page: 1,
      page_size: 10
    };
  }

  const { data, total, page, page_size } = backendResponse;

  return {
    vehicles: adaptVehicleList(data),
    total: total || 0,
    page: page || 1,
    page_size: page_size || 10
  };
}; 