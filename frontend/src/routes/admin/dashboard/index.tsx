import { Link } from 'react-router-dom';

export function AdminDashboard() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Link
                    to="/admin/races"
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                    <h3 className="text-lg font-semibold mb-2">Carreras</h3>
                    <p className="text-gray-600">
                        Administrar carreras, resultados y participantes
                    </p>
                </Link>

                {/* Futuros módulos */}
                <div className="bg-gray-100 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-gray-400">
                        Modelos de IA
                    </h3>
                    <p className="text-gray-500">
                        Próximamente: Administrar modelos de IA y entrenamientos
                    </p>
                </div>

                <div className="bg-gray-100 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-gray-400">
                        Estadísticas
                    </h3>
                    <p className="text-gray-500">
                        Próximamente: Ver estadísticas y métricas
                    </p>
                </div>
            </div>
        </div>
    );
}
