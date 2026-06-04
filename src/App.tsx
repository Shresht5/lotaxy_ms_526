// @ts-ignore
import './index.css'
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Inventory } from './page/Inventory';
import { Sidebar } from './components/SideBar';
import { Users } from './page/Users';
import { HR } from './page/HR';
import { Clients } from './page/Client';
import { Projects } from './page/Project';
import { Orders } from './page/Orders';
import { Dashboard } from './page/Dashboard';
import { Store } from './store/Store'
import { Analytics } from './page/Analytics';
import Setting from './page/Setting';

export default () => {
    return (
        <MemoryRouter>
            <div className="flex h-screen relative">
                <Store>
                    <Sidebar />
                    <main className="flex-1 overflow-auto pl-[52px]">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/hr" element={<HR />} />
                            <Route path="/project" element={<Projects />} />
                            <Route path="/clients" element={<Clients />} />
                            <Route path="/sales" element={<Orders />} />
                            <Route path="/inventory" element={<Inventory />} />
                            <Route path="/analytics" element={<Analytics />} />
                            <Route path="/users" element={<Users />} />
                            <Route path="/setting" element={<Setting />} />
                        </Routes>
                    </main>
                </Store>
            </div>
        </MemoryRouter>
    )
}
