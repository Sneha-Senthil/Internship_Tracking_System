import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container, Box, Typography, TextField, Button, 
  Paper, Grid, Alert, CircularProgress, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  const { register, isAuthenticated, user, error, clearErrors } = useContext(AuthContext);
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

  const { username, password, confirmPassword, role } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    if (e.target.name === 'confirmPassword' || e.target.name === 'password') {
      if (e.target.name === 'confirmPassword' && e.target.value !== password) {
        setPasswordError('Passwords do not match');
      } else if (e.target.name === 'password' && confirmPassword && e.target.value !== confirmPassword) {
        setPasswordError('Passwords do not match');
      } else {
        setPasswordError('');
      }
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    
    const success = await register({ 
      username, 
      password,
      role
    });
    
    setIsSubmitting(false);
    
    if (success) {
      if (role === 'student') {
        navigate('/student/dashboard');
      } else {
        navigate('/teacher/dashboard');
      }
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
            Register
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              error={!!passwordError}
              helperText={passwordError}
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
            
            <FormControl 
              fullWidth 
              margin="normal"
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
            >
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={role}
                label="Role"
                onChange={onChange}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="teacher">Teacher</MenuItem>
              </Select>
            </FormControl>
            
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
              disabled={isSubmitting || !!passwordError}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Register'}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'text.primary',
                      },
                    }}
                  >
                    Already have an account? Login
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

export default Register;