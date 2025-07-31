/**
 * Типы данных для автомобилей из Che168.com API
 */

/**
 * @typedef {Object} VehicleMileage
 * @property {number} value - Значение пробега
 * @property {string} unit - Единица измерения (km)
 * @property {string} formatted - Отформатированная строка
 */

/**
 * @typedef {Object} VehiclePrice
 * @property {number} amount - Сумма в юанях
 * @property {string} currency - Валюта (CNY)
 * @property {string} formatted - Отформатированная цена
 * @property {boolean} negotiable - Торговаться можно
 */

/**
 * @typedef {Object} VehicleLocation
 * @property {string} city - Город
 * @property {string} region - Регион
 * @property {string} address - Адрес
 * @property {Object} coordinates - Координаты
 * @property {number} coordinates.lat - Широта
 * @property {number} coordinates.lng - Долгота
 */

/**
 * @typedef {Object} VehicleSeller
 * @property {string} type - Тип продавца (dealer, private)
 * @property {string} name - Название на китайском
 * @property {string} english_name - Название на английском
 * @property {number} rating - Рейтинг (1-5)
 * @property {number} reviews_count - Количество отзывов
 * @property {boolean} certified - Сертифицированный продавец
 * @property {string} phone - Телефон
 */

/**
 * @typedef {Object} VehicleSpecifications
 * @property {string} battery_capacity - Емкость батареи (для EV)
 * @property {string} range - Запас хода
 * @property {string} power - Мощность
 * @property {string} torque - Крутящий момент
 * @property {string} acceleration - Разгон 0-100
 * @property {number} seats - Количество мест
 * @property {number} doors - Количество дверей
 * @property {string} color - Цвет кузова
 * @property {string} interior_color - Цвет салона
 */

/**
 * @typedef {Object} VehicleHistory
 * @property {boolean} accident_free - Без аварий
 * @property {number} owners_count - Количество владельцев
 * @property {string} import_type - Тип импорта
 * @property {string} warranty - Гарантия
 */

/**
 * @typedef {Object} VehicleMarketData
 * @property {number} days_listed - Дней в продаже
 * @property {number} views - Количество просмотров
 * @property {string} price_trend - Тренд цены
 * @property {string} market_position - Позиция на рынке
 */

/**
 * @typedef {Object} Vehicle
 * @property {string} id - Уникальный ID
 * @property {string} title - Название на китайском
 * @property {string} english_title - Название на английском
 * @property {string} brand - Бренд
 * @property {string} model - Модель
 * @property {string} trim - Комплектация
 * @property {number} year - Год выпуска
 * @property {string} engine - Тип двигателя
 * @property {string} transmission - Коробка передач
 * @property {string} fuel_type - Тип топлива
 * @property {VehicleMileage} mileage - Пробег
 * @property {VehiclePrice} price - Цена
 * @property {VehicleLocation} location - Местоположение
 * @property {VehicleSeller} seller - Продавец
 * @property {VehicleSpecifications} specifications - Характеристики
 * @property {string[]} features - Список особенностей
 * @property {VehicleHistory} history - История автомобиля
 * @property {VehicleMarketData} market_data - Рыночные данные
 * @property {string[]} images - Массив URL изображений
 */

export {
  // Экспортируем только для JSDoc, в runtime это будет undefined
  // но TypeScript/IDE смогут использовать типы
}; 