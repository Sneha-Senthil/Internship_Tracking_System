import React, { useState, useContext, useEffect } from 'react';

import {
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import Navbar from '../layout/Navbar';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';

const DocumentUpload = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [internships, setInternships] = useState([]);
  const [uploading, setUploading] = useState(false);

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

  // Document types and their keywords for verification
  const documentTypes = {
    'Offer Letter': ['offer letter', 'offer', 'letter'],
    'Completion Certificate': [
      'completion',
      'certificate',
      'completion certificate',
      'completed',
    ],
    'Internship Report': ['internship', 'report', 'internship report'],
    'Student Feedback': [
      'feedback',
      'student',
      'student feedback',
      'experience',
    ],
    'Employer Feedback': [
      'feedback',
      'employer',
      'employer feedback',
      'performance',
    ],
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/excel/data');
      if (response.data.success) {
        // Filter internships for the current student
        const studentInternships = response.data.data.filter(
          (internship) => internship['Register No'] === user.username
        );
        setInternships(studentInternships);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch internships' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (internship, docType, event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setMessage({ type: 'error', text: 'Please upload PDF files only' });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('files', file);
      formData.append('username', user.username);
      formData.append('docType', docType);
      formData.append('companyName', internship['Company Name']);

      const response = await axios.post(
        'http://localhost:5000/api/documents/upload',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.data.success) {
        // Verify the document
        const verifyResponse = await axios.post(
          'http://localhost:5000/api/documents/verify',
          {
            fileId: response.data.uploadedFiles[0].fileId,
            docType,
            keywords: [...documentTypes[docType], internship['Company Name']],
            username: user.username,
            companyName: internship['Company Name'],
          }
        );

        if (verifyResponse.data.verified) {
          setMessage({
            type: 'success',
            text: 'Document uploaded and verified',
          });
        } else {
          setMessage({
            type: 'warning',
            text: 'Document uploaded but unverified',
          });
        }

        fetchInternships();
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to upload document',
      });
    } finally {
      setUploading(false);
    }
  };

  const getVerificationStatus = (internship, docType) => {
    const status = internship[docType];
    if (status === 'Yes')
      return { status: 'verified', icon: <CheckCircleIcon color="success" /> };
    if (status === 'No')
      return { status: 'unverified', icon: <ErrorIcon color="error" /> };
    return { status: 'pending', icon: <PendingIcon color="warning" /> };
  };

  return (
    <>
      <Navbar role="student" />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          p: 4,
          minHeight: '100vh',
          bgcolor: '#121212', // Dark background
          mt: '64px', // Add margin top to account for fixed navbar
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
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
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '2.2rem',
                  textAlign: 'center',
                  mb: 2,
                }}
              >
                Upload Documents
              </Typography>
            </Box>
          </motion.div>

          {message && (
            <Box sx={{ maxWidth: '1200px', mx: 'auto', width: '100%', mb: 3 }}>
              <Alert
                severity={message.type}
                sx={{
                  borderRadius: 2,
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
                }}
                onClose={() => setMessage(null)}
              >
                {message.text}
              </Alert>
            </Box>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid
              container
              spacing={3}
              sx={{ maxWidth: '1200px', mx: 'auto', width: '100%' }}
            >
              {internships.length === 0 ? (
                <Grid item xs={12}>
                  <motion.div
                    custom={1}
                    variants={fadeUpVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Card
                      sx={{
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        bgcolor: 'rgba(25, 25, 25, 0.9)',
                      }}
                    >
                      <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <Typography
                          variant="h6"
                          color="rgba(255, 255, 255, 0.7)"
                        >
                          No internships found to upload documents for.
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ) : (
                internships.map((internship, index) => (
                  <Grid item xs={12} key={index}>
                    <motion.div
                      custom={index + 1}
                      variants={fadeUpVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Card
                        sx={{
                          borderRadius: 2,
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                          bgcolor: 'rgba(25, 25, 25, 0.9)',
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              mb: 2,
                            }}
                          >
                            <Box>
                              <Typography
                                variant="h5"
                                sx={{
                                  color: 'white',
                                  fontWeight: 600,
                                  mb: 1,
                                }}
                              >
                                {internship['Company Name']}
                              </Typography>
                              <Typography
                                variant="body1"
                                color="rgba(255, 255, 255, 0.7)"
                                sx={{ display: 'flex', alignItems: 'center' }}
                              >
                                {internship['Start Date']} -{' '}
                                {internship['End Date']}
                              </Typography>
                            </Box>
                          </Box>
                          <Divider
                            sx={{ my: 2, bgcolor: 'rgba(255, 255, 255, 0.12)' }}
                          />
                          <Grid container spacing={3}>
                            {Object.keys(documentTypes).map(
                              (docType, docIndex) => {
                                const verification = getVerificationStatus(
                                  internship,
                                  docType
                                );
                                return (
                                  <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={4}
                                    key={docType}
                                  >
                                    <motion.div
                                      custom={index + docIndex + 2}
                                      variants={fadeUpVariants}
                                      initial="hidden"
                                      animate="visible"
                                    >
                                      <Paper
                                        elevation={0}
                                        sx={{
                                          p: 3,
                                          borderRadius: 2,
                                          border: '1px solid #555555',
                                          height: '100%',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          bgcolor: 'rgba(25, 25, 25, 0.8)',
                                        }}
                                      >
                                        <Box
                                          display="flex"
                                          alignItems="center"
                                          mb={2}
                                        >
                                          {verification.icon}
                                          <Typography
                                            variant="subtitle1"
                                            sx={{
                                              ml: 1,
                                              fontWeight: 600,
                                              color: 'white',
                                            }}
                                          >
                                            {docType}
                                          </Typography>
                                        </Box>
                                        <Chip
                                          label={verification.status}
                                          color={
                                            verification.status === 'verified'
                                              ? 'success'
                                              : verification.status ===
                                                'unverified'
                                              ? 'error'
                                              : 'warning'
                                          }
                                          size="small"
                                          sx={{
                                            alignSelf: 'flex-start',
                                            mb: 2,
                                            color: 'white',
                                            fontWeight: 500,
                                          }}
                                        />
                                        <Box mt="auto">
                                          <Button
                                            component="label"
                                            variant="contained"
                                            startIcon={
                                              <CloudUploadIcon
                                                sx={{ color: 'black' }}
                                              />
                                            }
                                            disabled={uploading}
                                            fullWidth
                                            sx={{
                                              bgcolor: 'white',
                                              color: 'black',
                                              '&:hover': {
                                                bgcolor: '#f5f5f5',
                                              },
                                              textTransform: 'none',
                                            }}
                                          >
                                            {verification.status === 'verified'
                                              ? 'Replace'
                                              : 'Upload PDF'}
                                            <input
                                              type="file"
                                              hidden
                                              accept=".pdf"
                                              onChange={(e) =>
                                                handleFileUpload(
                                                  internship,
                                                  docType,
                                                  e
                                                )
                                              }
                                            />
                                          </Button>
                                        </Box>
                                      </Paper>
                                    </motion.div>
                                  </Grid>
                                );
                              }
                            )}
                          </Grid>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))
              )}
            </Grid>
          )}
        </motion.div>
      </Box>
    </>
  );
};

export default DocumentUpload;
