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
    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Router>
                    <AuthProvider>
                        <NotificationProvider>
                            <SocketProvider>
                                <DynamicFavicon />
                                <AppRoutes />
                            </SocketProvider>
                        </NotificationProvider>
                    </AuthProvider>
                </Router>
            </ThemeProvider>
        </GoogleOAuthProvider>
    );
}

export default App;
