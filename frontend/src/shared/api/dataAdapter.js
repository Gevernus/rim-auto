/**
 * Адаптер данных для преобразования Backend API в Frontend структуру
 */

// Получаем базовый URL для статических файлов (без /api)
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

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
  // Ищем 4-значные числа, которые могут быть годами (1990-2024)
  const yearMatch = title.match(/\b(20[0-2][0-9]|19[9][0-9])\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[0]);
    // Проверяем, что год в разумных пределах
    if (year >= 1990 && year <= 2024) {
      return year;
    }
  }
  
  // Если год не найден, возвращаем текущий год
  return new Date().getFullYear();
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
  if (!backendCar) {
    return null;
  }

  console.log('🔧 Адаптируем автомобиль:', backendCar);

  // Проверяем формат данных
  const isNewFormat = backendCar.brand && backendCar.specs && backendCar.price && typeof backendCar.price === 'object';
  const isOldFormat = backendCar.title && !backendCar.brand;
  const isSimplifiedFormat = backendCar.brand && backendCar.price_value !== undefined;

  if (isNewFormat) {
    // Новый структурированный формат (с specs и price объектом)
    console.log('✅ Используем новый структурированный формат');
    
    const defaults = generateDefaults(index);
    
    // Формируем URL изображений
    let images = ['/placeholder-car.svg']; // По умолчанию
    
    if (backendCar.images) {
      if (backendCar.images.local_url) {
        images = [`${API_BASE_URL}${backendCar.images.local_url}`];
        console.log('🖼️ Используем локальное изображение:', images[0]);
      } else if (backendCar.images.original_url) {
        images = [backendCar.images.original_url];
        console.log('🖼️ Используем оригинальное изображение:', images[0]);
      }
    }

    return {
      id: backendCar.id || generateId(backendCar.title, index),
      title: backendCar.title,
      english_title: `${backendCar.year || 'N/A'} ${backendCar.brand} ${backendCar.model}`,
      brand: backendCar.brand,
      model: backendCar.model,
      trim: 'Standard',
      year: backendCar.year,
      engine: backendCar.specs?.engine_volume || 'N/A',
      transmission: backendCar.specs?.transmission || 'Automatic',
      fuel_type: backendCar.specs?.fuel_type || 'Petrol',
      mileage: defaults.mileage,
      price: {
        amount: backendCar.price.amount_cny || 0,
        currency: 'CNY',
        formatted: `¥${(backendCar.price.amount_cny || 0).toLocaleString()}`,
        negotiable: true
      },
      location: defaults.location,
      seller: defaults.seller,
      specifications: {
        ...defaults.specifications,
        engine_volume: backendCar.specs?.engine_volume,
        transmission: backendCar.specs?.transmission,
        fuel_type: backendCar.specs?.fuel_type,
        drive_type: backendCar.specs?.drive_type
      },
      features: defaults.features,
      history: defaults.history,
      market_data: defaults.market_data,
      images: images
    };
  } else if (isSimplifiedFormat) {
    // Упрощенный формат (с price_value)
    console.log('✅ Используем упрощенный формат');
    
    const defaults = generateDefaults(index);
    
    // Формируем URL изображений
    let images = ['/placeholder-car.svg']; // По умолчанию
    
    if (backendCar.local_image_url) {
      images = [`${API_BASE_URL}${backendCar.local_image_url}`];
      console.log('🖼️ Используем локальное изображение:', images[0]);
    } else if (backendCar.image_url) {
      images = [backendCar.image_url];
      console.log('🖼️ Используем оригинальное изображение:', images[0]);
    }

    return {
      id: backendCar.id || generateId(backendCar.title, index),
      title: backendCar.title,
      english_title: `${backendCar.year || 'N/A'} ${backendCar.brand} ${backendCar.model}`,
      brand: backendCar.brand,
      model: backendCar.model,
      trim: 'Standard',
      year: backendCar.year,
      engine: 'N/A', // Будет дополнено на фронтенде
      transmission: 'Automatic', // Будет дополнено на фронтенде
      fuel_type: 'Petrol', // Будет дополнено на фронтенде
      mileage: defaults.mileage,
      price: {
        amount: (backendCar.price_value || 0) * 10000, // Конвертируем в юани
        currency: 'CNY',
        formatted: `¥${((backendCar.price_value || 0) * 10000).toLocaleString()}`,
        negotiable: true
      },
      location: defaults.location,
      seller: defaults.seller,
      specifications: {
        ...defaults.specifications,
        // Дополним спецификации на основе названия
        engine_volume: extractEngineVolume(backendCar.title),
        transmission: extractTransmission(backendCar.title),
        fuel_type: extractFuelType(backendCar.title),
        drive_type: extractDriveType(backendCar.title)
      },
      features: defaults.features,
      history: defaults.history,
      market_data: defaults.market_data,
      images: images
    };
  } else if (isOldFormat) {
    // Старый формат (для обратной совместимости)
    console.log('⚠️ Используем старый формат данных');
    
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
        [`${API_BASE_URL}${backendCar.local_image_url}`] : 
        (backendCar.image_url ? [backendCar.image_url] : ['/placeholder-car.svg'])
    };
  } else {
    // Попробуем обработать как новый формат с вложенными объектами
    console.log('🔍 Пробуем обработать как новый формат с вложенными объектами');
    
    const defaults = generateDefaults(index);
    
    // Извлекаем год из названия если не задан
    const year = backendCar.year || extractYear(backendCar.title);
    
    // Обрабатываем цену
    let priceAmount = 0;
    if (backendCar.price && typeof backendCar.price === 'object') {
      priceAmount = backendCar.price.amount_cny || backendCar.price.value * 10000 || 0;
    } else if (backendCar.price_value) {
      priceAmount = backendCar.price_value * 10000;
    }
    
    // Формируем URL изображений
    let images = ['/placeholder-car.svg'];
    if (backendCar.images && backendCar.images.local_url) {
      images = [`${API_BASE_URL}${backendCar.images.local_url}`];
    } else if (backendCar.local_image_url) {
      images = [`${API_BASE_URL}${backendCar.local_image_url}`];
    } else if (backendCar.images && backendCar.images.original_url) {
      images = [backendCar.images.original_url];
    } else if (backendCar.image_url) {
      images = [backendCar.image_url];
    }

    return {
      id: backendCar.id || generateId(backendCar.title, index),
      title: backendCar.title,
      english_title: `${year || 'N/A'} ${backendCar.brand || 'Unknown'} ${backendCar.model || 'Unknown'}`,
      brand: backendCar.brand || 'Unknown',
      model: backendCar.model || 'Unknown',
      trim: 'Standard',
      year: year,
      engine: 'N/A',
      transmission: 'Automatic',
      fuel_type: 'Petrol',
      mileage: defaults.mileage,
      price: {
        amount: priceAmount,
        currency: 'CNY',
        formatted: `¥${priceAmount.toLocaleString()}`,
        negotiable: true
      },
      location: defaults.location,
      seller: defaults.seller,
      specifications: {
        ...defaults.specifications,
        engine_volume: extractEngineVolume(backendCar.title),
        transmission: extractTransmission(backendCar.title),
        fuel_type: extractFuelType(backendCar.title),
        drive_type: extractDriveType(backendCar.title)
      },
      features: defaults.features,
      history: defaults.history,
      market_data: defaults.market_data,
      images: images
    };
  }
};

