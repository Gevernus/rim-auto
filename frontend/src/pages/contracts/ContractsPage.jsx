import { useMemo, useState, useEffect } from 'react';
import { useAppLocation } from '../../shared/lib/navigation';
import { useAltBottomNav } from '../../shared/lib/bottom-nav/context';
import { openURL, openPhoneDialer, buildAbsoluteUrl } from '../../shared/lib/platform';
import { BackToMenuButton, DocxPreview } from '../../shared/ui';
import { contractsApi } from '../../shared/api/client';

const DOC_TITLES = {
  agency: 'Агентский договор (для заказа автомобиля)',
  consignment: 'Комиссионный договор (для реализации вашего автомобиля в нашем салоне)',
  sale: 'Договор купли-продажи (для купли-продажи автомобиля между физ лицами)',
};

// Контакты для альтернативного меню на странице договоров
const CONTRACTS_CONTACT = {
  phone: '+7-905-705-24-09',
  chatUrl: 'https://t.me/userinfobot',
};

const ContractsPage = () => {
  const { search } = useAppLocation();

  const initialType = useMemo(() => {
    const params = new URLSearchParams(search);
    const type = params.get('type');
    return type && ['agency', 'consignment', 'sale'].includes(type) ? type : null;
  }, [search]);

  const [selectedType, setSelectedType] = useState(initialType);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  const currentDoc = selectedType
    ? { title: DOC_TITLES[selectedType], type: selectedType, file: buildAbsoluteUrl(meta?.url || '') }
    : null;

  // Альтернативное меню: Чат и Звонок
  const altNavConfig = useMemo(() => ({
    chat: {
      label: 'Чат',
      onClick: () => {
        if (!CONTRACTS_CONTACT.chatUrl) return;
        openURL(CONTRACTS_CONTACT.chatUrl);
      },
    },
    call: {
      label: 'Звонок',
      onClick: () => {
        if (!CONTRACTS_CONTACT.phone) return;
        openPhoneDialer(CONTRACTS_CONTACT.phone);
      },
    },
  }), []);

  const { activate, deactivate } = useAltBottomNav(altNavConfig);

  useEffect(() => {
    activate();
    return () => deactivate();
  }, [activate, deactivate]);

  useEffect(() => {
    if (!selectedType) {
      setMeta(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    contractsApi
      .get(selectedType)
      .then((res) => {
        if (cancelled) return;
        setMeta(res.data?.data || null);
      })
      .catch(() => {
        if (cancelled) return;
        setMeta(null);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedType]);

  return (
    <div className="container section-padding">
      <div className="max-w-5xl mx-auto">
		<div className="flex items-center justify-between mb-6">
        	<h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">Договора</h1>     	
        	<BackToMenuButton />      	
		</div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setSelectedType('agency')}
            className={`p-4 bg-surface-elevated dark:bg-dark-surface-elevated border rounded-lg hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors text-left ${
              selectedType === 'agency'
                ? 'border-primary-600 ring-2 ring-primary-600'
                : 'border-border dark:border-dark-border'
            }`}
            aria-label="Открыть агентский договор"
          >
            <div className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-1">Агентский договор</div>
            <div className="text-sm text-text-secondary dark:text-dark-text-secondary">для заказа автомобиля</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('consignment')}
            className={`p-4 bg-surface-elevated dark:bg-dark-surface-elevated border rounded-lg hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors text-left ${
              selectedType === 'consignment'
                ? 'border-primary-600 ring-2 ring-primary-600'
                : 'border-border dark:border-dark-border'
            }`}
            aria-label="Открыть комиссионный договор"
          >
            <div className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-1">Комиссионный договор</div>
            <div className="text-sm text-text-secondary dark:text-dark-text-secondary">для реализации вашего автомобиля в нашем салоне</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('sale')}
            className={`p-4 bg-surface-elevated dark:bg-dark-surface-elevated border rounded-lg hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors text-left ${
              selectedType === 'sale'
                ? 'border-primary-600 ring-2 ring-primary-600'
                : 'border-border dark:border-dark-border'
            }`}
            aria-label="Открыть договор купли-продажи"
          >
            <div className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-1">Договор купли-продажи</div>
            <div className="text-sm text-text-secondary dark:text-dark-text-secondary">для купли-продажи автомобиля между физ лицами</div>
          </button>
        </div>

        {currentDoc ? (
          <div className="bg-surface-secondary dark:bg-dark-surface-secondary border border-border dark:border-dark-border rounded-lg p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-3">
              <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">{currentDoc.title}</h2>
              {meta ? (
                <a
                  href={currentDoc.file}
                  download
                  className="px-3 py-2 rounded-md bg-button-primary text-white hover:bg-primary-700 transition-colors"
                >
                  Скачать
                </a>
              ) : (
                <button
                  type="button"
                  disabled={true}
                  className="px-3 py-2 rounded-md bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border text-text-muted dark:text-dark-text-muted cursor-not-allowed"
                >
                  Скачать
                </button>
              )}
            </div>

                         {meta ? (
               <DocxPreview url={currentDoc.file} />
             ) : (
              <div className="p-6 text-center text-text-secondary dark:text-dark-text-secondary">
                {loading ? 'Загрузка…' : 'Файл будет добавлен позже. Вы сможете прочитать и скачать договор после загрузки.'}
              </div>
            )}
          </div>
        ) : (
          <p className="text-text-secondary dark:text-dark-text-secondary">Выберите тип договора для просмотра.</p>
        )}
      </div>
    </div>
  );
};





export { ContractsPage };