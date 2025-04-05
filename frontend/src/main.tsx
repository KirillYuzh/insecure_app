import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import App from './App.tsx';
import HomePage from './pages/HomePage.tsx';
import TasksPage from './pages/TasksPage.tsx';
import ErrorPage from './pages/ErrorPage.tsx';
import ScoringTablePage from './pages/ScoringTablePage.tsx';
import TaskPage from './pages/TaskPage.tsx';
import CommunityPage from './pages/CommunityPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import AccountPage from './pages/AccountPage.tsx';
import AdminPanelPage from './pages/AdminPanelPage.tsx';
import SignupPage from './pages/SignupPage.tsx';


const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/community/',
    element: <CommunityPage />,
  },
  {
    path: '/admin-panel/',
    element: <AdminPanelPage />,
  },
  {
    path: '/tasks/',
    element: <TasksPage />,
  },
  {
    path: '/tasks/:id/',
    element: <TaskPage />,
  },
  {
    path: '/scoring-table/',
    element: <ScoringTablePage />,
  },
  {
    path: '/login/',
    element: <LoginPage />,
  },
  {
    path: '/signup/',
    element: <SignupPage />,
  },
  {
    path: '/account/',
    element: <AccountPage />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <RouterProvider router={router} />
  </StrictMode>,
);