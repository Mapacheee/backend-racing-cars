import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../lib/contexts/AuthContext'
import type { PlayerAuth } from '../../../lib/types/auth'
import { useFormik } from 'formik'
import { useState } from 'react'

export default function TrainingMenu() {
    const navigate = useNavigate()
    const { auth, clearAuth } = useAuth<PlayerAuth>()
    const [isJoiningRoom, setIsJoiningRoom] = useState(false)

    const roomFormik = useFormik({
        initialValues: { roomNumber: '' },
        validate: values => {
            const errors: Record<string, string> = {}
            if (!/^[0-9]{4}$/.test(values.roomNumber)) {
                errors['roomNumber'] = 'El número de sala debe ser de 4 dígitos'
            }
            return errors
        },
        onSubmit: async ({ roomNumber }) => {
            setIsJoiningRoom(true)
            await new Promise(res => setTimeout(res, 800)) // Simulate API call
            console.log('Joining room:', roomNumber)
            // Navigate to room
            navigate('/training/room')
        },
        validateOnChange: true,
        validateOnBlur: true,
    })

    // Only allow numbers in room number
    const handleRoomNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '')
        roomFormik.setFieldValue('roomNumber', value)
    }

    function handleLogout() {
        clearAuth()
        navigate('/')
    }

    return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-background relative">
            <div className="w-full max-w-3xl bg-white/80 rounded-xl shadow-lg border border-accent flex flex-col md:flex-row overflow-hidden">
                {/* User Info Column */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4 border-b md:border-b-0 md:border-r border-accent bg-background">
                    <div className="text-lg text-secondary font-medium">
                        Usuario
                    </div>
                    <div className="text-2xl font-bold text-primary">
                        {auth.name}
                    </div>
                    <div className="text-base text-secondary mt-4">
                        Generación de IA
                    </div>
                    <div className="text-lg font-semibold text-primary">
                        Gen {auth.aiGeneration}
                    </div>
                </div>
                {/* Actions Column */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
                    <Link
                        to="/training/simulation"
                        className="w-full text-center rounded-md px-4 py-3 font-medium bg-primary text-white hover:bg-secondary hover:text-background transition-colors focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                        {auth.aiGeneration === 1
                            ? 'Empezar Entrenamiento'
                            : 'Continuar Entrenamiento'}
                    </Link>

                    {/* Room Number Input Form */}
                    <form onSubmit={roomFormik.handleSubmit} className="w-full">
                        <div className="text-center text-secondary text-sm font-medium mb-3">
                            Unirse a una sala
                        </div>
                        <div className="relative">
                            <input
                                id="roomNumber"
                                name="roomNumber"
                                type="text"
                                inputMode="numeric"
                                maxLength={4}
                                placeholder="Número de sala (4 dígitos)"
                                className={`text-left w-full pl-3 pr-24 py-3 rounded-md border border-secondary bg-transparent text-secondary font-medium outline-none focus:ring-2 focus:ring-secondary transition ${
                                    roomFormik.errors.roomNumber &&
                                    roomFormik.touched.roomNumber
                                        ? 'border-error'
                                        : ''
                                }`}
                                value={roomFormik.values.roomNumber}
                                onChange={handleRoomNumberChange}
                                onBlur={roomFormik.handleBlur}
                                disabled={isJoiningRoom}
                            />
                            <button
                                type="submit"
                                className="absolute right-1 top-1 bottom-1 px-3 rounded-sm bg-secondary text-background font-medium text-sm hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                                disabled={
                                    !roomFormik.isValid ||
                                    !roomFormik.values.roomNumber ||
                                    isJoiningRoom
                                }
                            >
                                {isJoiningRoom ? '...' : 'Entrar'}
                            </button>
                        </div>
                        {roomFormik.errors.roomNumber &&
                            roomFormik.touched.roomNumber && (
                                <span className="text-error text-xs mt-2 block text-center">
                                    {roomFormik.errors.roomNumber}
                                </span>
                            )}
                    </form>
                </div>
            </div>
            {/* Logout Button Fixed to Lower Right */}
            <button
                onClick={handleLogout}
                className="fixed right-6 bottom-6 border-1 z-50 w-auto rounded-md px-4 py-3 font-medium  text-secondary hover:text-secondary shadow-none transition-colors focus:outline-none focus:ring-2 focus:ring-secondary bg-transparent border-secondary"
            >
                Cerrar sesión
            </button>
        </div>
    )
}
