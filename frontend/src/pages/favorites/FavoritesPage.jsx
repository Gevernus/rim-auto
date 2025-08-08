const FavoritesPage = () => {
  return (
    <div className="container section-padding">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-text-primary dark:text-dark-text-primary">
          Избранное
        </h1>
        
        <div className="text-center py-12">
          <div className="text-text-muted dark:text-dark-text-muted mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text-primary dark:text-dark-text-primary mb-2">
            Пока нет избранных автомобилей
          </h3>
          <p className="text-text-secondary dark:text-dark-text-secondary">
            Добавляйте автомобили в избранное, чтобы быстро найти их позже
          </p>
        </div>
      </div>
    </div>
  );
};

export { FavoritesPage }; 