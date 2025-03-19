import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import BookList from '../components/books/BookList';
import Layout from '../components/layout/Layout';
import BookForm from '../components/books/BookForm';
import BookDetail from '../components/books/BookDetail';
import LoanForm from '../components/loans/LoanForm';
import LoanList from '../components/loans/LoanList';
import AdminDashboard from '../components/admin/AdminDashboard';
import ChatWindow from '../components/chat/ChatWindow';
import UserProfile from '../components/profile/UserProfile';
import SupportPage from '../components/Support/SupportPage';
// Importaremos más componentes cuando los creemos

const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

// Creamos un HOC para rutas de admin
const AdminRoute = ({ children }) => {
    const { user } = useAuth();
    return user && user.rol === 'admin' ? 
        <Layout>{children}</Layout> : 
        <Navigate to="/" />;
};

// Creamos un HOC para rutas de agente
const AgentRoute = ({ children }) => {
    const { user } = useAuth();
    return user && (user.rol === 'admin' || user.isAgente) ? 
        <Layout>{children}</Layout> : 
        <Navigate to="/" />;
};

const AppRoutes = () => {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={
                !user ? <Login /> : <Navigate to="/" />
            } />
            <Route path="/register" element={
                !user ? <Register /> : <Navigate to="/" />
            } />
            <Route path="/" element={
                <PrivateRoute>
                    <BookList />
                </PrivateRoute>
            } />
            <Route path="/books/new" element={
                <AdminRoute>
                    <BookForm mode="create" />
                </AdminRoute>
            } />
            <Route path="/books/edit/:id" element={
                <AdminRoute>
                    <BookForm mode="edit" />
                </AdminRoute>
            } />
            <Route path="/books/:id" element={
                <PrivateRoute>
                    <BookDetail />
                </PrivateRoute>
            } />
            <Route path="/loans" element={
                <PrivateRoute>
                    <LoanList />
                </PrivateRoute>
            } />
            <Route path="/loans/new/:bookId" element={
                <PrivateRoute>
                    <LoanForm />
                </PrivateRoute>
            } />
            <Route path="/admin" element={
                <AdminRoute>
                    <AdminDashboard />
                </AdminRoute>
            } />
            <Route path="/soporte" element={
                <AdminRoute>
                    <SupportPage />
                </AdminRoute>
            } />
            <Route path="/soporte/agente" element={
                <AgentRoute>
                    <SupportPage />
                </AgentRoute>
            } />
            <Route path="/soporte/admin" element={
                <AdminRoute>
                    <SupportPage />
                </AdminRoute>
            } />
            <Route path="/chat" element={
                <PrivateRoute>
                    <ChatWindow />
                </PrivateRoute>
            } />
            <Route path="/profile" element={
                <PrivateRoute>
                    <UserProfile />
                </PrivateRoute>
            } />
            {/* Agregaremos más rutas cuando creemos los componentes */}
        </Routes>
    );
};

export default AppRoutes;