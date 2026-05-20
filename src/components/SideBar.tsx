import { useNavigate, useLocation } from 'react-router-dom';

const links = [
    { path: '/', icon: 'ti-layout-dashboard', label: 'Dashboard' },
    { path: '/hr', icon: 'ti-id-badge', label: 'HR' },
    { path: '/project', icon: 'ti-checklist', label: 'Projects' },
    { path: '/customers', icon: 'ti-user-circle', label: 'Customers' },
    { path: '/sales', icon: 'ti-shopping-cart', label: 'Sales' },
    { path: '/inventory', icon: 'ti-package', label: 'Inventory' },
    { path: '/analytics', icon: 'ti-chart-bar', label: 'Analytics' },
    { path: '/users', icon: 'ti-users', label: 'Users' }
];

const bottom = [
    { path: '/settings', icon: 'ti-settings', label: 'Settings' },
];

export function Sidebar() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const Item = ({ path, icon, label }: typeof links[0]) => (
        <button
            title={label}
            onClick={() => navigate(path)}
            className={`
        group flex items-center gap-3 px-2 py-2 rounded-lg w-full
        transition-colors duration-150 cursor-pointer
        ${pathname === path
                    ? ' text-[var(--primary-bold-color)]  hover:bg-white'
                    : 'text-[var(--primary-light-color)] hover:bg-white'}
      `}
        >
            <i className={`ti ${icon} text-lg w-5 shrink-0 text-center`} aria-hidden="true" />
            <span className="text-sm font-medium whitespace-nowrap overflow-hidden opacity-0 group-hover/nav:opacity-100 transition-opacity duration-100 delay-75">
                {label}
            </span>
        </button>
    );

    return (
        <nav className=" absolute top-0 left-0 z-10 group/nav flex flex-col gap-1 px-2 py-3  w-[52px] hover:w-[180px]     transition-[width] duration-200 ease-in-out      bg-[var(--primary-very-light-color)] border-r       h-screen overflow-hidden shrink-0 [&.expanded]:w-[180px]    ">
            {links.map(l => <Item key={l.path} {...l} />)}
            <div className="flex-1" />
            {bottom.map(l => <Item key={l.path} {...l} />)}
        </nav>
    );
}