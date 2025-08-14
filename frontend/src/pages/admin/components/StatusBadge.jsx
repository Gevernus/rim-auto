import React from 'react';

const STATUS_CONFIG = {
  new: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', text: 'Новая' },
  processing: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', text: 'В обработке' },
  approved: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', text: 'Одобрена' },
  rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', text: 'Отклонена' }
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
      {config.text}
    </span>
  );
};

export { StatusBadge }; 