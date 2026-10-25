import { useData } from '../useData.js';
import { useContract } from '../shared/useContract.js';
import { dataPath } from '../../utils/contract.js';

export function useGoals() {
  const { contract } = useContract();
  return useData(contract ? dataPath(contract.outcomes.decide.goals) : null);
}
