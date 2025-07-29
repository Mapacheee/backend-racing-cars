import { createBrowserRouter } from 'react-router-dom';
import { CreateRaceForm } from './races/CreateRaceForm';
import { Layout } from '../lib/components/Layout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'races/new',
        element: <CreateRaceForm />,
      },
      // Aquí agregaremos más rutas después
    ],
  },
]);
