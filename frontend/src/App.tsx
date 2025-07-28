import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
            </Routes>
        </Router>
    )
}

function Home() {
    return (
        <div className="flex flex-col justify-center items-center min-h-screen w-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white">
            <h2 className="text-5xl font-bold mb-4">
                Welcome to Low Poly Car Game
            </h2>
            <p className="text-xl mb-8 max-w-2xl text-center">
                A modular 3D car racing game built with React and Three.js
            </p>
            <Link
                to="/"
                className="bg-game-primary text-white px-8 py-4 text-xl rounded-lg hover:bg-red-600 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
                Play Single Player
            </Link>
        </div>
    )
}

export default App
