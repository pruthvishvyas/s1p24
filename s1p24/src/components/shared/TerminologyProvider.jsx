import { useMemo } from 'react';
import { TerminologyContext } from '../../context/TerminologyContext.jsx';
import { makeTerm } from '../../utils/terminology.js';

export { useTerm } from '../../context/TerminologyContext.jsx';

export function TerminologyProvider({ terms, children }) {
  const term = useMemo(() => makeTerm(terms), [terms]);
  return <TerminologyContext.Provider value={term}>{children}</TerminologyContext.Provider>;
}
