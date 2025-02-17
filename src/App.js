import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './components/auth/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import theme from './theme';
import AppRoutes from './routes';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <AuthProvider>
                    <NotificationProvider>
                        <ToastContainer
                            position="top-right"
                            autoClose={5000}
                            hideProgressBar={false}
                            newestOnTop
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            theme="colored"
                        />
                        <AppRoutes />
                    </NotificationProvider>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;
