import React, { useEffect, useState } from 'react';
import { Pagination } from '../../../shared/ui/Pagination';
import { Rating } from '../../../shared/ui/Rating';
import { reviewsApi } from '../../../shared/api/client';

const formatDate = (dateString) => new Date(dateString).toLocaleString('ru-RU');

const ReviewsTab = () => {
	const [reviews, setReviews] = useState([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [replyMap, setReplyMap] = useState({});
	const [editReplyMap, setEditReplyMap] = useState({});
	const [ratingFilter, setRatingFilter] = useState('all');
	const [statusFilter, setStatusFilter] = useState('all');

	const loadReviews = async () => {
		setLoading(true);
		setError('');
		try {
			const params = { page, page_size: pageSize };
			if (ratingFilter !== 'all') params.rating = Number(ratingFilter);
			if (statusFilter !== 'all') params.status = statusFilter;
			const res = await reviewsApi.getReviews(params);
			setReviews(res.data.data || []);
			setTotal(res.data.total || 0);
		} catch (error) {
			setError(error?.response?.data?.detail || 'Ошибка загрузки отзывов');
			setReviews([]);
			setTotal(0);
		} finally {
			setLoading(false);
		}
	};

	const onReplyChange = (reviewId, value) => {
		setReplyMap((prev) => ({ ...prev, [reviewId]: value }));
	};

	const onReply = async (reviewId) => {
		const value = (replyMap[reviewId] || '').trim();
		if (!value) return;
		try {
			await reviewsApi.replyReview(reviewId, value);
			setReplyMap((prev) => ({ ...prev, [reviewId]: '' }));
			await loadReviews();
		} catch (error) {
			setError(error?.response?.data?.detail || 'Не удалось отправить ответ');
		}
	};

	const onReplyEditToggle = (reviewId, valueOrCurrent, editing) => {
		setEditReplyMap((prev) => {
			if (editing === false) { return { ...prev, [reviewId]: null }; }
			if (editing === true && typeof valueOrCurrent === 'string') { return { ...prev, [reviewId]: valueOrCurrent }; }
			return { ...prev, [reviewId]: prev[reviewId] != null ? null : (valueOrCurrent || '') };
		});
	};

	const onReplySave = async (reviewId) => {
		const value = (editReplyMap[reviewId] || '').trim();
		if (!value) return;
		try {
			await reviewsApi.replyReview(reviewId, value);
			setEditReplyMap((prev) => ({ ...prev, [reviewId]: null }));
			await loadReviews();
		} catch (error) {
			setError(error?.response?.data?.detail || 'Не удалось сохранить ответ');
		}
	};

	const onDelete = async (reviewId) => {
		if (!window.confirm('Удалить отзыв?')) return;
		try {
			await reviewsApi.deleteReview(reviewId);
			await loadReviews();
		} catch (error) {
			setError(error?.response?.data?.detail || 'Не удалось удалить отзыв');
		}
	};

	useEffect(() => {
		loadReviews();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, pageSize, ratingFilter, statusFilter]);

	const newCount = reviews.filter(r => r.status === 'new' || !r.reply).length;
	const processedCount = reviews.filter(r => r.status === 'processed' || r.reply).length;

	return (
		<div>
			{/* Панель данных по отзывам */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<div className="flex items-center md:flex-col md:items-start md:justify-start gap-2 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-4">
					<h3 className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Всего</h3>
					<p className="mb-0 text-2xl font-bold text-text-primary dark:text-dark-text-primary">{total}</p>
				</div>
				<div className="flex items-center md:flex-col md:items-start md:justify-start gap-2 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-4">
					<h3 className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Новые</h3>
					<p className="mb-0 text-2xl font-bold text-text-primary dark:text-dark-text-primary">{newCount}</p>
				</div>
				<div className="flex items-center md:flex-col md:items-start md:justify-start gap-2 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-4">
					<h3 className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Обработанные</h3>
					<p className="mb-0 text-2xl font-bold text-text-primary dark:text-dark-text-primary">{processedCount}</p>
				</div>
			</div>		

			{/* Фильтры */}
			<div className="mb-6 flex flex-col md:flex-row flex-wrap gap-4 md:items-center">
				<div className="flex items-center gap-2">
					<label className="text-sm text-text-secondary dark:text-dark-text-secondary" htmlFor="reviews-rating-filter">Рейтинг</label>
					<select
						id="reviews-rating-filter"
						value={ratingFilter}
						onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
						className="px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-elevated dark:bg-dark-surface-elevated text-text-primary dark:text-dark-text-primary"
					>
						<option value="all">Все</option>
						<option value="5">5 звезд</option>
						<option value="4">4 звезды</option>
						<option value="3">3 звезды</option>
						<option value="2">2 звезды</option>
						<option value="1">1 звезда</option>
					</select>
				</div>
				<div className="flex items-center gap-2">
					<label className="text-sm text-text-secondary dark:text-dark-text-secondary" htmlFor="reviews-status-filter">Статус</label>
					<select
						id="reviews-status-filter"
						value={statusFilter}
						onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
						className="px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface-elevated dark:bg-dark-surface-elevated text-text-primary dark:text-dark-text-primary"
					>
						<option value="all">Все</option>
						<option value="new">Новые</option>
						<option value="processed">Обработанные</option>
					</select>
				</div>
				<div className="ml-auto flex items-center gap-2">
					<label className="text-sm text-text-secondary dark:text-dark-text-secondary" htmlFor="admin-reviews-page-size">Показывать</label>
					<select
						id="admin-reviews-page-size"
						value={pageSize}
						onChange={(e) => { setPageSize(Number(e.target.value) || 10); setPage(1); }}
						className="px-2 py-1 border border-border dark:border-dark-border rounded-md bg-surface-elevated dark:bg-dark-surface-elevated text-text-primary dark:text-dark-text-primary"
					>
						{[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
					</select>
				</div>
			</div>



			{error && (
				<div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
					<p className="text-red-600 dark:text-red-400">{error}</p>
				</div>
			)}

			{reviews.length === 0 ? (
				<div className="text-center py-8">
					<p className="text-text-secondary dark:text-dark-text-secondary">Отзывов нет</p>
				</div>
			) : (
				<>
					{reviews.map((r) => (
						<div key={r._id} className="bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-4 mb-4">
							<div className="flex items-start justify-between">
								<div>
									<p className="font-semibold text-text-primary dark:text-dark-text-primary">{r.name || 'Аноним'}</p>
									<div className="flex items-center gap-1 mt-1">
										<Rating value={r.rating || 0} editable={false} />
									</div>
								</div>
								<p className="text-xs text-text-muted dark:text-dark-text-muted">{formatDate(r.created_at)}</p>
							</div>
							<p className="mt-3 text-text-primary text-sm md:text-base dark:text-dark-text-primary">{r.message}</p>

							{r.reply ? (
								<div className="mt-3 p-3 rounded-md bg-gray-50 dark:bg-gray-800/60 border border-border dark:border-dark-border">
									<p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-1">Ответ: {r.reply_author || 'Менеджер'}</p>
									{editReplyMap[r._id] != null ? (
										<div className="flex flex-col gap-2">
											<textarea
												value={editReplyMap[r._id]}
												onChange={(e) => onReplyEditToggle(r._id, e.target.value, true)}
												rows={2}
												className="px-3 py-2 rounded-md border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary"
											/>
											<div className="flex gap-2">
												<button onClick={() => onReplySave(r._id)} className="px-3 py-1 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded">Сохранить</button>
												<button onClick={() => onReplyEditToggle(r._id, null, false)} className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded">Отмена</button>
											</div>
										</div>
									) : (
										<>
											<p className="text-text-primary dark:text-dark-text-primary">{r.reply}</p>
											<div className="mt-2">
												<button onClick={() => onReplyEditToggle(r._id, r.reply, true)} className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded mr-2">Редактировать</button>
												<button onClick={() => onDelete(r._id)} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded">Удалить</button>
											</div>
										</>
									)}
								</div>
						) : (
							<div className="mt-3 flex flex-col gap-2">
								<textarea
									value={replyMap[r._id] || ''}
									onChange={(e) => onReplyChange(r._id, e.target.value)}
									placeholder="Ответ менеджера..."
									rows={2}
									className="px-3 py-2 rounded-md border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary"
								/>
								<div className="flex gap-2">
									<button onClick={() => onReply(r._id)} className="px-3 py-1 text-sm bg-info-600 hover:bg-info-700 text-white rounded">Ответить</button>
									<button onClick={() => onDelete(r._id)} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded">Удалить</button>
								</div>
							</div>
						)}
					</div>
				))}

					<Pagination
						currentPage={page}
						totalPages={Math.max(1, Math.ceil(total / pageSize))}
						onPageChange={setPage}
						loading={loading}
						className="mt-4"
					/>
				</>
			)}
		</div>
	);
};

export { ReviewsTab }; 