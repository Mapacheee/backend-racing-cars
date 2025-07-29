import { Routes, Route } from 'react-router-dom';
import Home from './index';
import { AdminRoutes } from './admin';
import { TrainingRoutes } from './training';

export function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin/*" element={<AdminRoutes />} />
            <Route path="/training/*" element={<TrainingRoutes />} />
        </Routes>
    );
}
