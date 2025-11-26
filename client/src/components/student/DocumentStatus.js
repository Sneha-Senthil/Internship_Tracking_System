import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import PendingIcon from '@mui/icons-material/Pending';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

const DocumentStatus = ({ documents }) => {
  // Group documents by internship
  const documentsByInternship = documents.reduce((acc, document) => {
    if (!acc[document.internshipId]) {
      acc[document.internshipId] = {
        internshipName: document.internshipName,
        documents: []
      };
    }
    acc[document.internshipId].documents.push(document);
    return acc;
  }, {});

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon sx={{ color: 'success.main', fontSize: '1.25rem' }} />;
      case 'unverified':
        return <WarningIcon sx={{ color: 'warning.main', fontSize: '1.25rem' }} />;
      case 'pending':
        return <PendingIcon sx={{ color: 'text.disabled', fontSize: '1.25rem' }} />;
      default:
        return null;
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'verified':
        return (
          <Chip 
            label="Verified"
            size="small"
            sx={{ 
              bgcolor: 'success.main',
              color: 'success.contrastText',
              fontSize: '0.75rem',
              height: '24px'
            }}
          />
        );
      case 'unverified':
        return (
          <Chip 
            label="Unverified"
            size="small"
            sx={{ 
              bgcolor: 'warning.main',
              color: 'warning.contrastText',
              fontSize: '0.75rem',
              height: '24px'
            }}
          />
        );
      case 'pending':
        return (
          <Chip 
            label="Pending Upload"
            size="small"
            sx={{ 
              bgcolor: 'transparent',
              border: '1px solid',
              borderColor: 'text.disabled',
              color: 'text.disabled',
              fontSize: '0.75rem',
              height: '24px'
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Stack spacing={3}>
      {Object.entries(documentsByInternship).map(([internshipId, { internshipName, documents }]) => (
        <Card 
          key={internshipId}
          sx={{ 
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.primary',
                fontSize: '1rem',
                fontWeight: 500,
                mb: 2
              }}
            >
              {internshipName}
            </Typography>
            <Typography 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.875rem',
                mb: 3
              }}
            >
              {documents.filter(d => d.status === 'verified').length} verified,{' '}
              {documents.filter(d => d.status === 'unverified').length} unverified,{' '}
              {documents.filter(d => d.status === 'pending').length} pending
            </Typography>
            
            <Stack spacing={2}>
              {documents.map((doc) => (
                <Box
                  key={doc.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                    }
                  }}
                >
                  <DescriptionOutlinedIcon sx={{ color: 'text.secondary', fontSize: '1.25rem' }} />
                  <Typography 
                    sx={{ 
                      flex: 1,
                      color: 'text.primary',
                      fontSize: '0.875rem'
                    }}
                  >
                    {doc.name}
                  </Typography>
                  {getStatusChip(doc.status)}
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

export default DocumentStatus; 