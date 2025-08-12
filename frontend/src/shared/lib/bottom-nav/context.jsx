import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const BottomNavContext = createContext({
  mode: 'default', // 'default' | 'alternate'
  config: null,
  setAlternate: () => {},
  reset: () => {},
});

const BottomNavProvider = ({ children }) => {
  const [mode, setMode] = useState('default');
  const [config, setConfig] = useState(null);

  const setAlternate = useCallback((nextConfig) => {
    setConfig(nextConfig || null);
    setMode(nextConfig ? 'alternate' : 'default');
  }, []);

  const reset = useCallback(() => {
    setConfig(null);
    setMode('default');
  }, []);

  const value = useMemo(() => ({ mode, config, setAlternate, reset }), [mode, config, setAlternate, reset]);

  return (
    <BottomNavContext.Provider value={value}>{children}</BottomNavContext.Provider>
  );
};

const useBottomNav = () => useContext(BottomNavContext);

const useAltBottomNav = (config) => {
  const { setAlternate, reset } = useBottomNav();

  const activate = useCallback(() => {
    setAlternate(config);
  }, [setAlternate, config]);

  const deactivate = useCallback(() => {
    reset();
  }, [reset]);

  return {
    activate,
    deactivate,
    setAlternate,
    reset,
  };
};

export { BottomNavProvider, useBottomNav, useAltBottomNav }; 