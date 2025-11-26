import React, { useState, useRef } from 'react';
import { Box, Button, CircularProgress, Paper, Typography, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

const DebugBox = styled(Box)(({ theme }) => ({
  '& pre': {
    background: '#f5f5f5',
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    overflow: 'auto',
    maxHeight: '200px',
  }
}));

const UploadTest = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [authStatus, setAuthStatus] = useState(null);
  const fileInputRef = useRef();

  // Check Drive auth status
  const checkAuth = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test/auth-check');
      const data = await response.json();
      setAuthStatus(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setAuthStatus(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setResult(null);
    setError(null);
  };

  // Handle test upload
  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/test/upload-test', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setResult(data);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFile(null);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Drive Upload Test
        </Typography>

        <Box my={3}>
          <Button 
            variant="outlined" 
            onClick={checkAuth} 
            disabled={loading}
            sx={{ mb: 2 }}
          >
            Check Drive Auth Status
          </Button>

          {authStatus && (
            <DebugBox>
              <Typography variant="subtitle2" gutterBottom>Auth Status:</Typography>
              <pre>{JSON.stringify(authStatus, null, 2)}</pre>
            </DebugBox>
          )}
        </Box>

        <Box my={3}>
          <input
            ref={fileInputRef}
            accept="*/*"
            type="file"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="test-file-input"
          />
          <label htmlFor="test-file-input">
            <Button variant="contained" component="span" disabled={loading}>
              Select File
            </Button>
          </label>

          {file && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected: {file.name}
            </Typography>
          )}

          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!file || loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Upload Test File'}
          </Button>
        </Box>

        {error && (
          <DebugBox sx={{ mt: 2 }}>
            <Typography color="error" variant="subtitle2" gutterBottom>
              Error:
            </Typography>
            <pre style={{ color: 'red' }}>{error}</pre>
          </DebugBox>
        )}

        {result && (
          <DebugBox sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Upload Result:
            </Typography>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </DebugBox>
        )}
      </Paper>
    </Box>
  );
};

export default UploadTest;