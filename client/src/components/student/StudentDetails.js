import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, Typography, Box, Paper, Grid, TextField, 
  Button, FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, Checkbox, Alert, CircularProgress
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import Navbar from '../layout/Navbar';
import axios from 'axios';

const StudentDetails = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    regno: '',
    name: '',
    mobile: '',
    section: '',
    internship: 'Yes',
    period: '',
    startdate: '',
    enddate: '',
    company: '',
    src: '',
    stipend: '',
    type: '',
    location: '',
    offer: false,
    completion: false,
    report: false,
    feedback: false,
    emp: false
  });

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const res = await axios.get(`/api/students/${user.username}`);
        if (res.data.success) {
          const student = res.data.student;
          setFormData({
            regno: student['Register No'] || user.username,
            name: student['Name'] || '',
            mobile: student['Mobile No'] || '',
            section: student['Section'] || '',
            internship: student['Obtained Internship'] || 'Yes',
            period: student['Period'] || '',
            startdate: student['Start Date'] || '',
            enddate: student['End Date'] || '',
            company: student['Company Name'] || '',
            src: student['Placement Source'] || '',
            stipend: student['Stipend (Rs.)'] || '',
            type: student['Internship Type'] || '',
            location: student['Location'] || '',
            offer: student['Offer Letter Submitted'] === 'Yes',
            completion: student['Completion Certificate'] === 'Yes',
            report: student['Internship Report Submitted'] === 'Yes',
            feedback: student['Student Feedback Submitted'] === 'Yes',
            emp: student['Employer Feedback Submitted'] === 'Yes'
          });
        } else {
          // If no data found, set register number from user
          setFormData({
            ...formData,
            regno: user.username
          });
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
        // If error, set register number from user
        setFormData({
          ...formData,
          regno: user.username
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user.username]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : (name === 'internship' ? value : value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await axios.post('/api/students', formData);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Student details updated successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update details.' });
      }
    } catch (error) {
      console.error('Error updating student details:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'An error occurred while updating details.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar title="Student Details" role="student" />
        <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar title="Student Details" role="student" />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom align="center">
            Update Your Internship Details
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
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="regno"
                  label="Register Number"
                  name="regno"
                  value={formData.regno}
                  onChange={handleChange}
                  disabled
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="mobile"
                  label="Mobile Number"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="section"
                  label="Section"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                />
              </Grid>

              {/* Internship Information */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Internship Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="internship-label">Obtained Internship</InputLabel>
                  <Select
                    labelId="internship-label"
                    id="internship"
                    name="internship"
                    value={formData.internship}
                    label="Obtained Internship"
                    onChange={handleChange}
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="period"
                  label="Internship Period (in months)"
                  name="period"
                  value={formData.period}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="startdate"
                  label="Start Date"
                  name="startdate"
                  type="date"
                  value={formData.startdate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="enddate"
                  label="End Date"
                  name="enddate"
                  type="date"
                  value={formData.enddate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="company"
                  label="Company Name"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="src"
                  label="Placement Source"
                  name="src"
                  value={formData.src}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="stipend"
                  label="Stipend (Rs.)"
                  name="stipend"
                  type="number"
                  value={formData.stipend}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="type"
                  label="Internship Type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="location"
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </Grid>

              {/* Document Status */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Document Submission Status
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.offer}
                      onChange={handleChange}
                      name="offer"
                    />
                  }
                  label="Offer Letter Submitted"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.completion}
                      onChange={handleChange}
                      name="completion"
                    />
                  }
                  label="Completion Certificate Submitted"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.report}
                      onChange={handleChange}
                      name="report"
                    />
                  }
                  label="Internship Report Submitted"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.feedback}
                      onChange={handleChange}
                      name="feedback"
                    />
                  }
                  label="Student Feedback Submitted"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.emp}
                      onChange={handleChange}
                      name="emp"
                    />
                  }
                  label="Employer Feedback Submitted"
                />
              </Grid>
              
              <Grid item xs={12} sx={{ mt: 3 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={submitting}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Update Details'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default StudentDetails;