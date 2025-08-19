// Универсальные нормализаторы контактов/мессенджеров (Web, RN)

export const normalizePhoneDigits = (value) => {
  if (!value) return '';
  const digits = String(value).replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) {
    return '7' + digits.slice(1);
  }
  return digits;
};

export const buildWhatsAppUrl = (input, fallbackPhone) => {
  if (input && /^https?:\/\//i.test(input)) {
    const digits = normalizePhoneDigits(input);
    if (digits) return `https://wa.me/${digits}`;
    return input;
  }
  const digits = normalizePhoneDigits(input || fallbackPhone);
  return digits ? `https://wa.me/${digits}` : '';
};

export const buildTelegramUrl = (input, fallbackPhone) => {
  if (!input && !fallbackPhone) return '';
  if (input) {
    const trimmed = String(input).trim();
    if (trimmed.startsWith('@')) {
      return `https://t.me/${trimmed.slice(1)}`;
    }
    const tmeMatch = trimmed.match(/^https?:\/\/(t\.me|telegram\.me)\/(.+)$/i);
    if (tmeMatch) {
      const tail = decodeURIComponent(tmeMatch[2] || '');
      if (/^@?\w[\w\d_]{2,}$/i.test(tail)) {
        return `https://t.me/${tail.replace(/^@/, '')}`;
      }
      const digits = normalizePhoneDigits(tail);
      return digits ? `https://t.me/+${digits}` : '';
    }
    const digits = normalizePhoneDigits(trimmed);
    if (digits) {
      return `https://t.me/+${digits}`;
    }
  }
  const digits = normalizePhoneDigits(fallbackPhone);
  return digits ? `https://t.me/+${digits}` : '';
};


