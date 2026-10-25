import { createContext, useContext } from 'react';

export const TerminologyContext = createContext((k) => k);
export const useTerm = () => useContext(TerminologyContext);
