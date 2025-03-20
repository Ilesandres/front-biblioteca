import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import DynamicFavicon from './components/DynamicFavicon';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './components/auth/AuthContext';
import theme from './theme';
import AppRoutes from './routes';
import { SocketProvider } from './context/socketContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { NotificationProvider } from './context/NotificationContext';


function App() {
    const token = localStorage.getItem('token');
    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <NotificationProvider>
                <SocketProvider token={token}>
                    <ThemeProvider theme={theme}>
                        <CssBaseline />
                        <Router>
                            <AuthProvider>
                                    <DynamicFavicon />
                                    <AppRoutes />
                            </AuthProvider>
                        </Router>
                    </ThemeProvider>
                </SocketProvider>
            </NotificationProvider>
        </GoogleOAuthProvider>
    );
}

export default App;
