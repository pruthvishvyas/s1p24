import { useContext } from 'react';
import { ExplorerContext } from '../../context/ExplorerContext.jsx';

export const useCrossFilter = () => useContext(ExplorerContext);
