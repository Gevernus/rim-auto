// Справочник городов России для расчета доставки
export const RUSSIAN_CITIES = [
  // Центральный федеральный округ
  { id: 'moscow', name: 'Москва', region: 'Москва', federal_district: 'ЦФО', delivery_zone: 1, delivery_days: '1-2' },
  { id: 'moscow_region', name: 'Московская область', region: 'Московская область', federal_district: 'ЦФО', delivery_zone: 1, delivery_days: '2-3' },
  { id: 'saint_petersburg', name: 'Санкт-Петербург', region: 'Санкт-Петербург', federal_district: 'СЗФО', delivery_zone: 1, delivery_days: '2-3' },
  { id: 'leningrad_region', name: 'Ленинградская область', region: 'Ленинградская область', federal_district: 'СЗФО', delivery_zone: 1, delivery_days: '3-4' },
  
  // Крупные города
  { id: 'novosibirsk', name: 'Новосибирск', region: 'Новосибирская область', federal_district: 'СФО', delivery_zone: 2, delivery_days: '5-7' },
  { id: 'yekaterinburg', name: 'Екатеринбург', region: 'Свердловская область', federal_district: 'УФО', delivery_zone: 2, delivery_days: '4-6' },
  { id: 'nizhny_novgorod', name: 'Нижний Новгород', region: 'Нижегородская область', federal_district: 'ПФО', delivery_zone: 2, delivery_days: '3-5' },
  { id: 'kazan', name: 'Казань', region: 'Республика Татарстан', federal_district: 'ПФО', delivery_zone: 2, delivery_days: '4-6' },
  { id: 'chelyabinsk', name: 'Челябинск', region: 'Челябинская область', federal_district: 'УФО', delivery_zone: 2, delivery_days: '5-7' },
  { id: 'omsk', name: 'Омск', region: 'Омская область', federal_district: 'СФО', delivery_zone: 2, delivery_days: '6-8' },
  { id: 'samara', name: 'Самара', region: 'Самарская область', federal_district: 'ПФО', delivery_zone: 2, delivery_days: '4-6' },
  { id: 'rostov_on_don', name: 'Ростов-на-Дону', region: 'Ростовская область', federal_district: 'ЮФО', delivery_zone: 2, delivery_days: '4-6' },
  { id: 'ufa', name: 'Уфа', region: 'Республика Башкортостан', federal_district: 'ПФО', delivery_zone: 2, delivery_days: '5-7' },
  { id: 'krasnoyarsk', name: 'Красноярск', region: 'Красноярский край', federal_district: 'СФО', delivery_zone: 2, delivery_days: '6-8' },
  { id: 'voronezh', name: 'Воронеж', region: 'Воронежская область', federal_district: 'ЦФО', delivery_zone: 2, delivery_days: '3-5' },
  { id: 'perm', name: 'Пермь', region: 'Пермский край', federal_district: 'ПФО', delivery_zone: 2, delivery_days: '5-7' },
  { id: 'volgograd', name: 'Волгоград', region: 'Волгоградская область', federal_district: 'ЮФО', delivery_zone: 2, delivery_days: '4-6' },
  { id: 'krasnodar', name: 'Краснодар', region: 'Краснодарский край', federal_district: 'ЮФО', delivery_zone: 2, delivery_days: '4-6' },
  { id: 'saratov', name: 'Саратов', region: 'Саратовская область', federal_district: 'ПФО', delivery_zone: 2, delivery_days: '4-6' },
  { id: 'tyumen', name: 'Тюмень', region: 'Тюменская область', federal_district: 'УФО', delivery_zone: 2, delivery_days: '5-7' },
  { id: 'tolyatti', name: 'Тольятти', region: 'Самарская область', federal_district: 'ПФО', delivery_zone: 2, delivery_days: '4-6' },
  
  // Дальневосточные города
  { id: 'vladivostok', name: 'Владивосток', region: 'Приморский край', federal_district: 'ДФО', delivery_zone: 3, delivery_days: '10-14' },
  { id: 'khabarovsk', name: 'Хабаровск', region: 'Хабаровский край', federal_district: 'ДФО', delivery_zone: 3, delivery_days: '10-14' },
  { id: 'irkutsk', name: 'Иркутск', region: 'Иркутская область', federal_district: 'СФО', delivery_zone: 3, delivery_days: '8-12' },
  { id: 'magadan', name: 'Магадан', region: 'Магаданская область', federal_district: 'ДФО', delivery_zone: 3, delivery_days: '12-16' },
  { id: 'petropavlovsk_kamchatsky', name: 'Петропавловск-Камчатский', region: 'Камчатский край', federal_district: 'ДФО', delivery_zone: 3, delivery_days: '14-18' },
  { id: 'yakutsk', name: 'Якутск', region: 'Республика Саха (Якутия)', federal_district: 'ДФО', delivery_zone: 3, delivery_days: '12-16' },
  
  // Регионы Сибири
  { id: 'tomsk', name: 'Томск', region: 'Томская область', federal_district: 'СФО', delivery_zone: 2, delivery_days: '6-8' },
  { id: 'kemerovo', name: 'Кемерово', region: 'Кемеровская область', federal_district: 'СФО', delivery_zone: 2, delivery_days: '6-8' },
  { id: 'novokuznetsk', name: 'Новокузнецк', region: 'Кемеровская область', federal_district: 'СФО', delivery_zone: 2, delivery_days: '6-8' },
  { id: 'barnaul', name: 'Барнаул', region: 'Алтайский край', federal_district: 'СФО', delivery_zone: 2, delivery_days: '6-8' },
  
  // Юг России
  { id: 'sochi', name: 'Сочи', region: 'Краснодарский край', federal_district: 'ЮФО', delivery_zone: 2, delivery_days: '5-7' },
  { id: 'stavropol', name: 'Ставрополь', region: 'Ставропольский край', federal_district: 'СКФО', delivery_zone: 2, delivery_days: '5-7' },
  { id: 'astrakhan', name: 'Астрахань', region: 'Астраханская область', federal_district: 'ЮФО', delivery_zone: 2, delivery_days: '5-7' },
  
  // Север и Арктика
  { id: 'murmansk', name: 'Мурманск', region: 'Мурманская область', federal_district: 'СЗФО', delivery_zone: 3, delivery_days: '7-10' },
  { id: 'arkhangelsk', name: 'Архангельск', region: 'Архангельская область', federal_district: 'СЗФО', delivery_zone: 3, delivery_days: '6-9' },
  { id: 'syktyvkar', name: 'Сыктывкар', region: 'Республика Коми', federal_district: 'СЗФО', delivery_zone: 3, delivery_days: '6-9' },
];

