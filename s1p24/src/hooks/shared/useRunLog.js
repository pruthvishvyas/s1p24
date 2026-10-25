import { useData } from '../useData.js';
import { useContract } from './useContract.js';
import { dataPath } from '../../utils/contract.js';

export function useRunLog() {
  const { contract } = useContract();
  return useData(contract ? dataPath(contract.meta.summary) : null);
}
