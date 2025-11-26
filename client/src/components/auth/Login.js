import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container, Box, Typography, TextField, Button, 
  Paper, Grid, Alert, CircularProgress 
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isAuthenticated, user, error, clearErrors } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (user.role === 'student') {
        navigate('/student/dashboard');
      } else if (user.role === 'teacher') {
        navigate('/teacher/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const { username, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const success = await login({ username, password });
    
    setIsSubmitting(false);
    
    if (success) {
      // The useEffect will handle the navigation based on user.role
      // once the user state is updated
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            width: '100%', 
            borderRadius: 3,
            background: 'linear-gradient(145deg, #1a1a1a 0%, #2a2a2a 100%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Typography 
            component="h1" 
            variant="h5" 
            align="center" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
            }}
          >
            Internship Tracking System
          </Typography>
          
          <Typography 
            component="h2" 
            variant="h5" 
            align="center" 
            sx={{ 
              mb: 3,
              color: 'text.primary',
              fontWeight: 500,
            }}
          >
            Login
          </Typography>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'text.primary',
              }} 
              onClose={clearErrors}
            >
              {error}
            </Alert>
          )}
          
          <Box 
            component="form" 
            onSubmit={onSubmit} 
            noValidate 
            sx={{ 
              mt: 1,
              '& .MuiTextField-root': {
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                },
              },
            }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username / Register Number"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={onChange}
              sx={{
                '& .MuiInputLabel-root': {
                  color: 'text.secondary',
                },
                '& .MuiOutlinedInput-root': {
                  color: 'text.primary',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={onChange}
              sx={{
                '& .MuiInputLabel-root': {
                  color: 'text.secondary',
                },
                '& .MuiOutlinedInput-root': {
                  color: 'text.primary',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2,
                py: 1.5,
                background: 'linear-gradient(145deg, #1a1a1a 0%, #2a2a2a 100%)',
                color: 'text.primary',
                '&:hover': {
                  background: 'linear-gradient(145deg, #2a2a2a 0%, #3a3a3a 100%)',
                },
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Login'}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'text.primary',
                      },
                    }}
                  >
                    Don't have an account? Register
                  </Typography>
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;