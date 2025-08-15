import { useEffect, useState } from 'react';
import { contractsApi } from '../../../shared/api/client';
import { buildAbsoluteUrl } from '../../../shared/lib/platform';
import { DocxPreview } from '../../../shared/ui/DocxPreview';

const TYPES = [
  { key: 'agency', label: 'Агентский договор' },
  { key: 'consignment', label: 'Комиссионный договор' },
  { key: 'sale', label: 'Договор купли-продажи' },
];

const ContractsTab = () => {
  const [items, setItems] = useState({});
  const [uploading, setUploading] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await contractsApi.list();
      const arr = res.data?.data || [];
      const map = {};
      for (const m of arr) map[m.type] = m;
      setItems(map);
    } catch {
      setItems({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleUpload = async (type, file) => {
    if (!file) return;
    
    // Проверяем расширение файла
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.docx') && !fileName.endsWith('.doc')) {
      alert('Пожалуйста, выберите файл .docx или .doc');
      return;
    }
    
    setUploading((s) => ({ ...s, [type]: true }));
    try {
      await contractsApi.upload(type, file);
      await fetchAll();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Ошибка загрузки файла. Попробуйте еще раз.');
    } finally {
      setUploading((s) => ({ ...s, [type]: false }));
    }
  };

  const renderRow = (t) => {
    const meta = items[t.key];
    const url = meta?.url || '';

    return (
      <div key={t.key} className="border border-border dark:border-dark-border rounded-lg p-4 bg-surface-elevated dark:bg-dark-surface-elevated">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="font-semibold text-text-primary dark:text-dark-text-primary">{t.label}</div>
            {meta ? (
              <div className="text-sm text-text-secondary dark:text-dark-text-secondary">Обновлён: {new Date(meta.updated_at).toLocaleString()} • {Math.round((meta.size || 0) / 1024)} KB</div>
            ) : (
              <div className="text-sm text-text-secondary dark:text-dark-text-secondary">Файл не загружен</div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {meta && (
              <a href={buildAbsoluteUrl(url)} download className="px-3 py-2 rounded-md bg-button-info text-white hover:bg-primary-700 transition-colors">
                Скачать
              </a>
            )}
            <label className="px-3 py-2 rounded-md bg-surface dark:bg-dark-surface border border-border dark:border-dark-border cursor-pointer">
              <input
                type="file"
                accept=".doc,.docx"
                className="hidden"
                onChange={(e) => handleUpload(t.key, e.target.files?.[0])}
                aria-label={`Загрузить ${t.label}`}
              />
              {uploading[t.key] ? 'Загрузка…' : meta ? 'Заменить .docx' : 'Загрузить .docx'}
            </label>
            {meta && (
              <button
                type="button"
                onClick={async () => {
                  if (!confirm('Удалить документ?')) return;
                  try {
                    await contractsApi.remove(t.key);
                    await fetchAll();
                  } catch (error) {
                    console.error('Delete error:', error);
                    alert('Ошибка удаления файла');
                  }
                }}
                className="px-3 py-2 rounded-md ml-auto bg-error-500 text-white hover:bg-error-600 transition-colors"
              >
                Удалить
              </button>
            )}
          </div>
        </div>
        {url ? (
                     <DocxPreview 
             key={`${t.key}-${meta?.updated_at || 'none'}`}
             url={buildAbsoluteUrl(url)} 
             className="max-h-[600px] overflow-y-auto"
           />
        ) : (
          <div className="text-sm text-text-secondary dark:text-dark-text-secondary">Нет предпросмотра</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary">Управление договорами</h2>
      {loading && <div className="text-text-secondary dark:text-dark-text-secondary">Загрузка…</div>}
      <div className="grid grid-cols-1 gap-4">
        {TYPES.map(renderRow)}
      </div>
    </div>
  );
};



export { ContractsTab };


