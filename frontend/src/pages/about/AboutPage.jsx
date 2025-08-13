import { useEffect, useRef, useState } from "react";
import { useAutoCarousel } from "../../shared/hooks/useAutoCarousel";
import { useAccordion } from "../../shared/hooks/useAccordion";
import Albert from "../../assets/about/Albert.jpg";
import Anastasia from "../../assets/about/Anastasia.jpg";
import Artem from "../../assets/about/Artem.jpg";
import Denis from "../../assets/about/Denis.jpg";
import Dmitry from "../../assets/about/Dmitry.jpg";
import Irina from "../../assets/about/Irina.jpg";
import Kanied from "../../assets/about/Kanied.jpg";
import Nikita from "../../assets/about/Nikita.jpg";
import Rasskazov from "../../assets/about/Rasskazov.jpg";
import Sergei from "../../assets/about/Sergei.jpg";
import Valeria from "../../assets/about/Valeria.jpg";
import bankAlfa from "../../assets/partners/bank_alfa.jpg";
import bankOtp from "../../assets/partners/bank_otp.jpg";
import bankRshb from "../../assets/partners/bank_rshb.jpg";
import bankRenesans from "../../assets/partners/bank_renesans.jpg";
import bankUral from "../../assets/partners/bank_ural.jpg";
import insuranceReco from "../../assets/partners/Insurance_reco.jpg";
import guaranteeKarso from "../../assets/partners/guarantee_karso.jpg";
import leasingAspect from "../../assets/partners/leasing_aspect.jpg";
import leasingCarcade from "../../assets/partners/leasing_carcade.jpg";
import leasingDirect from "../../assets/partners/leasing_direct.jpg";
import serviceFit from "../../assets/partners/service_fit.jpg";
import primeWrap from "../../assets/partners/primeWrap.png";

const team = [
  { photo: Rasskazov, name: "Рассказов Руслан Викторович", role: "Директор компании", socials: {} },
  { photo: Albert, name: "Альберт", role: "Руководитель авто салона г. Москва", socials: {} },
  { photo: Irina, name: "Ирина", role: "Руководитель авто салона г.Бишкек", socials: {} },
  { photo: Anastasia, name: "Анастасия", role: "Руководитель авто салона г. Кемерово", socials: {} },
  { photo: Artem, name: "Артём", role: "Руководитель по развитию", socials: {} },
  { photo: Nikita, name: "Никита", role: "Руководитель отдела логистики", socials: {} },
  { photo: Sergei, name: "Сергей", role: "Менеджер", socials: {} },
  { photo: Kanied, name: "Каниед", role: "Менеджер - переводчик", socials: {} },
  { photo: Dmitry, name: "Дмитрий", role: "Менеджер", socials: {} },
  { photo: Valeria, name: "Валерия", role: "Бухгалтер", socials: {} },
  { photo: Denis, name: "Денис", role: "Юрист", socials: {} },
];

const offices = [
  { city: "Москва", lines: ["Дмитровское шоссе 163А", "ТРЦ Рио вход \"Г\""] },
  { city: "Кемерово", lines: ["ул.Гагарина 26", "ТРЦ Гагаринский офис 212"] },
  { city: "Минск", lines: ["ул. Свердлова, 11. ТЦ Centropol."] },
  { city: "Китай, г.Хоргос", lines: ["Международный торговый центр (И.У)"] },
  { city: "Бишкек", lines: ["ул.Ауэзова 1/5 мерово"] },
];

const services = [
  {
    title: "Поставки авто",
    description: "Прямые поставки новых и Б/У автомобилей из США, Японии, Китая, Кореи, Грузии.",
  },
  {
    title: "Таможенное оформление",
    description: "Брокерские услуги по таможенной очистке в Беларуси, Кыргызстане, Казахстане и России.",
  },
  {
    title: "СБКТС и ЭПТС",
    description: "Помощь в получении СБКТС и оформлении электронного ПТС.",
  },
  {
    title: "Автоподбор",
    description: "Подбор автомобиля под нужды клиента, экспертные консультации и проверка истории.",
  },
  {
    title: "Автокредит",
    description: "Автокредит без залога, гибкие условия и партнёрские программы банков.",
  },
  {
    title: "Логистика",
    description: "Полный цикл логистики: от международной доставки до выдачи клиенту.",
  },
  {
    title: "Детейлинг",
    description: "Детейлинг-услуги: защитные покрытия, химчистка, полировка, антигравий и др.",
  },
  {
    title: "Запчасти",
    description: "Поставка оригинальных и аналоговых запчастей, подбор по VIN и каталогу.",
  },
];

