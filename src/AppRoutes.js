import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './components/auth/AuthContext';
import Login from './screen/Login';
import Register from './screen/Register';
import ChatList from './screen/ChatList';
import Chat from './screen/chat';
import BookManagement from './screen/BookManagement';
import ImportExport from './screen/ImportExport';
import SupportPage from './components/Support/SupportPage';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => {
  const chats = [
    { id: 1, name: 'Maria', messages: [{ id: 1, content: 'Hola Juan' }] },
  ];

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <ChatList chats={chats} />
        </PrivateRoute>
      } />
      <Route path="/chat/:id" element={
        <PrivateRoute>
          <Chat chat={chats[0]} />
        </PrivateRoute>
      } />
      <Route path="/books/new" element={
        <PrivateRoute>
          <BookManagement />
        </PrivateRoute>
      } />
      <Route path="/books/edit/:id" element={
        <PrivateRoute>
          <BookManagement />
        </PrivateRoute>
      } />
      <Route path="/admin/import-export" element={
        <PrivateRoute>
          <ImportExport />
        </PrivateRoute>
      } />
      <Route path="/soporte" element={
        <PrivateRoute>
          <SupportPage />
        </PrivateRoute>
      } />

      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Catch all route - redirect to dashboard if authenticated, otherwise to login */}
      <Route path="*" element={
        <PrivateRoute>
          <Navigate to="/dashboard" replace />
        </PrivateRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;
