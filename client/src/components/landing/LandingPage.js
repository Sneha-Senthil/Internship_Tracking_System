import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  styled,
  TextField,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { X } from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';

const FloatingPaths = ({ position }) => {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      <svg
        style={{
          width: '100%',
          height: '100%',
          color: '#fff',
        }}
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
          />
        ))}
      </svg>
    </Box>
  );
};

const StyledButton = styled(Button)(({ theme }) => ({
  padding: '16px 32px',
  fontSize: '1.125rem',
  fontWeight: 600,
  borderRadius: '1rem',
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#fff',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  },
}));

const LoginButton = ({ onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      style={{
        padding: '16px 32px',
        fontSize: '1.125rem',
        fontWeight: 400,
        borderRadius: '1rem',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        height: '60px',
        width: '150px',
        transition: 'all 0.3s ease',
        boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
      whileHover={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        y: -2,
        boxShadow: '0 0 30px rgba(255, 255, 255, 0.15)',
      }}
      layoutId="loginContainer"
      initial={{ borderRadius: 9999 }}
    >
      <motion.span 
        layoutId="loginText"
        style={{
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        Login
      </motion.span>
      <motion.span 
        layoutId="loginArrow" 
        style={{
          marginLeft: '4px',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        →
      </motion.span>
    </motion.button>
  );
};

const RegisterFormExpanded = ({ onClose, onSwitchToLogin }) => {
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
    if (isAuthenticated && user) {
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
  };

  return (
    <motion.div
      layoutId="loginContainer"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        color: 'rgba(209, 213, 219, 1)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '24px',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
      initial={{ borderRadius: 9999 }}
      animate={{ borderRadius: 8 }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <motion.h2
          layoutId="loginText"
          style={{ 
            fontSize: '2rem', 
            fontWeight: 600, 
            margin: '0 auto',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          Register
        </motion.h2>
        <motion.button
          layoutId="loginArrow"
          onClick={onClose}
          style={{
            color: 'rgba(156, 163, 175, 1)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
          }}
          whileHover={{ color: 'white', scale: 1.1 }}
        >
        </motion.button>
      </div>

      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        onSubmit={onSubmit}
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {error && (
          <Alert
            severity="error"
            onClose={clearErrors}
            sx={{
              mb: 2,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'text.primary',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            {error}
          </Alert>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label 
            htmlFor="username" 
            style={{ 
              color: 'rgba(209, 213, 219, 1)',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            Username / Register Number
          </label>
          <TextField
            id="username"
            name="username"
            type="text"
            value={username}
            onChange={onChange}
            required
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(24, 24, 24, 0.5)',
                color: 'rgba(229, 231, 235, 1)',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                '& fieldset': {
                  borderColor: 'rgba(75, 85, 99, 0.9)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(107, 114, 128, 0.9)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(156, 163, 175, 1)',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              },
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label 
            htmlFor="password" 
            style={{ 
              color: 'rgba(209, 213, 219, 1)',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            Password
          </label>
          <TextField
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={onChange}
            required
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(24, 24, 24, 0.5)',
                color: 'rgba(229, 231, 235, 1)',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                '& fieldset': {
                  borderColor: 'rgba(75, 85, 99, 0.9)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(107, 114, 128, 0.9)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(156, 163, 175, 1)',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              },
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label 
            htmlFor="confirmPassword" 
            style={{ 
              color: 'rgba(209, 213, 219, 1)',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            Confirm Password
          </label>
          <TextField
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={onChange}
            required
            fullWidth
            error={!!passwordError}
            helperText={passwordError}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(24, 24, 24, 0.5)',
                color: 'rgba(229, 231, 235, 1)',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                '& fieldset': {
                  borderColor: 'rgba(75, 85, 99, 0.9)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(107, 114, 128, 0.9)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(156, 163, 175, 1)',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              },
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label 
            htmlFor="role" 
            style={{ 
              color: 'rgba(209, 213, 219, 1)',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            Role
          </label>
          <Select
            id="role"
            name="role"
            value={role}
            onChange={onChange}
            fullWidth
            sx={{
              backgroundColor: 'rgba(24, 24, 24, 0.5)',
              color: 'rgba(229, 231, 235, 1)',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(75, 85, 99, 0.9)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(107, 114, 128, 0.9)',
              },
              '& .MuiSelect-icon': {
                color: 'rgba(156, 163, 175, 1)',
              },
            }}
          >
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
          </Select>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.875rem',
          }}
        >
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSwitchToLogin();
            }}
            style={{ 
              color: 'rgba(156, 163, 175, 1)', 
              textDecoration: 'none',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            Already have an account? Login
          </a>
        </div>

        <Button
          type="submit"
          fullWidth
          disabled={isSubmitting || !!passwordError}
          sx={{
            whiteSpace: 'nowrap',
            fontSize: '0.875rem',
            transition: 'all 0.3s ease',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            borderRadius: '0.75rem',
            fontWeight: 500,
            position: 'relative',
            height: '3rem',
            minWidth: '18rem',
            '@media (min-width: 768px)': {
              minWidth: '14rem',
            },
            backgroundColor: '#000',
            color: '#fff',
            border: '2px solid rgba(65, 63, 62, 0.2)',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(4px)',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            '&:hover': {
              backgroundColor: 'rgba(24,24,27,0.9)',
              boxShadow: '0 0 30px rgba(255, 255, 255, 0.15)',
            },
            '&:disabled': {
              pointerEvents: 'none',
              opacity: 0.5,
            },
            '& svg': {
              pointerEvents: 'none',
              width: '1rem',
              height: '1rem',
              flexShrink: 0,
            },
          }}
        >
          Register
        </Button>
      </motion.form>
    </motion.div>
  );
};

const LoginFormExpanded = ({ onClose, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, user, error, clearErrors } =
    useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'student') {
        navigate('/student/dashboard');
      } else if (user.role === 'teacher') {
        navigate('/teacher/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const { username, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
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
    <motion.div
      layoutId="loginContainer"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        color: 'rgba(209, 213, 219, 1)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '24px',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
      initial={{ borderRadius: 9999 }}
      animate={{ borderRadius: 8 }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <motion.h2
          layoutId="loginText"
          style={{ 
            fontSize: '2rem', 
            fontWeight: 600, 
            margin: '0 auto',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          Login
        </motion.h2>
        <motion.button
          layoutId="loginArrow"
          onClick={onClose}
          style={{
            color: 'rgba(156, 163, 175, 1)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
          }}
          whileHover={{ color: 'white', scale: 1.1 }}
        >
        
        </motion.button>
      </div>

      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        onSubmit={onSubmit}
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {error && (
          <Alert
            severity="error"
            onClose={clearErrors}
            sx={{
              mb: 2,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'text.primary',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            {error}
          </Alert>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label 
            htmlFor="username" 
            style={{ 
              color: 'rgba(209, 213, 219, 1)',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            Username / Register Number
          </label>
          <TextField
            id="username"
            name="username"
            type="text"
            value={username}
            onChange={onChange}
            required
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(24, 24, 24, 0.5)',
                color: 'rgba(229, 231, 235, 1)',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                '& fieldset': {
                  borderColor: 'rgba(75, 85, 99, 0.9)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(107, 114, 128, 0.9)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(156, 163, 175, 1)',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              },
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label 
            htmlFor="password" 
            style={{ 
              color: 'rgba(209, 213, 219, 1)',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            Password
          </label>
          <TextField
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={onChange}
            required
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(24, 24, 24, 0.5)',
                color: 'rgba(229, 231, 235, 1)',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                '& fieldset': {
                  borderColor: 'rgba(75, 85, 99, 0.9)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(107, 114, 128, 0.9)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(156, 163, 175, 1)',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              },
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.875rem',
          }}
        >
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSwitchToRegister();
            }}
            style={{ 
              color: 'rgba(156, 163, 175, 1)', 
              textDecoration: 'none',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            Don't have an account? Register
          </a>
        </div>

        <Button
          type="submit"
          fullWidth
          disabled={isSubmitting}
          sx={{
            whiteSpace: 'nowrap',
            fontSize: '0.875rem',
            transition: 'all 0.3s ease',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            borderRadius: '0.75rem',
            fontWeight: 500,
            position: 'relative',
            height: '3rem',
            minWidth: '18rem',
            '@media (min-width: 768px)': {
              minWidth: '14rem',
            },
            backgroundColor: '#000',
            color: '#fff',
            border: '2px solid rgba(65, 63, 62, 0.2)',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(4px)',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            '&:hover': {
              backgroundColor: 'rgba(24,24,27,0.9)',
              boxShadow: '0 0 30px rgba(255, 255, 255, 0.15)',
            },
            '&:disabled': {
              pointerEvents: 'none',
              opacity: 0.5,
            },
            '& svg': {
              pointerEvents: 'none',
              width: '1rem',
              height: '1rem',
              flexShrink: 0,
            },
          }}
        >
          Login
        </Button>
      </motion.form>
    </motion.div>
  );
};

const LandingPage = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();
  const title = 'Welcome To InternTrack';
  const words = title.split(' ');

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        bgcolor: '#000000',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(2px)',
          zIndex: 1,
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(135deg, rgba(75,0,130,0.05), transparent, rgba(255,0,0,0.05))',
          filter: 'blur(100px)',
        }}
      />

      <Box sx={{ position: 'absolute', inset: 0 }}>
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </Box>

      <Box
        sx={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1200px',
          mx: 'auto',
          px: 4,
          textAlign: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          {/* Welcome To */}
          <Box sx={{ mb: 2 }}>
            {'Welcome\u00A0To'.split('').map((letter, index) => (
              <motion.span
                key={`welcome-${index}`}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: index * 0.03,
                  type: 'spring',
                  stiffness: 120,
                  damping: 30,
                }}
                style={{
                  display: 'inline-block',
                  color: '#8a8686',
                  fontSize: '50px',
                  fontWeight: 400,
                  fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '-0.05em',
                  lineHeight: 0.9,
                }}
              >
                {letter}
              </motion.span>
            ))}
          </Box>

          {/* InternTrack */}
          <Box sx={{ mb: 8 }}>
            {'InternTrack'.split('').map((letter, index) => (
              <motion.span
                key={`intern-${index}`}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: index * 0.03 + 0.5, // slight delay after Welcome To
                  type: 'spring',
                  stiffness: 120,
                  damping: 30,
                }}
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(to bottom, #aaa, #ddd)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '150px',
                  fontWeight: 800,
                  fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '-0.05em',
                  lineHeight: 0.9,
                }}
              >
                {letter}
              </motion.span>
            ))}
          </Box>

          <div
            style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <AnimatePresence mode="wait">
              {isExpanded ? (
                showRegister ? (
                  <RegisterFormExpanded 
                    onClose={() => setIsExpanded(false)}
                    onSwitchToLogin={() => setShowRegister(false)}
                  />
                ) : (
                  <LoginFormExpanded 
                    onClose={() => setIsExpanded(false)}
                    onSwitchToRegister={() => setShowRegister(true)}
                  />
                )
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 1, // Delay after title animation
                    duration: 0.8,
                    ease: "easeOut"
                  }}
                >
                  <LoginButton onClick={() => setIsExpanded(true)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </Box>
    </Box>
  );
};

export default LandingPage;
