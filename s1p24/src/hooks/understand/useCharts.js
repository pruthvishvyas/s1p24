import { useContract } from '../shared/useContract.js';
import { dataPath } from '../../utils/contract.js';

// Returns the list of chart JSON paths from the contract; each ChartCard loads its own file via useData.
export function useCharts() {
  const { contract } = useContract();
  return contract ? (contract.outcomes.understand.charts || []).map(dataPath) : [];
}
