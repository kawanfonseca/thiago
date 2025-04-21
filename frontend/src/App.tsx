import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import SpedProcessor from './components/SpedProcessor';
import PmpfManager from './components/PmpfManager';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { useAuth } from './contexts/AuthContext';

const AppHeader: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Sistema ICMS-ST Combustíveis
        </Typography>
        {isAuthenticated && (
          <>
            <Button color="inherit" component={Link} to="/sped">
              SPED
            </Button>
            <Button color="inherit" component={Link} to="/pmpf">
              PMPF
            </Button>
            <Button color="inherit" onClick={logout}>
              Sair
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppHeader />
        <Container sx={{ mt: 4 }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/sped"
              element={
                <PrivateRoute>
                  <SpedProcessor />
                </PrivateRoute>
              }
            />
            <Route
              path="/pmpf"
              element={
                <PrivateRoute>
                  <PmpfManager />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Container>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
