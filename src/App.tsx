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
import { PasswordGate } from './components/PasswordGate';
import TitleBar from './components/TitleBar';

export default () => {
    return (
        <div className={'relative h-screen w-screen '}>
            <TitleBar />
            <MemoryRouter>
                <Store>
                    <PasswordGate>
                        <div className=' h-full w-full relative'>
                            <Sidebar />
                            <main className="flex-1 overflow-auto pl-[52px] page-transition">
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
                        </div>
                    </PasswordGate>
                </Store>
            </MemoryRouter>
        </div>
    )
}