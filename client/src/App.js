import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/routing/PrivateRoute';
import TeacherRoute from './components/routing/TeacherRoute';
import Box from '@mui/material/Box';

// Pages
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import StudentDashboard from './components/student/Dashboard';
import TeacherDashboard from './components/teacher/Dashboard';
import StudentDetails from './components/student/StudentDetails';
import DocumentUpload from './components/student/DocumentUpload';
import ViewRecords from './components/teacher/ViewRecords';
import UploadExcel from './components/teacher/UploadExcel';
import NotFound from './components/layout/NotFound';
import LandingPage from './components/landing/LandingPage';
import InternshipManagement from './components/student/InternshipManagement';
import EditInternship from './components/student/EditInternship';
import AddInternship from './components/student/AddInternship';
import Reports from './components/teacher/Reports';
import UploadTest from './components/test/UploadTest';

// Create theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#007AFF',
      light: '#339DFF',
      dark: '#0055B3',
    },
    secondary: {
      main: '#64748B',
      light: '#94A3B8',
      dark: '#475569',
    },
    success: {
      main: '#34C759',
      light: '#4CD964',
      dark: '#248A3D',
    },
    warning: {
      main: '#FF9500',
      light: '#FFAA33',
      dark: '#B36800',
    },
    error: {
      main: '#FF3B30',
      light: '#FF6259',
      dark: '#B32921',
    },
    background: {
      default: '#000000',
      paper: 'rgba(255, 255, 255, 0.05)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    h1: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    subtitle1: {
      fontWeight: 500,
      letterSpacing: '-0.01em',
    },
    body1: {
      letterSpacing: '-0.01em',
    },
    body2: {
      letterSpacing: '-0.01em',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0, 0, 0, 0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(255, 255, 255, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 12,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          fontSize: '0.875rem',
        },
        filled: {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Student Routes */}
              <Route 
                path="/student/dashboard" 
                element={
                  <PrivateRoute>
                    <StudentDashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/student/details" 
                element={
                  <PrivateRoute>
                    <StudentDetails />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/student/documents" 
                element={
                  <PrivateRoute>
                    <DocumentUpload />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/student/internship" 
                element={
                  <PrivateRoute>
                    <InternshipManagement />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/student/internship/edit/:id" 
                element={
                  <PrivateRoute>
                    <EditInternship />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/student/internship/add" 
                element={
                  <PrivateRoute>
                    <AddInternship />
                  </PrivateRoute>
                } 
              />
              
              {/* Teacher Routes */}
              <Route 
                path="/teacher/dashboard" 
                element={
                  <TeacherRoute>
                    <TeacherDashboard />
                  </TeacherRoute>
                } 
              />
              <Route 
                path="/teacher/records" 
                element={
                  <TeacherRoute>
                    <ViewRecords />
                  </TeacherRoute>
                } 
              />
              <Route 
                path="/teacher/upload" 
                element={
                  <TeacherRoute>
                    <UploadExcel />
                  </TeacherRoute>
                } 
              />
              <Route 
                path="/teacher/reports" 
                element={
                  <TeacherRoute>
                    <Reports />
                  </TeacherRoute>
                } 
              />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
              
            </Routes>
          </Box>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;