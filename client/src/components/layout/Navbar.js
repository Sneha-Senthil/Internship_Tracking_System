import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';

const Navbar = ({ title, role }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: 'none',
      }}
    >
      <Toolbar 
        disableGutters 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          height: 64,
          px: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography
            component={Link}
            to={role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'}
            sx={{
              fontSize: '1.5rem',
              fontWeight: 700,
              textDecoration: 'none',
              background: 'linear-gradient(45deg, #ffffff 30%, #b3b3b3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              '&:hover': {
                background: 'linear-gradient(45deg, #ffffff 30%, #808080 90%)',
                WebkitBackgroundClip: 'text',
              },
            }}
          >
            InternTrack
          </Typography>

          {user && (
            <Box sx={{ ml: 4, display: 'flex', gap: 2 }}>
              {role === 'student' && (
                <>
                  <Button
                    component={Link}
                    to="/student/internship"
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'text.primary',
                        background: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  >
                    Edit Details
                  </Button>
                  <Button
                    component={Link}
                    to="/student/documents"
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'text.primary',
                        background: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  >
                    Upload Documents
                  </Button>
                </>
              )}
              {role === 'teacher' && (
                <>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/teacher/reports"
                    sx={{ textTransform: 'none' }}
                  >
                    Reports
                  </Button>
                </>
              )}
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user ? (
            <>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                {user.username}
              </Typography>
              <Button
                onClick={handleLogout}
                sx={{
                  color: 'text.secondary',
                  background: 'rgba(255, 255, 255, 0.05)',
                  '&:hover': {
                    color: 'text.primary',
                    background: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                component={Link}
                to="/login"
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'text.primary',
                    background: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/register"
                sx={{
                  color: 'text.primary',
                  background: 'linear-gradient(145deg, #1a1a1a 0%, #2a2a2a 100%)',
                  '&:hover': {
                    background: 'linear-gradient(145deg, #2a2a2a 0%, #3a3a3a 100%)',
                  },
                }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;