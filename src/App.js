import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './components/auth/AuthContext';
import theme from './theme';
import AppRoutes from './routes';
import 'react-toastify/dist/ReactToastify.css';
import { SocketProvider } from './context/socketContext';


function App() {
    const token = localStorage.getItem('token');
    return (
        <SocketProvider token={token}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Router>
                    <AuthProvider>
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
                    </AuthProvider>
                </Router>
            </ThemeProvider>
        </SocketProvider>
    );
}

export default App;
