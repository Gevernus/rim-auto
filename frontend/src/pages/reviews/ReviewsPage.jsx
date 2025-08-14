import { useEffect, useMemo, useState } from 'react';
import { reviewsApi } from '../../shared/api/client';
import { useTelegramAuth } from '../../features/auth';
import { Rating } from '../../shared/ui/Rating';
import { Pagination } from '../../shared/ui/Pagination';

const ReviewsPage = () => {
  const { isAuthenticated, user, telegramUser } = useTelegramAuth();
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [sending, setSending] = useState(false);
  const [editMap, setEditMap] = useState({});

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reviewsApi.getReviews({ page, page_size: pageSize });
      setReviews(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      setError('Не удалось загрузить отзывы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Требуется авторизация для отправки отзыва');
      return;
    }
    if (!message.trim()) {
      setError('Введите текст отзыва');
      return;
    }
    setSending(true);
    setError('');
    try {
      await reviewsApi.createReview({ message: message.trim(), rating });
      setMessage('');
      setRating(5);
      setPage(1);
      await load();
    } catch (e) {
      setError(e.response?.data?.detail || 'Не удалось отправить отзыв');
    } finally {
      setSending(false);
    }
  };

  const getCurrentUserId = () => {
    const fromUser = user?.telegram_id ?? user?.user_id;
    const fromTelegram = telegramUser?.id ?? telegramUser?.user?.id;
    return String(fromUser ?? fromTelegram ?? '');
  };

  const isOwner = (r) => {
    const ownerId = String((r.user && r.user.user_id) ?? '');
    const currentId = getCurrentUserId();
    return Boolean(ownerId) && Boolean(currentId) && ownerId === currentId;
  };

  const startEdit = (r) => {
    setEditMap((prev) => ({ ...prev, [r._id]: { message: r.message, rating: r.rating || 0 } }));
  };

  const cancelEdit = (id) => {
    setEditMap((prev) => ({ ...prev, [id]: undefined }));
    setError('');
  };

  const saveEdit = async (id) => {
    const data = editMap[id];
    if (!data) return;
    if (!data.message || data.message.trim().length < 3) {
      setError('Слишком короткий текст');
      return;
    }
    try {
      await reviewsApi.updateReview(id, { message: data.message.trim(), rating: data.rating });
      setEditMap((prev) => ({ ...prev, [id]: undefined }));
      setError('');
      await load();
    } catch (e) {
      setError(e.response?.data?.detail || 'Не удалось сохранить изменения');
    }
  };

  const handlePageSizeChange = (e) => {
    const next = Number(e.target.value) || 10;
    setPageSize(next);
    setPage(1);
    setError('');
  };

  return (
    <div className="container section-padding">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-6">Отзывы</h1>

        <form onSubmit={handleSubmit} className="bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-4 mb-8">
          <h2 className="text-xl font-semibold text-primary-700 dark:text-primary-600 mb-4">Оставить отзыв</h2>

          {!isAuthenticated && (
            <div className="mb-4 p-3 rounded-md border border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300">
              Для отправки отзыва войдите через Telegram.
            </div>
          )}

          {isAuthenticated && (
            <div className="mb-4">
              <p className="text-sm mb-0 text-text-secondary dark:text-dark-text-secondary">Вы вошли как</p>
              <p className="font-semibold mb-0 text-text-primary dark:text-dark-text-primary">
                {(user?.first_name || '') + (user?.last_name ? ' ' + user?.last_name : '') || user?.username || 'Пользователь'}
              </p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm mb-1 text-text-secondary dark:text-dark-text-secondary">Оценка</label>
            <Rating value={rating} onChange={setRating} editable ariaLabel="Оценка" />
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-1 text-text-secondary dark:text-dark-text-secondary">Отзыв</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Поделитесь опытом обслуживания..."
              className="w-full px-3 py-2 rounded-md border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary"
            />
          </div>
          {error && (
            <div className="mb-4 p-3 rounded-md border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">{error}</div>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending || !isAuthenticated}
              className={`px-4 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors ${sending || !isAuthenticated ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              Отправить
            </button>
          </div>
        </form>

        <div>
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary">Последние отзывы</h2>
            <div className="flex items-center gap-2">
              <label className="text-sm text-text-secondary dark:text-dark-text-secondary" htmlFor="reviews-page-size">Показывать</label>
              <select
                id="reviews-page-size"
                value={pageSize}
                onChange={handlePageSizeChange}
                className="px-2 py-1 border border-border dark:border-dark-border rounded-md bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary"
                aria-label="Количество отзывов на странице"
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p className="text-text-secondary dark:text-dark-text-secondary">Загрузка...</p>
          ) : reviews.length === 0 ? (
            <p className="text-text-secondary dark:text-dark-text-secondary">Отзывов пока нет</p>
          ) : (
            <>
              <div className="space-y-4">
                {reviews.map((r) => {

                  const editableItem = editMap[r._id];
                  const owner = isOwner(r);
                  return (
                    <div key={r._id} className="bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold mb-0 text-text-primary dark:text-dark-text-primary">{r.name || 'Пользователь'}</p>
                          <div className="flex items-center gap-1 mt-1" aria-label={`Оценка ${r.rating} из 5`}>
                            {editableItem ? (
                              <Rating value={editableItem.rating} onChange={(val) => setEditMap((prev) => ({ ...prev, [r._id]: { ...prev[r._id], rating: val } }))} editable ariaLabel="Оценка" />
                            ) : (
                              <Rating value={r.rating || 0} editable={false} />
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-text-muted dark:text-dark-text-muted">{new Date(r.created_at).toLocaleString('ru-RU')}</p>
                      </div>

                      {editableItem ? (
                        <div className="mt-3 flex flex-col gap-2">
                          <textarea
                            value={editableItem.message}
                            onChange={(e) => setEditMap((prev) => ({ ...prev, [r._id]: { ...prev[r._id], message: e.target.value } }))}
                            rows={3}
                            className="px-3 py-2 rounded-md border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => saveEdit(r._id)} className="px-3 py-1 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded">Сохранить</button>
                            <button onClick={() => cancelEdit(r._id)} className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded">Отмена</button>
                          </div>
							{error && (
          					  <div className="mb-4 p-3 rounded-md border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">{error}</div>
          					)}
                        </div>
                      ) : (
                        <p className="mt-3 text-text-primary dark:text-dark-text-primary">{r.message}</p>
                      )}

                      {owner && !editableItem && (
                        <div className="mt-3">
                          <button onClick={() => startEdit(r)} className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded">Редактировать</button>
                        </div>
                      )}

                      {r.reply && (
                        <div className="mt-3 p-3 rounded-md bg-gray-50 dark:bg-gray-800/60 border border-border dark:border-dark-border">
                          <span className="text-sm text-text-secondary dark:text-dark-text-secondary mb-1">Ответ</span>
                          <span className="text-primary-700 dark:text-primary-600 mb-1"> Рим</span>
                          <span className="text-text-primary dark:text-dark-text-primary mb-1"> - Авто :</span>
                          <p className="text-text-primary dark:text-dark-text-primary">{r.reply}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                loading={loading}
                className="mt-6"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { ReviewsPage }; 