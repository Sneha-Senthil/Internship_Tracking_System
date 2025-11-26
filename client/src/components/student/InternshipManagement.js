import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { motion } from 'framer-motion';
import axios from 'axios';
import Navbar from '../layout/Navbar';
import { AuthContext } from '../../context/AuthContext';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const InternshipManagement = () => {
  const { user } = useContext(AuthContext);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Animation variants
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.1 + i * 0.1,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/excel/data');
      console.log('Received data:', response.data);
      const allInternships = response.data.data;
      const studentInternships = allInternships.filter(
        (internship) => internship['Register No'] === user.username
      );
      setInternships(studentInternships);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching internships:', err);
      setError('Failed to fetch internships');
      setLoading(false);
    }
  };

  const handleAddInternship = () => {
    navigate('/student/internship/add');
  };

  const handleEditInternship = (index) => {
    navigate(`/student/internship/edit/${index}`);
  };

  if (loading)
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );

  if (error)
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar role="student" />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          p: 4,
          minHeight: '100vh',
          bgcolor: 'background.default',
          mt: '64px', // Add margin top to account for fixed navbar
        }}
      >
        <motion.div
          custom={0}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              maxWidth: '1200px',
              mx: 'auto',
              width: '100%',
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                fontSize: '2.2rem',
              }}
            >
              My Internships
            </Typography>
            <Button
              variant="contained"
              onClick={handleAddInternship}
              sx={{
                bgcolor: 'white',
                color: 'black',
                border: '1px solid #e0e0e0',
                '&:hover': {
                  bgcolor: '#f5f5f5',
                },
                textTransform: 'none',
                px: 3,
                py: 1,
              }}
            >
              Add New Internship
            </Button>
          </Box>
        </motion.div>

        {internships.length === 0 ? (
          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <Box
              sx={{
                textAlign: 'center',
                p: 4,
                maxWidth: '1200px',
                mx: 'auto',
                width: '100%',
              }}
            >
              <Typography variant="h6" color="text.secondary">
                No internships found.
              </Typography>
            </Box>
          </motion.div>
        ) : (
          <Grid
            container
            spacing={3}
            sx={{ maxWidth: '1200px', mx: 'auto', width: '100%' }}
          >
            {internships.map((internship, index) => (
              <Grid item xs={12} key={index}>
                <motion.div
                  custom={index + 1}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Card
                    sx={{
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h5"
                            sx={{
                              color: 'text.primary',
                              fontWeight: 600,
                              mb: 1,
                            }}
                          >
                            {internship['Company Name']}
                          </Typography>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              color: 'text.secondary',
                              mb: 2,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1, // adds a little spacing between the icon and text
                            }}
                          >
                            <LocationOnIcon fontSize="small" />
                            {internship['Location']}
                          </Typography>

                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 1,
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              Duration: {internship['Start Date']} -{' '}
                              {internship['End Date']}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Stipend: ₹{internship['Stipend (Rs.)']}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Period: {internship['Period']}
                            </Typography>
                          </Box>
                        </Box>
                        <Button
                          variant="outlined"
                          onClick={() => handleEditInternship(index)}
                          sx={{
                            borderColor: 'black',
                            color: 'black',
                            bgcolor: '#f5f5f5',
                            '&:hover': {
                              bgcolor: '#f5f5f5',
                              boxShadow: '0 0 10px 1px rgba(245, 245, 245, 0.16)',
                            },
                          }}
                        >
                          Edit
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </motion.div>
  );
};

export default InternshipManagement;
