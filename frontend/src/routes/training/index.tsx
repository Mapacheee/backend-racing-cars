import { Routes, Route } from 'react-router-dom';
import TrainingMenu from './menu';
import SimulationPage from './simulation';

export function TrainingRoutes() {
    return (
        <Routes>
            <Route path="/menu" element={<TrainingMenu />} />
            <Route path="/simulation" element={<SimulationPage />} />
            <Route path="/" element={<TrainingMenu />} />
        </Routes>
    );
}

export { TrainingRoutes as default };
