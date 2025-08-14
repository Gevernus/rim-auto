const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  loading = false
}) => {
  // Функция для генерации массива страниц для отображения
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Максимальное количество видимых страниц
    
    if (totalPages <= maxVisible) {
      // Если страниц мало, показываем все
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Если страниц много, показываем с умными сокращениями
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, currentPage + 2);
      
      // Добавляем первую страницу если нужно
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('...');
        }
      }
      
      // Добавляем страницы вокруг текущей
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Добавляем последнюю страницу если нужно
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageClick = (page) => {
    if (page === '...' || page === currentPage || loading) return;
    onPageChange(page);
  };

  const handlePrevious = () => {
    if (currentPage > 1 && !loading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && !loading) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* Кнопка "Предыдущая" */}
      <button
        onClick={handlePrevious}
        disabled={currentPage <= 1 || loading}
        className="px-3 py-2 text-sm font-medium text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        ← Пред.
      </button>

      {/* Номера страниц */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => handlePageClick(page)}
            disabled={loading}
            className={`
              px-3 py-2 text-sm font-medium rounded-md transition-colors
              ${page === currentPage
                ? 'bg-primary-600 text-white'
                : page === '...'
                ? 'text-text-muted dark:text-dark-text-muted cursor-default'
                : 'text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-gray-800'
              }
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Кнопка "Следующая" */}
      <button
        onClick={handleNext}
        disabled={currentPage >= totalPages || loading}
        className="px-3 py-2 text-sm font-medium text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        След. →
      </button>
    </div>
  );
};

export { Pagination }; 