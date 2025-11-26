import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import Navbar from '../layout/Navbar';
import axios from 'axios';
import { motion } from 'framer-motion';


const EditInternship = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    'Register No': '',
    'Name': '',
    'Mobile No': '',
    'Section': '',
    'Obtained Internship': 'Yes',
    'Period': '',
    'Start Date': '',
    'End Date': '',
    'Company Name': '',
    'Placement Source': '',
    'Stipend (Rs.)': '',
    'Internship Type': '',
    'Location': '',
    'Offer Letter Submitted': 'No',
    'Completion Certificate': 'No',
    'Internship Report Submitted': 'No',
    'Student Feedback Submitted': 'No',
    'Employer Feedback Submitted': 'No'
  });

  useEffect(() => {
    const fetchInternship = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/excel/data');
        const allInternships = response.data.data;
        const studentInternships = allInternships.filter(
          internship => internship['Register No'] === user.username
        );

        const internshipToEdit = studentInternships[parseInt(id)];
        if (internshipToEdit) {
          // Ensure all document status fields have default values
          const updatedFormData = {
            ...internshipToEdit,
            'Offer Letter Submitted': internshipToEdit['Offer Letter Submitted'] || 'No',
            'Completion Certificate': internshipToEdit['Completion Certificate'] || 'No',
            'Internship Report Submitted': internshipToEdit['Internship Report Submitted'] || 'No',
            'Student Feedback Submitted': internshipToEdit['Student Feedback Submitted'] || 'No',
            'Employer Feedback Submitted': internshipToEdit['Employer Feedback Submitted'] || 'No'
          };
          setFormData(updatedFormData);
        } else {
          setMessage({ type: 'error', text: 'Internship not found' });
        }
      } catch (error) {
        console.error('Error fetching internship:', error);
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.message || 'Failed to fetch internship details' 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInternship();
  }, [id, user.username]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = [];

    // Register No validation (should be 13 alphanumeric characters)
    const regNoPattern = /^[A-Za-z0-9]{13}$/;
    if (!regNoPattern.test(formData['Register No'])) {
      errors.push('Register No must be exactly 13 alphanumeric characters.');
    }

    // Name validation (only letters and spaces)
    const namePattern = /^[A-Za-z\s]+$/;
    if (!namePattern.test(formData['Name'])) {
      errors.push('Name must contain only letters and spaces.');
    }

    // Mobile number validation (10 digits)
    const mobilePattern = /^[0-9]{10}$/;
    if (formData['Mobile No'] && !mobilePattern.test(formData['Mobile No'])) {
      errors.push('Mobile number must be exactly 10 digits.');
    }

    // Section validation (1-2 uppercase letters)
    const sectionPattern = /^[A-Z]{1,2}$/;
    if (formData['Section'] && !sectionPattern.test(formData['Section'])) {
      errors.push('Section must be 1 or 2 uppercase letters.');
    }

    // Period validation (if internship is obtained)
    if (formData['Obtained Internship'] === 'Yes') {
      const periodPattern = /^[0-9]+ (days|weeks|months|years)$/i;
      if (!periodPattern.test(formData['Period'])) {
        errors.push('Period format should be like "2 months".');
      }

      // Company name validation
      if (!formData['Company Name'].trim()) {
        errors.push('Company Name is required if you have obtained an internship.');
      }

      // Date validation
      if (!formData['Start Date']) {
        errors.push('Start Date is required.');
      }
      if (!formData['End Date']) {
        errors.push('End Date is required.');
      }
      if (formData['Start Date'] && formData['End Date']) {
        const startDate = new Date(formData['Start Date']);
        const endDate = new Date(formData['End Date']);
        if (startDate >= endDate) {
          errors.push('End date must be after start date.');
        }
      }

      // Stipend validation
      if (formData['Stipend (Rs.)'] && parseFloat(formData['Stipend (Rs.)']) < 0) {
        errors.push('Stipend cannot be negative.');
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setMessage({ 
        type: 'error', 
        text: validationErrors.join('\n')
      });
      setSubmitting(false);
      return;
    }

    try {
      console.log('Sending update request with data:', formData);
      console.log('Update URL:', `http://localhost:5000/api/excel/update/${id}`);
      
      // Ensure we're sending the correct content type
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.put(
        `http://localhost:5000/api/excel/update/${id}`, 
        formData,
        config
      );
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Internship details updated successfully!' });
        setTimeout(() => {
          navigate('/student/internship');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to update internship details.' });
      }
    } catch (error) {
      console.error('Error updating internship:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'An error occurred while updating details.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

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

  if (loading) {
    return (
      <>
        <Navbar title="Edit Internship" role="student" />
        <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar title="Edit Internship" role="student" />
      <Container maxWidth="md" sx={{ mt: 12, mb: 4 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            bgcolor: 'background.default',
            border: '1px solid #e0e0e0'
          }}
        >
          <Typography variant="h5" gutterBottom align="center" sx={{ color: 'text.primary', fontWeight: 600 }}>
            Edit Internship Details
          </Typography>

          {message && (
            <Alert 
              severity={message.type} 
              sx={{ mb: 2 }}
              onClose={() => setMessage(null)}
            >
              {message.text}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              {/* Personal Information */}
              <Grid item xs={12}>
                <motion.div
                  custom={1}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 600 }}>
                    Personal Information
                  </Typography>
                </motion.div>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <motion.div
                  custom={2}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <TextField
                    required
                    fullWidth
                    id="Register No"
                    label="Register Number"
                    name="Register No"
                    value={formData['Register No']}
                    onChange={handleChange}
                    disabled
                  />
                </motion.div>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <motion.div
                  custom={3}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <TextField
                    required
                    fullWidth
                    id="Name"
                    label="Full Name"
                    name="Name"
                    value={formData['Name']}
                    onChange={handleChange}
                  />
                </motion.div>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <motion.div
                  custom={4}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <TextField
                    fullWidth
                    id="Mobile No"
                    label="Mobile Number"
                    name="Mobile No"
                    value={formData['Mobile No']}
                    onChange={handleChange}
                  />
                </motion.div>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <motion.div
                  custom={5}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <TextField
                    fullWidth
                    id="Section"
                    label="Section"
                    name="Section"
                    value={formData['Section']}
                    onChange={handleChange}
                  />
                </motion.div>
              </Grid>

              {/* Internship Information */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <motion.div
                  custom={6}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 600 }}>
                    Internship Information
                  </Typography>
                </motion.div>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <motion.div
                  custom={7}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <FormControl fullWidth>
                    <InputLabel id="internship-label">Obtained Internship</InputLabel>
                    <Select
                      labelId="internship-label"
                      id="Obtained Internship"
                      name="Obtained Internship"
                      value={formData['Obtained Internship']}
                      label="Obtained Internship"
                      onChange={handleChange}
                    >
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </Select>
                  </FormControl>
                </motion.div>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <motion.div
                  custom={8}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <TextField
                    fullWidth
                    id="Period"
                    label="Internship Period (in months)"
                    name="Period"
                    value={formData['Period']}
                    onChange={handleChange}
                  />
                </motion.div>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <motion.div
                  custom={9}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <TextField
                    fullWidth
                    id="Start Date"
                    label="Start Date"
                    name="Start Date"
                    type="date"
                    value={formData['Start Date']}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </motion.div>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <motion.div
                  custom={10}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <TextField
                    fullWidth
                    id="End Date"
                    label="End Date"
                    name="End Date"
                    type="date"
                    value={formData['End Date']}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </motion.div>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <motion.div
                  custom={11}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <TextField
                    fullWidth
                    id="Company Name"
                    label="Company Name"
                    name="Company Name"
                    value={formData['Company Name']}
                    onChange={handleChange}
                  />
                </motion.div>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <motion.div
                  custom={12}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <TextField
                    fullWidth
                    id="Placement Source"
                    label="Placement Source"
                    name="Placement Source"
                    value={formData['Placement Source']}
                    onChange={handleChange}
                  />
                </motion.div>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <motion.div
                  custom={13}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <TextField
                    fullWidth
                    id="Stipend (Rs.)"
                    label="Stipend (Rs.)"
                    name="Stipend (Rs.)"
                    type="number"
                    value={formData['Stipend (Rs.)']}
                    onChange={handleChange}
                  />
                </motion.div>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <motion.div
                  custom={14}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <TextField
                    fullWidth
                    id="Internship Type"
                    label="Internship Type"
                    name="Internship Type"
                    value={formData['Internship Type']}
                    onChange={handleChange}
                  />
                </motion.div>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <motion.div
                  custom={15}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <FormControl fullWidth>
                    <InputLabel id="location-label">Location</InputLabel>
                    <Select
                      labelId="location-label"
                      id="Location"
                      name="Location"
                      value={formData['Location']}
                      label="Location"
                      onChange={handleChange}
                    >
                      <MenuItem value="India">India</MenuItem>
                      <MenuItem value="Abroad">Abroad</MenuItem>
                    </Select>
                  </FormControl>
                </motion.div>
              </Grid>

              {/* Document Submission */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <motion.div
                  custom={16}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 600 }}>
                    Document Submission
                  </Typography>
                </motion.div>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <motion.div
                  custom={17}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <FormControl fullWidth>
                    <InputLabel id="offer-letter-label">Offer Letter</InputLabel>
                    <Select
                      labelId="offer-letter-label"
                      id="Offer Letter"
                      name="Offer Letter"
                      value={formData['Offer Letter']}
                      label="Offer Letter"
                      onChange={handleChange}
                    >
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </Select>
                  </FormControl>
                </motion.div>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <motion.div
                  custom={18}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <FormControl fullWidth>
                    <InputLabel id="completion-certificate-label">Completion Certificate</InputLabel>
                    <Select
                      labelId="completion-certificate-label"
                      id="Completion Certificate"
                      name="Completion Certificate"
                      value={formData['Completion Certificate']}
                      label="Completion Certificate"
                      onChange={handleChange}
                    >
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </Select>
                  </FormControl>
                </motion.div>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <motion.div
                  custom={19}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <FormControl fullWidth>
                    <InputLabel id="internship-report-label">Internship Report</InputLabel>
                    <Select
                      labelId="internship-report-label"
                      id="Internship Report"
                      name="Internship Report"
                      value={formData['Internship Report']}
                      label="Internship Report"
                      onChange={handleChange}
                    >
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </Select>
                  </FormControl>
                </motion.div>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <motion.div
                  custom={20}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <FormControl fullWidth>
                    <InputLabel id="student-feedback-label">Student Feedback</InputLabel>
                    <Select
                      labelId="student-feedback-label"
                      id="Student Feedback"
                      name="Student Feedback"
                      value={formData['Student Feedback']}
                      label="Student Feedback"
                      onChange={handleChange}
                    >
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </Select>
                  </FormControl>
                </motion.div>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <motion.div
                  custom={21}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <FormControl fullWidth>
                    <InputLabel id="employer-feedback-label">Employer Feedback</InputLabel>
                    <Select
                      labelId="employer-feedback-label"
                      id="Employer Feedback"
                      name="Employer Feedback"
                      value={formData['Employer Feedback']}
                      label="Employer Feedback"
                      onChange={handleChange}
                    >
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </Select>
                  </FormControl>
                </motion.div>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <motion.div
                  custom={22}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={submitting}
                      sx={{
                        bgcolor: 'black',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.8)',
                        },
                      }}
                    >
                      {submitting ? <CircularProgress size={24} /> : 'Update Internship'}
                    </Button>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => navigate('/student/internship')}
                      sx={{
                        bgcolor: 'black',
                        color: 'white',
                        margin: '5px',
                        border: '1px solid #e0e0e0',
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </motion.div>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default EditInternship;