import { Routes, Route } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { RaceRoutes } from './races';
import { AdminLogin } from './auth/AdminLogin';
import { AdminDashboard } from './dashboard';

export function AdminRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="races/*" element={<RaceRoutes />} />
            </Route>
        </Routes>
    );
}

export { AdminRoutes as default };
