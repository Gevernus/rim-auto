import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { setNavigateFunction } from '../shared/lib/navigation';
import { ThemeProvider } from '../shared/lib/ThemeProvider';
import { useTelegramAuth } from '../features/auth';

// Страницы
import { CatalogPage } from '../pages/catalog';
import { CarPage } from '../pages/car';
import { OrderPage } from '../pages/order';
import { AboutPage } from '../pages/about';
import { AuthDebugPage } from '../pages/debug/AuthDebugPage';
import { CreditPage } from '../pages/credit';
import { LeasingPage } from '../pages/leasing';
import { AdminPage } from '../pages/admin';
import { FavoritesPage } from '../pages/favorites';
import { MessagesPage } from '../pages/messages';
import { MenuPage } from '../widgets/nav';
import { MotoPage } from '../pages/moto';
import { SpecialTechPage } from '../pages/special-tech';
import { PartsPage } from '../pages/parts';

// Виджеты
import { Header } from '../widgets/header';
import { MobileBottomNavigation } from '../widgets/nav';
import { Footer } from '../widgets/footer';

// Компонент для инициализации навигации
const NavigationProvider = ({ children }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Инициализируем функцию навигации для использования вне компонентов
    setNavigateFunction(navigate);
  }, [navigate]);

  return children;
};

// Компонент для инициализации авторизации
const AuthProvider = ({ children }) => {
  const { initialize } = useTelegramAuth();
  
  useEffect(() => {
    // Инициализируем авторизацию при запуске приложения
    initialize();
  }, []); // Пустой массив зависимостей - вызываем только один раз

  return children;
};

// Компонент макета с хедером и футером
const Layout = ({ children }) => {
  return (
    <NavigationProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary transition-colors">
          <Header />
          <main className="flex-1 xl:pb-0 md:pb-0 pb-24 md:pt-0 pt-16">
            {children}
          </main>
          <Footer />
          <MobileBottomNavigation />
        </div>
      </AuthProvider>
    </NavigationProvider>
  );
};

// Временная страница-заглушка для новых разделов
const ComingSoonPage = ({ title }) => {
  return (
    <div className="container section-padding">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-text-primary dark:text-dark-text-primary">
          {title}
        </h1>
        <p className="text-lg text-text-secondary dark:text-dark-text-secondary">
          Раздел находится в разработке. Скоро здесь появится полезная информация.
        </p>
      </div>
    </div>
  );
};

// Создаем роутер
const router = createBrowserRouter([
  // Основное меню
  {
    path: "/cars",
    element: <Layout><CatalogPage /></Layout>,
  },
  {
    path: "/special-tech",
    element: <Layout><SpecialTechPage /></Layout>,
  },
  {
    path: "/parts",
    element: <Layout><PartsPage /></Layout>,
  },
  {
    path: "/moto",
    element: <Layout><MotoPage /></Layout>,
  },
  
  // Мобильная навигация

  {
    path: "/favorites",
    element: <Layout><FavoritesPage /></Layout>,
  },
  {
    path: "/messages",
    element: <Layout><MessagesPage /></Layout>,
  },
  {
    path: "/menu",
    element: <Layout><MenuPage /></Layout>,
  },
  
  // Дополнительное меню
  {
    path: "/news",
    element: <Layout><ComingSoonPage title="Новости" /></Layout>,
  },
  {
    path: "/services",
    element: <Layout><ComingSoonPage title="Дополнительные услуги" /></Layout>,
  },
  {
    path: "/reviews",
    element: <Layout><ComingSoonPage title="Отзывы" /></Layout>,
  },
  {
    path: "/about",
    element: <Layout><AboutPage /></Layout>,
  },
  {
    path: "/insurance",
    element: <Layout><ComingSoonPage title="Страховка" /></Layout>,
  },
  {
    path: "/credit",
    element: <Layout><CreditPage /></Layout>,
  },
  {
    path: "/leasing",
    element: <Layout><LeasingPage /></Layout>,
  },
  
  // Дополнительные страницы
  {
    path: "/car/:id",
    element: <Layout><CarPage /></Layout>,
  },
  {
    path: "/order",
    element: <Layout><OrderPage /></Layout>,
  },
  {
    path: "/auth-debug",
    element: <Layout><AuthDebugPage /></Layout>,
  },
  {
    path: "/admin",
    element: <Layout><AdminPage /></Layout>,
  },
  
  // Перенаправление с корневого пути на автомобили
  {
    path: "/",
    element: <Layout><CatalogPage /></Layout>,
  },
]);

const App = () => {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export default App; 