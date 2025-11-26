import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Navbar from '../layout/Navbar';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { AuthContext } from '../../context/AuthContext';
import WelcomeScreen from '../student/WelcomeScreen';
import QuoteGenerator from '../student/QuoteGenerator';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalInternships: 0,
    documentsSubmitted: {
      offerLetter: 0,
      completionCertificate: 0,
      internshipReport: 0,
      studentFeedback: 0,
      employerFeedback: 0
    },
    internshipStatus: {
      obtained: 0,
      notObtained: 0
    },
    recentInternships: []
  });

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
    // Check localStorage to see if this is the first visit after login
    const isFirstVisit = localStorage.getItem('teacherFirstVisit');
    console.log('TeacherDashboard mounted, teacherFirstVisit flag value:', isFirstVisit);
    
    if (isFirstVisit === 'true') {
      console.log('Showing welcome screen for teacher');
      setShowWelcome(true);
      
      // Set the flag to false so it doesn't show again until next login
      localStorage.setItem('teacherFirstVisit', 'false');
      console.log('Set teacherFirstVisit flag to false');
    }
  }, []);

  // This effect will run when the component mounts
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/excel/data');
      console.log('Received data:', response.data);
      const allInternships = response.data.data;
      
      // Calculate statistics
      const uniqueStudents = new Set(allInternships.map(item => item['Register No']));
      const totalStudents = uniqueStudents.size;
      
      const totalInternships = allInternships.length;
      
      const documentsSubmitted = {
        offerLetter: allInternships.filter(item => item['Offer Letter'] === 'Yes').length,
        completionCertificate: allInternships.filter(item => item['Completion Certificate'] === 'Yes').length,
        internshipReport: allInternships.filter(item => item['Internship Report'] === 'Yes').length,
        studentFeedback: allInternships.filter(item => item['Student Feedback'] === 'Yes').length,
        employerFeedback: allInternships.filter(item => item['Employer Feedback'] === 'Yes').length
      };
      
      const internshipStatus = {
        obtained: allInternships.filter(item => item['Obtained Internship'] === 'yes').length,
        notObtained: allInternships.filter(item => item['Obtained Internship'] === 'no').length
      };
      
      // Get recent internships (last 5)
      const recentInternships = [...allInternships]
        .sort((a, b) => new Date(b['Start Date'] || '1970-01-01') - new Date(a['Start Date'] || '1970-01-01'))
        .slice(0, 5);
      
      setStats({
        totalStudents,
        totalInternships,
        documentsSubmitted,
        internshipStatus,
        recentInternships
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch dashboard data');
      setLoading(false);
    }
  };

  const handleViewRecords = () => {
    navigate('/teacher/records');
  };

  const handleUploadExcel = () => {
    navigate('/teacher/upload');
  };

  const handleViewReports = () => {
    navigate('/teacher/reports');
  };

  const getStatusColor = (status) => {
    if (status === 'Yes') return 'success';
    if (status === 'No') return 'error';
    return 'default';
  };

  const handleWelcomeComplete = () => {
    // Function to hide welcome screen after animation completes
    setTimeout(() => {
      setShowWelcome(false);
      console.log('Welcome screen animation completed, hiding welcome screen');
    }, 500);
  };

  if (loading && !showWelcome) {
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
        <CircularProgress />
      </Box>
    );
  }

  if (error && !showWelcome) {
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
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {showWelcome ? (
        <WelcomeScreen 
          key="welcome"
          username={user?.username || 'Teacher'} 
          onAnimationComplete={handleWelcomeComplete}
        />
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Navbar role="teacher" />
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
                  justifyContent: 'center',
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
                    textAlign: 'center',
                  }}
                >
                  Welcome, {user?.username || 'Teacher'}!
                </Typography>
              </Box>
            </motion.div>

            <motion.div
              custom={1}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
            >
              <Box sx={{ maxWidth: '800px', mx: 'auto', width: '100%' }}>
                <QuoteGenerator />
              </Box>
            </motion.div>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ maxWidth: '1200px', mx: 'auto', width: '100%' }}>
              <Grid item xs={12} sm={6} md={4}>
                <motion.div
                  custom={2}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PeopleIcon sx={{ fontSize: 40, color: 'text.secondary', mr: 2 }} />
                        <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 600 }}>
                          Students
                        </Typography>
                      </Box>
                      <Typography variant="h3" sx={{ color: 'text.primary', fontWeight: 700, mb: 1 }}>
                        {stats.totalStudents}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total registered students
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <motion.div
                  custom={3}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <WorkIcon sx={{ fontSize: 40, color: 'text.secondary', mr: 2 }} />
                        <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 600 }}>
                          Internships
                        </Typography>
                      </Box>
                      <Typography variant="h3" sx={{ color: 'text.primary', fontWeight: 700, mb: 1 }}>
                        {stats.totalInternships}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Total internships obtained by students
                        </Typography>

                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <motion.div
                  custom={4}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <DescriptionIcon sx={{ fontSize: 40, color: 'text.secondary', mr: 2 }} />
                        <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 600 }}>
                          Documents
                        </Typography>
                      </Box>
                      <Typography variant="h3" sx={{ color: 'text.primary', fontWeight: 700, mb: 1 }}>
                        {Object.values(stats.documentsSubmitted).reduce((a, b) => a + b, 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total documents submitted
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>

            
            {/* Recent Internships */}
            <motion.div
              custom={5}
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
                  p: 3,
                  maxWidth: '1200px',
                  mx: 'auto',
                  width: '100%',
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 600 }}>
                  Recent Internships
                </Typography>
                <List>
                  {stats.recentInternships.map((internship, index) => (
                    <motion.div
                      key={index}
                      custom={6 + index}
                      variants={fadeUpVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <React.Fragment>
                        <ListItem
                          sx={{
                            py: 2,
                            borderRadius: 1,
                            transition: 'background-color 0.2s',
                            '&:hover': {
                              bgcolor: 'rgba(0, 0, 0, 0.04)',
                            },
                          }}
                        >
                          <ListItemIcon>
                            <WorkIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {internship['Company Name']}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {internship['Name']} ({internship['Register No']})
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {internship['Start Date']} to {internship['End Date']}
                                </Typography>
                              </Box>
                            }
                          />
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip
                              label={internship['Internship Type']}
                              variant="outlined"
                              size="small"
                            />
                          </Box>
                        </ListItem>
                        {index < stats.recentInternships.length - 1 && <Divider />}
                      </React.Fragment>
                    </motion.div>
                  ))}
                </List>
              </Card>
            </motion.div>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TeacherDashboard;