// Зоны доставки с базовыми тарифами
export const DELIVERY_ZONES = {
  1: {
    name: 'Москва и СПб',
    base_cost: 15000, // базовая стоимость доставки в рублях
    description: 'Московский и Северо-Западный регионы'
  },
  2: {
    name: 'Центральная Россия',
    base_cost: 25000,
    description: 'Крупные города центральной России и Урала'
  },
  3: {
    name: 'Удаленные регионы',
    base_cost: 45000,
    description: 'Сибирь, Дальний Восток, Север'
  }
};

// Функция для поиска городов
export const searchCities = (query) => {
  if (!query || query.length < 2) return [];
  
  const searchQuery = query.toLowerCase().trim();
  
  return RUSSIAN_CITIES.filter(city => 
    city.name.toLowerCase().includes(searchQuery) ||
    city.region.toLowerCase().includes(searchQuery)
  ).slice(0, 10); // ограничиваем результаты
};

// Функция для получения города по ID
export const getCityById = (cityId) => {
  return RUSSIAN_CITIES.find(city => city.id === cityId);
};

// Функция для получения информации о зоне доставки
export const getDeliveryZoneInfo = (zoneId) => {
  return DELIVERY_ZONES[zoneId];
};

// Курсы валют (в реальном проекте будут получаться с API)
export const EXCHANGE_RATES = {
  CNY: 12.5, // 1 юань = 12.5 рублей (примерный курс)
  USD: 95.0, // 1 доллар = 95 рублей
  EUR: 105.0, // 1 евро = 105 рублей
  JPY: 0.65, // 1 иена = 0.65 рублей
};

// Функция для конвертации цены в рубли
export const convertToRubles = (price, currency = 'CNY') => {
  const rate = EXCHANGE_RATES[currency] || 1;
  return Math.round(price * rate);
};

// Функция для форматирования цены в рублях
export const formatPriceInRubles = (priceInRubles) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceInRubles);
}; 