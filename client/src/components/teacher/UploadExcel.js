import React, { useState } from 'react';
import { 
  Container, Typography, Box, Paper, Button, 
  CircularProgress, Alert, List, ListItem, ListItemText
} from '@mui/material';
import Navbar from '../layout/Navbar';
import axios from 'axios';

const UploadExcel = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage(null);
    setUploadResults(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setMessage({ type: 'error', text: 'Please select an Excel file' });
      return;
    }

    // Check if file is Excel
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setMessage({ type: 'error', text: 'Please upload an Excel file (.xlsx or .xls)' });
      return;
    }

    setUploading(true);
    setMessage(null);
    setUploadResults(null);

    const formData = new FormData();
    formData.append('excelFile', file);

    try {
      const res = await axios.post('/api/students/upload-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Excel data uploaded successfully!' });
        setUploadResults(res.data.results);
        setFile(null);
        // Reset the file input
        document.getElementById('excel-upload').value = '';
      } else {
        setMessage({ type: 'error', text: res.data.message || 'Upload failed' });
      }
    } catch (error) {
      console.error('Error uploading Excel:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'An error occurred during upload' 
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Navbar title="Upload Excel Data" role="teacher" />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom align="center">
            Upload Student Data Excel File
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
            <Box sx={{ border: '1px dashed #ccc', p: 3, borderRadius: 1, mb: 3 }}>
              <input
                accept=".xlsx, .xls"
                id="excel-upload"
                type="file"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="excel-upload">
                <Button
                  variant="contained"
                  component="span"
                  fullWidth
                >
                  Select Excel File
                </Button>
              </label>
              {file && (
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Selected file: {file.name}
                </Typography>
              )}
            </Box>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={uploading || !file}
            >
              {uploading ? <CircularProgress size={24} /> : 'Upload Excel Data'}
            </Button>
          </Box>

          {uploadResults && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Upload Results
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary={`Total Records: ${uploadResults.total}`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary={`Successfully Processed: ${uploadResults.success}`} 
                  />
                </ListItem>
                {uploadResults.errors > 0 && (
                  <ListItem>
                    <ListItemText 
                      primary={`Errors: ${uploadResults.errors}`} 
                      secondary="Check console for details"
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default UploadExcel;