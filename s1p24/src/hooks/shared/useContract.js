import { useContext } from 'react';
import { ContractContext } from '../../context/ContractContext.jsx';

export function useContract() {
  return useContext(ContractContext);
}
