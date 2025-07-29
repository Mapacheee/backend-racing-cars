import { useState, useEffect } from 'react';
import { RaceService } from '../../lib/services/race.service';
import type { RaceFormData, Track, AIModel } from '../../lib/types/race.types';

export function CreateRaceForm() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [aiModels, setAIModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<RaceFormData>({
    trackId: '',
    aiModels: [],
    raceConditions: {
      weather: 'sunny',
      difficulty: 'medium',
      numberOfParticipants: 2
    },
    raceConfig: {
      numberOfLaps: 3
    }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [tracksData, aiModelsData] = await Promise.all([
          RaceService.getTracks(),
          RaceService.getAIModels()
        ]);
        setTracks(tracksData);
        setAIModels(aiModelsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await RaceService.createRace(formData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'error al hacer una carrera');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Crear nueva carrear</h2>

      {/* Track Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Select Track
        </label>
        <select
          value={formData.trackId}
          onChange={(e) => setFormData({ ...formData, trackId: e.target.value })}
          className="w-full p-2 border rounded-md"
          required
        >
          <option value="">seleccione pista...</option>
          {tracks.map((track) => (
            <option key={track.id} value={track.id}>
              {track.name} - {track.length}m
            </option>
          ))}
        </select>
      </div>

      {/* AI Models Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Select AI Models
        </label>
        <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-md">
          {aiModels.map((model) => (
            <div key={model.id} className="flex items-center">
              <input
                type="checkbox"
                id={model.id}
                checked={formData.aiModels.includes(model.id)}
                onChange={(e) => {
                  const newModels = e.target.checked
                    ? [...formData.aiModels, model.id]
                    : formData.aiModels.filter(id => id !== model.id);
                  setFormData({ ...formData, aiModels: newModels });
                }}
                className="mr-2"
              />
              <label htmlFor={model.id}>
                {model.name} - by {model.username}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">condiciones de carrera</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Weather
            </label>
            <select
              value={formData.raceConditions.weather}
              onChange={(e) => setFormData({
                ...formData,
                raceConditions: { ...formData.raceConditions, weather: e.target.value }
              })}
              className="w-full p-2 border rounded-md"
            >
              <option value="sunny">soleado</option>
              <option value="cloudy">nublado</option>
              <option value="rainy">lluvioso</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Dificultad
            </label>
            <select
              value={formData.raceConditions.difficulty}
              onChange={(e) => setFormData({
                ...formData,
                raceConditions: {
                  ...formData.raceConditions,
                  difficulty: e.target.value as 'easy' | 'medium' | 'hard'
                }
              })}
              className="w-full p-2 border rounded-md"
            >
              <option value="easy">Fácil</option>
              <option value="medium">Medio</option>
              <option value="hard">Difícil</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">config de carrera</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              numero de vueltas
            </label>
            <input
              type="number"
              min="1"
              value={formData.raceConfig.numberOfLaps}
              onChange={(e) => setFormData({
                ...formData,
                raceConfig: { ...formData.raceConfig, numberOfLaps: parseInt(e.target.value) }
              })}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Max Time (seconds, optional)
            </label>
            <input
              type="number"
              min="0"
              value={formData.raceConfig.maxTime || ''}
              onChange={(e) => setFormData({
                ...formData,
                raceConfig: { ...formData.raceConfig, maxTime: parseInt(e.target.value) }
              })}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
      >
        {loading ? 'creando...' : 'Crear Carrera'}
      </button>
    </form>
  );
}
