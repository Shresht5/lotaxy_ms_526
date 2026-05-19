import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Home } from './page/Home';
import { About } from './page/About';
import { Inventory } from './page/Inventory';
import './index.css'
import { Sidebar } from './components/SideBar';

export default () => {
    return (
        <MemoryRouter>
            <div className="flex h-screen relative">
                <Sidebar />
                <main className="flex-1 overflow-auto pl-[180px]">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/inventory" element={<Inventory />} />
                    </Routes>
                </main>
            </div>
        </MemoryRouter>
    )
}
