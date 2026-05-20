import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Home } from './page/Home';
import { About } from './page/About';
import { Inventory } from './page/Inventory';
import './index.css'
import { Sidebar } from './components/SideBar';
import { Users } from './page/Users';

export default () => {
    return (
        <MemoryRouter>
            <div className="flex h-screen relative">
                <Sidebar />
                <main className="flex-1 overflow-auto pl-[52px] ">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/users" element={<Users />} />
                    </Routes>
                </main>
            </div>
        </MemoryRouter>
    )
}
