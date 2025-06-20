import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from './store';
import theme from './theme';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Main Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Band Pages
import BandsList from './pages/bands/BandsList';
import BandDetails from './pages/bands/BandDetails';
import BandCreate from './pages/bands/BandCreate';
import BandEdit from './pages/bands/BandEdit';

// Song Pages
import SongsList from './pages/songs/SongsList';
import SongDetails from './pages/songs/SongDetails';
import SongCreate from './pages/songs/SongCreate';
import SongEdit from './pages/songs/SongEdit';

// Setlist Pages
import SetlistsList from './pages/setlists/SetlistsList';
import SetlistDetails from './pages/setlists/SetlistDetails';
import SetlistCreate from './pages/setlists/SetlistCreate';
import SetlistEdit from './pages/setlists/SetlistEdit';
import SetlistPerformance from './pages/setlists/SetlistPerformance';

// Performance Pages
import PerformancesList from './pages/performances/PerformancesList';
import PerformanceDetails from './pages/performances/PerformanceDetails';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Main App Routes - All protected behind PrivateRoute */}
            <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Band Routes */}
              <Route path="/bands" element={<BandsList />} />
              <Route path="/bands/create" element={<BandCreate />} />
              <Route path="/bands/:bandId" element={<BandDetails />} />
              <Route path="/bands/:bandId/edit" element={<BandEdit />} />
              
              {/* Song Routes */}
              <Route path="/bands/:bandId/songs" element={<SongsList />} />
              <Route path="/bands/:bandId/songs/create" element={<SongCreate />} />
              <Route path="/bands/:bandId/songs/:songId" element={<SongDetails />} />
              <Route path="/bands/:bandId/songs/:songId/edit" element={<SongEdit />} />
              
              {/* Setlist Routes */}
              <Route path="/bands/:bandId/setlists" element={<SetlistsList />} />
              <Route path="/bands/:bandId/setlists/create" element={<SetlistCreate />} />
              <Route path="/bands/:bandId/setlists/:setlistId" element={<SetlistDetails />} />
              <Route path="/bands/:bandId/setlists/:setlistId/edit" element={<SetlistEdit />} />
              <Route path="/bands/:bandId/setlists/:setlistId/perform" element={<SetlistPerformance />} />
              
              {/* Performance Routes */}
              <Route path="/bands/:bandId/performances" element={<PerformancesList />} />
              <Route path="/bands/:bandId/performances/:performanceId" element={<PerformanceDetails />} />
            </Route>

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;