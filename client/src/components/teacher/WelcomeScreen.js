import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';

const ElegantShape = ({ delay = 0, width = 400, height = 100, rotate = 0, gradient = "rgba(255, 255, 255, 0.08)", position }) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      style={{
        position: 'absolute',
        ...position
      }}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: `linear-gradient(to right, ${gradient}, transparent)`,
            backdropFilter: 'blur(2px)',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 32px 0 rgba(255,255,255,0.1)',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2), transparent 70%)',
            }
          }}
        />
      </motion.div>
    </motion.div>
  );
};

const WelcomeScreen = ({ username }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#030303',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom right, rgba(99, 102, 241, 0.05), transparent, rgba(244, 63, 94, 0.05))',
          filter: 'blur(48px)',
        }
      }}
    >
      <ElegantShape
        delay={0.2}
        width={400}
        height={400}
        rotate={45}
        position={{ top: '10%', left: '10%' }}
      />
      <ElegantShape
        delay={0.4}
        width={300}
        height={300}
        rotate={-30}
        position={{ bottom: '10%', right: '10%' }}
      />
      <ElegantShape
        delay={0.6}
        width={200}
        height={200}
        rotate={15}
        position={{ top: '30%', right: '20%' }}
      />

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          maxWidth: '800px',
          px: 4,
        }}
      >
        <Typography
          variant="h2"
          sx={{
            color: 'white',
            fontWeight: 700,
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
            mb: 2,
            background: 'linear-gradient(to right, #fff, #a5b4fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Welcome, {username}!
        </Typography>
      </Box>
    </Box>
  );
};

export default WelcomeScreen; 