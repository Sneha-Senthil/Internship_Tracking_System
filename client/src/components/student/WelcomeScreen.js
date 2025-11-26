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

const WelcomeScreen = ({ username, onAnimationComplete }) => {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

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
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="rgba(192, 192, 192, 0.15)"
          position={{ left: '-10%', top: '15%' }}
        />
        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="rgba(192, 192, 192, 0.15)"
          position={{ right: '-5%', top: '70%' }}
        />
        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="rgba(192, 192, 192, 0.15)"
          position={{ left: '5%', bottom: '5%' }}
        />
        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient="rgba(192, 192, 192, 0.15)"
          position={{ right: '15%', top: '10%' }}
        />
        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradient="rgba(192, 192, 192, 0.15)"
          position={{ left: '20%', top: '5%' }}
        />
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '800px', px: 4 }}>
        <motion.div
          custom={1}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          onAnimationComplete={onAnimationComplete}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.75rem', md: '5rem' },
              fontWeight: 'bold',
              mb: 3,
              background: 'linear-gradient(to bottom, white, rgba(255, 255, 255, 0.8))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Welcome, {username}
          </Typography>
        </motion.div>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, #030303, transparent, #030303)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
};

export default WelcomeScreen; 