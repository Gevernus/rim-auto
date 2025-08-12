import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const BottomActionsContext = createContext(null);

export const BottomActionsProvider = ({ children }) => {
  const [enabled, setEnabled] = useState(false);
  const [actions, setActionsState] = useState([]);

  const setActions = useCallback((newActions) => {
    setActionsState(Array.isArray(newActions) ? newActions : []);
    setEnabled(Array.isArray(newActions) && newActions.length > 0);
  }, []);

  const clearActions = useCallback(() => {
    setActionsState([]);
    setEnabled(false);
  }, []);

  const value = useMemo(() => ({ enabled, actions, setActions, clearActions }), [enabled, actions, setActions, clearActions]);

  return (
    <BottomActionsContext.Provider value={value}>
      {children}
    </BottomActionsContext.Provider>
  );
};

export const useBottomActions = () => {
  const ctx = useContext(BottomActionsContext);
  if (!ctx) throw new Error('useBottomActions must be used within BottomActionsProvider');
  return { setActions: ctx.setActions, clearActions: ctx.clearActions };
};

export const useBottomActionsState = () => {
  const ctx = useContext(BottomActionsContext);
  if (!ctx) throw new Error('useBottomActionsState must be used within BottomActionsProvider');
  return { enabled: ctx.enabled, actions: ctx.actions };
}; 