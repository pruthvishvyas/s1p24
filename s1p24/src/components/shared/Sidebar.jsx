import { NavLink } from 'react-router-dom';
import { VIEWS, GROUPS } from '../../utils/views.js';
import { useContract } from '../../hooks/shared/useContract.js';

export function Sidebar() {
  const { contract } = useContract();
  return (
    <nav className="sidebar" aria-label="Main">
      <div className="brand">{contract.project.name}</div>
      {GROUPS.map((g) => (
        <div key={g}>
          <div className="nav-group">{g}</div>
          {VIEWS.filter((v) => v.group === g).map((v) => (
            <NavLink key={v.id} to={'/' + v.id} className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>{v.label}</NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}
