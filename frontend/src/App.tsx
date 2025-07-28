import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import TrainingMenu from './routes/training/menu/index.tsx'
import type { JSX } from 'react'
import { usePlayer } from './contexts/PlayerContext.tsx'

function App(): JSX.Element {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/training/menu" element={<TrainingMenu />} />
                <Route
                    path="/training/room"
                    element={<div>Training Room</div>}
                />
                <Route
                    path="/training/simulation"
                    element={<div>Training Simulation</div>}
                />
            </Routes>
        </Router>
    )
}

function Home(): JSX.Element {
    const navigate = useNavigate()
    const { setPlayer } = usePlayer()

    function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
        e.preventDefault()
        const form = e.currentTarget
        const username = (
            form.elements.namedItem('username') as HTMLInputElement
        )?.value
        // const password = (form.elements.namedItem('password') as HTMLInputElement)?.value;
        // Register user in context
        setPlayer({ name: username, aiGeneration: 1 })
        navigate('/training/menu')
    }

    return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-background">
            <form
                className="flex flex-col gap-5 w-full max-w-xs bg-white/70 rounded-xl shadow-lg px-6 py-8 border border-accent"
                onSubmit={handleSubmit}
            >
                <h2 className="text-xl font-semibold text-center mb-2 text-primary tracking-tight">
                    Crea tu jugador
                </h2>
                <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    placeholder="Nombre de usuario"
                    className="w-full px-4 py-2 rounded-md border border-accent bg-background text-primary text-base outline-none focus:ring-2 focus:ring-secondary transition"
                />
                <input
                    id="password"
                    name="password"
                    type="text"
                    pattern="\d{4}"
                    maxLength={4}
                    minLength={4}
                    required
                    inputMode="numeric"
                    placeholder="Contraseña de 4-dígitos"
                    className="w-full px-4 py-2 rounded-md border border-accent bg-background text-primary text-base outline-none focus:ring-2 focus:ring-secondary transition"
                />
                <button
                    type="submit"
                    className="w-full mt-2 rounded-md px-4 py-2 font-medium bg-primary text-white hover:bg-secondary hover:text-background transition-colors focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                    Empezar
                </button>
            </form>
        </div>
    )
}

export default App
