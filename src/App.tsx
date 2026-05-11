import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Home } from './page/Home';
import { About } from './page/About';
import './index.css'

export default () => {
    return (
        <MemoryRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
            </Routes>
        </MemoryRouter>
    )
}
