const MessagesPage = () => {
  return (
    <div className="container section-padding">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-text-primary dark:text-dark-text-primary">
          Сообщения
        </h1>
        
        <div className="text-center py-12">
          <div className="text-text-muted dark:text-dark-text-muted mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text-primary dark:text-dark-text-primary mb-2">
            Пока нет сообщений
          </h3>
          <p className="text-text-secondary dark:text-dark-text-secondary">
            Здесь будут отображаться ваши переписки с менеджерами
          </p>
        </div>
      </div>
    </div>
  );
};

export { MessagesPage }; 