const partners = [
  serviceFit,
  bankUral,
  guaranteeKarso,
  insuranceReco,
  leasingCarcade,
  leasingDirect,
  leasingAspect,
  bankOtp,
  bankRshb,
  bankAlfa,
  bankRenesans,
  primeWrap,
];

const AboutPage = () => {
  const carouselRef = useRef(null);
  const { attach, pause, resume } = useAutoCarousel({ step: 192, intervalMs: 2500, enabled: true, loop: true });
  const { openIndex, isOpen, toggle } = useAccordion();

  useEffect(() => {
    if (!carouselRef.current) return;
    const el = carouselRef.current;

    const controller = {
      getScrollLeft: () => el.scrollLeft,
      getScrollWidth: () => el.scrollWidth,
      scrollBy: (dx, behavior = 'smooth') => el.scrollBy({ left: dx, behavior }),
      scrollTo: (left, behavior = 'auto') => el.scrollTo({ left, behavior }),
      addEventListener: (event, handler) => el.addEventListener(event, handler),
      removeEventListener: (event, handler) => el.removeEventListener(event, handler),
    };

    attach(controller);
  }, [attach]);

  const loopedPartners = [...partners, ...partners];

  return (
    <div className="container section-padding">
      <h1 className="text-3xl font-bold mb-8">О компании</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Команда РИМ АВТО</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {team.map((member) => (
            <div key={member.name} className="bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-xl p-4 flex flex-col items-center text-center">
              <img src={member.photo} alt={member.name} className="w-40 h-40 object-cover rounded-full mb-4 border border-border dark:border-dark-border" loading="lazy" />
              <div className="font-semibold text-text-primary dark:text-dark-text-primary">{member.name}</div>
              <div className="text-sm text-text-secondary dark:text-dark-text-secondary">{member.role}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Наши услуги</h2>
        <div className="md:ml-12 space-y-3 max-w-2xl">
          {services.map((item, idx) => {
            const expanded = isOpen(idx);
            const contentId = `service-panel-${idx}`;
            const buttonId = `service-button-${idx}`;
            return (
              <div key={item.title} className="bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-xl">
                <button
                  id={buttonId}
                  type="button"
                  className="w-full text-left px-4 py-3 flex items-center justify-between gap-3"
                  aria-expanded={expanded}
                  aria-controls={contentId}
                  onClick={() => toggle(idx)}
                >
                  <span className="font-medium text-text-primary dark:text-dark-text-primary">{item.title}</span>
                  <span className="text-text-secondary dark:text-dark-text-secondary" aria-hidden>
                    {expanded ? '−' : '+'}
                  </span>
                </button>
                {expanded && (
                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="px-4 pb-4 text-sm text-text-secondary dark:text-dark-text-secondary"
                  >
                    {item.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Наши партнёры</h2>

        {/* Mobile carousel */}
        <div className="sm:hidden -mx-4 px-4">
          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2"
            onMouseEnter={pause}
            onMouseLeave={resume}
            onTouchStart={pause}
            onTouchEnd={resume}
          >
            {loopedPartners.map((logo, idx) => (
              <div key={idx} className="shrink-0 snap-start w-52">
                <img src={logo} alt="Партнёр" loading="lazy" className="w-full h-20 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-xl object-contain p-1.5" />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop grid */}
        <div className="hidden sm:grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center">
          {partners.map((logo, idx) => (
            <div key={idx} className="h-20 flex items-center justify-center p-4 bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-xl ">
              <img src={logo} alt="Партнёр" className="max-h-12  object-contain" loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Офисы РИМ АВТО</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {offices.map((office) => (
            <div key={office.city} className="bg-surface-elevated dark:bg-dark-surface-elevated border border-border dark:border-dark-border rounded-xl p-4">
              <div className="font-semibold text-text-primary dark:text-dark-text-primary mb-2">{office.city}</div>
              <ul className="space-y-1 text-text-secondary dark:text-dark-text-secondary">
                {office.lines.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export { AboutPage }; 