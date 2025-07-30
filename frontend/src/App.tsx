import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom'
import TrainingMenu from './routes/training/menu/index.tsx'
import ProtectedRoute from './lib/components/ProtectedRoute.tsx'
import type { JSX } from 'react'
import Home from './routes/index.tsx'
import AdminHome from './routes/admin/index.tsx'
import TrainingSimulation from './routes/training/simulation/index.tsx'

export default function App(): JSX.Element {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route element={<ProtectedRoute redirectIfLoggedIn />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/admin" element={<AdminHome />} />
                </Route>

                {/* Private routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/training/menu" element={<TrainingMenu />} />
                    <Route
                        path="/training/room"
                        element={<div>Training Simulation</div>}
                    />
                    <Route
                        path="/training/simulation"
                        element={<TrainingSimulation />}
                    />

                    {/* Default route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </Router>
    )
}
