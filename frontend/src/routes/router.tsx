import { Routes, Route } from 'react-router-dom';
import Home from './index';
import { AdminRoutes } from './admin';
import { TrainingRoutes } from './training';

export function AppRouter() {
    return (
        <Routes>
            {/* Rutas principales */}
            <Route path="/" element={<Home />} />

            {/* Rutas de administración */}
            <Route path="/admin/*" element={<AdminRoutes />} />

            {/* Rutas de entrenamiento */}
            <Route path="/training/*" element={<TrainingRoutes />} />
        </Routes>
    );
}
