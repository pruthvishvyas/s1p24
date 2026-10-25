import { createContext } from 'react';
import { useData } from '../hooks/useData.js';

export const ContractContext = createContext({ contract: null, loading: true, error: null });

export function ContractProvider({ children }) {
  const { data, loading, error } = useData('/data/meta/contract.json');
  const ok = data && data.outcomes && data.terminology;
  const value = { contract: ok ? data : null, loading, error: error || (!loading && !ok ? 'Contract file has an unexpected shape' : null) };
  return <ContractContext.Provider value={value}>{children}</ContractContext.Provider>;
}
