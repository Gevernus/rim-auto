import React, { useEffect, useState } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { applicationsApi } from '../../../shared/api/client';
import { buildAbsoluteUrl } from '../../../shared/lib/platform';

const formatDate = (dateString) => new Date(dateString).toLocaleString('ru-RU');
const formatPrice = (price) => new Intl.NumberFormat('ru-RU').format(price) + ' ₽';

const DOC_LABELS = {
	anketa: 'Анкета/Карточка компании',
	passport: 'Паспорта руководителей/учредителей',
	accounting: 'Бухгалтерская отчетность',
	account51: 'Карточка счета 51 (3 мес.)',
	bankStatements: 'Справки из банков (12 мес.)',
};

const CarcadeLeasingTab = () => {
	const [applications, setApplications] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [telegramFilter, setTelegramFilter] = useState('all');
	const [page] = useState(1);
	const [pageSize] = useState(10);
	const [deleting, setDeleting] = useState({});

	const buildDocumentUrl = (doc) => {
		if (!doc) return '';
		if (doc.url) return buildAbsoluteUrl(doc.url);
		let path = doc.path || '';
		if (!path) return '';
		path = path.replace(/^documents\//, '/static/carcade_leasing_docs/');
		return buildAbsoluteUrl(path);
	};

	const loadApplications = async () => {
		setLoading(true);
		setError('');
		try {
			const params = { page, page_size: pageSize };
			if (statusFilter !== 'all') { params.status = statusFilter; }
			const response = await applicationsApi.getCarcadeLeasingApplications(params);
			let data = response.data.data || [];
			if (telegramFilter === 'telegram') { data = data.filter(app => app.telegram_data); }
			else if (telegramFilter === 'no-telegram') { data = data.filter(app => !app.telegram_data); }
			setApplications(data);
		} catch (error) {
			setError(error?.response?.data?.detail || 'Ошибка загрузки заявок');
			setApplications([]);
		} finally {
			setLoading(false);
		}
	};

	const onUpdateStatus = async (applicationId, newStatus) => {
		try {
			await applicationsApi.updateCarcadeLeasingStatus(applicationId, newStatus);
			await loadApplications();
		} catch (error) {
			setError(error?.response?.data?.detail || 'Ошибка обновления статуса');
		}
	};

	const onDelete = async (applicationId) => {
		if (!confirm('Удалить заявку? Действие необратимо.')) return;
		setDeleting((s) => ({ ...s, [applicationId]: true }));
		try {
			await applicationsApi.deleteCarcadeLeasingApplication(applicationId);
			await loadApplications();
		} catch (error) {
			setError(error?.response?.data?.detail || 'Ошибка удаления заявки');
		} finally {
			setDeleting((s) => ({ ...s, [applicationId]: false }));
		}
	};

	useEffect(() => {
		loadApplications();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [statusFilter, telegramFilter]);

	const total = applications.length;
	const totalProcessing = applications.filter(app => app.status === 'processing').length;
	const totalTelegram = applications.filter(app => app.telegram_data).length;

	return (
		<div>
			{/* Фильтры */}
			<div className="mb-6 flex flex-wrap gap-4">
				<select
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value)}
					className="px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary"
				>
					<option value="all">Все статусы</option>
					<option value="new">Новые</option>
					<option value="processing">В обработке</option>
					<option value="approved">Одобренные</option>
					<option value="rejected">Отклоненные</option>
				</select>

				<select
					value={telegramFilter}
					onChange={(e) => setTelegramFilter(e.target.value)}
					className="px-3 py-2 border border-border dark:border-dark-border rounded-md bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary"
				>
					<option value="all">Все заявки</option>
					<option value="telegram">С Telegram</option>
					<option value="no-telegram">Без Telegram</option>
				</select>
			</div>

			{/* Ошибка */}
			{error && (
				<div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
					<p className="text-red-600 dark:text-red-400">{error}</p>
				</div>
			)}

			{/* Панель данных */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<div className="flex items-center md:flex-col md:items-start md:justify-start gap-2 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-4">
					<h3 className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Всего</h3>
					<p className="mb-0 text-2xl font-bold text-text-primary dark:text-dark-text-primary">{total}</p>
				</div>
				<div className="flex items-center md:flex-col md:items-start md:justify-start gap-2 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-4">
					<h3 className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">В обработке</h3>
					<p className="mb-0 text-2xl font-bold text-text-primary dark:text-dark-text-primary">{totalProcessing}</p>
				</div>
				<div className="flex items-center md:flex-col md:items-start md:justify-start gap-2 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-4">
					<h3 className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">С Telegram</h3>
					<p className="mb-0 text-2xl font-bold text-text-primary dark:text-dark-text-primary">{totalTelegram}</p>
				</div>
			</div>

			{/* Список */}
			{loading ? (
				<div className="text-center py-8">
					<p className="text-text-secondary dark:text-dark-text-secondary">Загрузка...</p>
				</div>
			) : applications.length === 0 ? (
				<div className="text-center py-8">
					<p className="text-text-secondary dark:text-dark-text-secondary">Нет заявок</p>
				</div>
			) : (
				applications.map((app) => (
					<div key={app.id} className="bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-lg p-4 mb-4">
						<div className="flex flex-col-reverse m:flex-row justify-between items-start mb-3">
							<div>
								<h3 className="font-semibold text-text-primary dark:text-dark-text-primary">
									{app.personal_data.first_name} {app.personal_data.last_name}
								</h3>
								<p className="text-sm text-text-secondary dark:text-dark-text-secondary">
									{app.personal_data.phone}
								</p>
								{app.personal_data.email && (
									<p className="text-sm text-text-secondary dark:text-dark-text-secondary">
										{app.personal_data.email}
									</p>
								)}
							</div>
							<div className="text-right w-full">
								<StatusBadge status={app.status} />
								<p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
									{formatDate(app.created_at)}
								</p>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
							<div>
								<p className="text-sm font-medium text-text-primary dark:text-dark-text-primary">Тип лизинга</p>
								<p className="text-text-primary dark:text-dark-text-primary">
									{app.leasing_data.leasing_type === 'operational' ? 'Операционный' :
									 app.leasing_data.leasing_type === 'financial' ? 'Финансовый' :
									 app.leasing_data.leasing_type === 'return' ? 'Возвратный' : app.leasing_data.leasing_type}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium text-text-primary dark:text-dark-text-primary">Стоимость имущества</p>
								<p className="text-lg font-bold text-primary-600">{formatPrice(app.leasing_data.property_value)}</p>
							</div>
							<div>
								<p className="text-sm font-medium text-text-primary dark:text-dark-text-primary">Срок лизинга</p>
								<p className="text-text-primary dark:text-dark-text-primary">{app.leasing_data.term} месяцев</p>
							</div>
							<div>
								<p className="text-sm font-medium text-text-primary dark:text-dark-text-primary">Первоначальный взнос</p>
								<p className="text-text-primary dark:text-dark-text-primary">
									{app.leasing_data.down_payment ? formatPrice(app.leasing_data.down_payment) : 'Не указан'}
								</p>
							</div>
						</div>

						{/* Документы */}
						{app.documents && Object.keys(app.documents).length > 0 && (
							<div className="mb-3">
								<p className="text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">Документы</p>
								<div className="flex flex-col gap-2">
									{Object.entries(app.documents).map(([docType, docs]) => (
										<div key={docType}>
											<p className="text-xs text-text-secondary dark:text-dark-text-secondary mb-1">{DOC_LABELS[docType] || docType}</p>
											<div className="flex flex-wrap gap-2">
												{Array.isArray(docs) ? docs.map((doc, idx) => (
													<a
														key={`${docType}-${idx}`}
														href={buildDocumentUrl(doc)}
														target="_blank"
														rel="noreferrer"
														className="px-3 py-1 text-xs rounded bg-surface dark:bg-dark-surface border border-border dark:border-dark-border hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary"
													>
														Файл {idx + 1}
													</a>
												)) : null}
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Telegram */}
						{app.telegram_data && (
							<div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
								<p className="text-xs text-blue-600 dark:text-blue-400">Telegram: @{app.telegram_data.username}</p>
								{app.telegram_data.first_name && (
									<p className="text-xs text-blue-600 dark:text-blue-400">Имя: {app.telegram_data.first_name} {app.telegram_data.last_name || ''}</p>
								)}
								<p className="text-xs text-blue-600 dark:text-blue-400">ID: {app.telegram_data.user_id}</p>
								<button onClick={() => window.open(`https://t.me/${app.telegram_data.username}`, '_blank')} className="mt-2 px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded">Написать в Telegram</button>
							</div>
						)}

						<div className="flex flex-col m:flex-row gap-2">
							{app.status === 'new' && (
								<>
									<button onClick={() => onUpdateStatus(app.id, 'processing')} className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded">В обработку</button>
									<button onClick={() => onUpdateStatus(app.id, 'approved')} className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded">Одобрить</button>
									<button onClick={() => onUpdateStatus(app.id, 'rejected')} className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded">Отклонить</button>
								</>
							)}
							{app.status === 'processing' && (
								<>
									<button onClick={() => onUpdateStatus(app.id, 'approved')} className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded">Одобрить</button>
									<button onClick={() => onUpdateStatus(app.id, 'rejected')} className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded">Отклонить</button>
								</>
							)}
							{(app.status === 'approved' || app.status === 'rejected') && (
								<button
									onClick={() => onDelete(app.id)}
									disabled={!!deleting[app.id]}
									className="px-3 py-1 text-sm bg-error-500 hover:bg-error-600 disabled:opacity-50 text-white rounded"
									aria-label="Удалить заявку"
								>
									{deleting[app.id] ? 'Удаление…' : 'Удалить'}
								</button>
							)}
						</div>
					</div>
				))
			)}
		</div>
	);
};

export { CarcadeLeasingTab };
