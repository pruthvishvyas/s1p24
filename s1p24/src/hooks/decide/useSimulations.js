import { useContract } from '../shared/useContract.js';
import { dataPath, findPath } from '../../utils/contract.js';

export function useSimulationPath(match) {
  const { contract } = useContract();
  return contract ? dataPath(findPath(contract.outcomes.decide.simulations, match)) : null;
}
