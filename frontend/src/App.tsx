import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import TrainingMenu from './routes/training/menu/index.tsx'
import ProtectedRoute from './lib/components/ProtectedRoute.tsx'
import type { JSX } from 'react'
import Home from './routes/index.tsx'
import AdminHome from './routes/admin/index.tsx'

export default function App(): JSX.Element {
    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <ProtectedRoute redirectIfLoggedIn>
                            <Home />
                        </ProtectedRoute>
                    }
                />
                <Route path="/admin" element={<AdminHome />} />
                <Route
                    path="/training/menu"
                    element={
                        <ProtectedRoute>
                            <TrainingMenu />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/training/room"
                    element={
                        <ProtectedRoute>
                            <div>Training Room</div>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/training/simulation"
                    element={
                        <ProtectedRoute>
                            <div>Training Simulation</div>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    )
}
