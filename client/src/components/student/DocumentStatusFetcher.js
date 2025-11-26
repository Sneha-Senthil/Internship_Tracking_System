import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import DocumentStatus from './DocumentStatus';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

const DocumentStatusFetcher = () => {
  const { user } = useContext(AuthContext);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocumentStatus = async () => {
      try {
        setLoading(true);
        // Fetch internship data which includes document status
        const response = await axios.get('http://localhost:5000/api/excel/data');
        
        if (response.data.success) {
          // Filter internships for the current student
          const studentInternships = response.data.data.filter(
            internship => internship['Register No'] === user.username
          );
          
          // Transform the data into the format expected by DocumentStatus component
          const documentStatus = [];
          
          studentInternships.forEach(internship => {
            // Add each document type with its status
            const documentTypes = [
              { name: 'Offer Letter', field: 'Offer Letter' },
              { name: 'Completion Certificate', field: 'Completion Certificate' },
              { name: 'Internship Report', field: 'Internship Report' },
              { name: 'Student Feedback', field: 'Student Feedback' },
              { name: 'Employer Feedback', field: 'Employer Feedback' }
            ];
            
            documentTypes.forEach(doc => {
              const status = internship[doc.field] === 'Yes' ? 'verified' : 
                            internship[doc.field] === 'No' ? 'unverified' : 'pending';
              
              documentStatus.push({
                id: `${internship['Register No']}-${doc.name}`,
                name: doc.name,
                status: status,
                internshipId: internship['Company Name'],
                internshipName: internship['Company Name']
              });
            });
          });
          
          setDocuments(documentStatus);
        }
      } catch (err) {
        console.error('Error fetching document status:', err);
        setError('Failed to load document status. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDocumentStatus();
    }
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (documents.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No internship documents found. Upload your documents to see their status here.
        </Typography>
      </Box>
    );
  }

  return <DocumentStatus documents={documents} />;
};

export default DocumentStatusFetcher; 