// Вспомогательные функции для извлечения дополнительных параметров
const extractEngineVolume = (title) => {
  const volumeMatch = title.match(/(\d+\.?\d*)[LT]/);
  return volumeMatch ? `${volumeMatch[1]}L` : null;
};

const extractTransmission = (title) => {
  if (title.includes('自动') || title.includes('DCT') || title.includes('CVT') || title.includes('AT')) {
    return 'Automatic';
  } else if (title.includes('手动') || title.includes('MT')) {
    return 'Manual';
  }
  return 'Automatic';
};

const extractFuelType = (title) => {
  if (title.includes('混动') || title.includes('HV') || title.includes('双擎')) {
    return 'Hybrid';
  } else if (title.includes('电动') || title.includes('EV')) {
    return 'Electric';
  } else if (title.includes('柴油')) {
    return 'Diesel';
  }
  return 'Petrol';
};

const extractDriveType = (title) => {
  if (title.includes('四驱') || title.includes('4WD') || title.includes('AWD') || title.includes('4MATIC')) {
    return 'AWD';
  } else if (title.includes('前驱') || title.includes('FWD')) {
    return 'FWD';
  } else if (title.includes('后驱') || title.includes('RWD')) {
    return 'RWD';
  }
  return 'FWD';
};

/**
 * Адаптирует список автомобилей из backend
 * @param {Array} backendCars - Массив автомобилей из backend
 * @returns {Array} Массив адаптированных автомобилей
 */
export const adaptVehicleList = (backendCars) => {
  console.log('🔧 adaptVehicleList получил данные:', backendCars);
  
  if (!Array.isArray(backendCars)) {
    console.log('❌ backendCars не является массивом:', typeof backendCars);
    return [];
  }

  const adaptedVehicles = backendCars
    .map((car, index) => {
      const adapted = adaptVehicle(car, index);
      if (adapted) {
        console.log(`✅ Адаптирован автомобиль ${index + 1}:`, adapted.title);
      } else {
        console.log(`❌ Не удалось адаптировать автомобиль ${index + 1}`);
      }
      return adapted;
    })
    .filter(car => car !== null);

  console.log(`🎉 Успешно адаптировано ${adaptedVehicles.length} из ${backendCars.length} автомобилей`);
  return adaptedVehicles;
};

/**
 * Адаптирует ответ API с пагинацией
 * @param {Object} backendResponse - Ответ backend API
 * @returns {Object} Адаптированный ответ с vehicles
 */
export const adaptApiResponse = (backendResponse) => {
  console.log('🔧 adaptApiResponse получил ответ:', backendResponse);
  
  if (!backendResponse || !backendResponse.data) {
    console.log('❌ Некорректный ответ от API');
    return {
      vehicles: [],
      total: 0,
      page: 1,
      page_size: 10
    };
  }

  const { data, total, page, page_size } = backendResponse;
  console.log(`📊 Обрабатываем ${data.length} автомобилей, страница ${page}, всего ${total}`);

  const result = {
    vehicles: adaptVehicleList(data),
    total: total || 0,
    page: page || 1,
    page_size: page_size || 10
  };

  console.log('✅ Финальный результат adaptApiResponse:', result);
  return result;
}; 