import { useData } from '../useData.js';
import { useContract } from '../shared/useContract.js';
import { dataPath } from '../../utils/contract.js';

export function useKPIs() {
  const { contract } = useContract();
  return useData(contract ? dataPath(contract.outcomes.understand.kpis) : null);
}
