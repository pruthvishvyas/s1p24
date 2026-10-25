import { createContext, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { VIEWS } from '../utils/views.js';

export const OutcomeContext = createContext({ view: null, outcome: null });
export const useOutcome = () => useContext(OutcomeContext);

export function OutcomeProvider({ children }) {
  const { pathname } = useLocation();
  const id = pathname.replace(/^\/+/, '') || 'overview';
  const view = VIEWS.find((v) => v.id === id) || VIEWS[0];
  return <OutcomeContext.Provider value={{ view, outcome: view.group }}>{children}</OutcomeContext.Provider>;
}
