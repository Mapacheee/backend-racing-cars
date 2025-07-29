import { Routes, Route } from 'react-router-dom';
import { RaceList } from './RaceList';
import { RaceDetail } from './RaceDetail';
import { CreateRaceForm } from './CreateRaceForm';

export function RaceRoutes() {
    return (
        <Routes>
            <Route path="/" element={<RaceList />} />
            <Route path="/create" element={<CreateRaceForm />} />
            <Route path="/:id" element={<RaceDetail />} />
        </Routes>
    );
}
