import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { UserPanel } from './pages/UserPanel';
import { AdminPanel } from './pages/AdminPanel';
import { AdminLogin } from './pages/AdminLogin';
import { Curriculum } from './pages/Curriculum';
import { ShopsStations } from './pages/ShopsStations';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        element: <Navigate to="/user" replace />,
      },
      {
        path: 'user',
        Component: UserPanel,
      },
      {
        path: 'curriculum',
        Component: Curriculum,
      },
      {
        path: 'shops-stations',
        Component: ShopsStations,
      },
      {
        path: 'admin',
        Component: AdminPanel,
      },
      {
        path: '*',
        element: <Navigate to="/user" replace />,
      },
    ],
  },
  {
    path: '/admin/login',
    Component: AdminLogin,
  },
]);