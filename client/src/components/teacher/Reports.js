import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
} from '@mui/material';
import { motion } from 'framer-motion';
import axios from 'axios';
import Navbar from '../layout/Navbar';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

const Reports = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredInternships, setFilteredInternships] = useState([]);
  const [filters, setFilters] = useState({
    registerNo: '',
    name: '',
    company: '',
    section: '',
    obtainedInternship: '',
    internshipType: '',
    location: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sections, setSections] = useState([]);
  const [internshipTypes, setInternshipTypes] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/excel/data');
      console.log('Received data:', response.data);
      const allInternships = response.data.data;
      setInternships(allInternships);
      setFilteredInternships(allInternships);

      // Extract unique values for filters
      const uniqueSections = [
        ...new Set(
          allInternships.map((item) => item['Section']).filter(Boolean)
        ),
      ];
      const uniqueTypes = [
        ...new Set(
          allInternships.map((item) => item['Internship Type']).filter(Boolean)
        ),
      ];
      const uniqueLocations = [
        ...new Set(
          allInternships.map((item) => item['Location']).filter(Boolean)
        ),
      ];

      setSections(uniqueSections);
      setInternshipTypes(uniqueTypes);
      setLocations(uniqueLocations);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching internships:', err);
      setError('Failed to fetch internship data');
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    let filtered = [...internships];

    if (filters.registerNo) {
      filtered = filtered.filter((item) =>
        item['Register No']
          ?.toLowerCase()
          .includes(filters.registerNo.toLowerCase())
      );
    }

    if (filters.name) {
      filtered = filtered.filter((item) =>
        item['Name']?.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.company) {
      filtered = filtered.filter((item) =>
        item['Company Name']
          ?.toLowerCase()
          .includes(filters.company.toLowerCase())
      );
    }

    if (filters.section) {
      filtered = filtered.filter((item) => item['Section'] === filters.section);
    }

    if (filters.obtainedInternship) {
      filtered = filtered.filter(
        (item) => item['Obtained Internship'] === filters.obtainedInternship
      );
    }

    if (filters.internshipType) {
      filtered = filtered.filter(
        (item) => item['Internship Type'] === filters.internshipType
      );
    }

    if (filters.location) {
      filtered = filtered.filter(
        (item) => item['Location'] === filters.location
      );
    }

    setFilteredInternships(filtered);
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({
      registerNo: '',
      name: '',
      company: '',
      section: '',
      obtainedInternship: '',
      internshipType: '',
      location: '',
    });
    setFilteredInternships(internships);
    setPage(0);
  };

  const exportToExcel = () => {
    // Create CSV content
    const headers = Object.keys(internships[0]);
    const csvContent = [
      headers.join(','),
      ...filteredInternships.map((row) =>
        headers
          .map((header) => {
            const value = row[header] || '';
            // Escape commas and quotes
            return `"${String(value).replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'internship_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status) => {
    if (status === 'Yes') return 'success';
    if (status === 'No') return 'error';
    return 'default';
  };

  if (loading) {
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

  if (error) {
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
    <motion.div
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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '1400px',
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
            Internship Reports
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{
                bgcolor: 'white',
                color: 'black',
                border: '1px solid #e0e0e0',
                '&:hover': {
                  bgcolor: '#f5f5f5',
                },
              }}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button
              variant="contained"
              onClick={exportToExcel}
              sx={{
                bgcolor: 'black',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.8)',
                },
              }}
            >
              Export to Excel
            </Button>
          </Box>
        </Box>

        {showFilters && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: 'background.default',
              border: '1px solid #e0e0e0',
              maxWidth: '1400px',
              mx: 'auto',
              width: '100%',
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Register No"
                  name="registerNo"
                  value={filters.registerNo}
                  onChange={handleFilterChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={filters.name}
                  onChange={handleFilterChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Company"
                  name="company"
                  value={filters.company}
                  onChange={handleFilterChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Section</InputLabel>
                  <Select
                    name="section"
                    value={filters.section}
                    onChange={handleFilterChange}
                    label="Section"
                  >
                    <MenuItem value="">All</MenuItem>
                    {sections.map((section) => (
                      <MenuItem key={section} value={section}>
                        {section}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Obtained Internship</InputLabel>
                  <Select
                    name="obtainedInternship"
                    value={filters.obtainedInternship}
                    onChange={handleFilterChange}
                    label="Obtained Internship"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Internship Type</InputLabel>
                  <Select
                    name="internshipType"
                    value={filters.internshipType}
                    onChange={handleFilterChange}
                    label="Internship Type"
                  >
                    <MenuItem value="">All</MenuItem>
                    {internshipTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Location</InputLabel>
                  <Select
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    label="Location"
                  >
                    <MenuItem value="">All</MenuItem>
                    {locations.map((location) => (
                      <MenuItem key={location} value={location}>
                        {location}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={applyFilters}
                    sx={{
                      bgcolor: 'black',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.8)',
                      },
                    }}
                  >
                    Apply Filters
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={clearFilters}
                    startIcon={<ClearIcon />}
                    sx={{
                      borderColor: 'black',
                      color: 'black',
                      '&:hover': {
                        borderColor: 'black',
                        bgcolor: '#f5f5f5',
                      },
                    }}
                  >
                    Clear
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            bgcolor: 'background.default',
            border: '1px solid rgb(73, 73, 73)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
            maxWidth: '1400px',
            mx: 'auto',
            width: '100%',
            overflow: 'auto',
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="internship table">
              <TableHead>
                <TableRow>
                  <TableCell>Register No</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Section</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Stipend</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Documents</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInternships
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((internship, index) => (
                    <TableRow
                      key={index}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {internship['Register No']}
                      </TableCell>
                      <TableCell>{internship['Name']}</TableCell>
                      <TableCell>{internship['Section']}</TableCell>
                      <TableCell>{internship['Company Name']}</TableCell>
                      <TableCell>{internship['Location']}</TableCell>
                      <TableCell>{internship['Period']}</TableCell>
                      <TableCell>{internship['Start Date']}</TableCell>
                      <TableCell>{internship['End Date']}</TableCell>
                      <TableCell>₹{internship['Stipend (Rs.)']}</TableCell>
                      <TableCell>{internship['Internship Type']}</TableCell>
                      <TableCell>
                        <Chip
                          label={internship['Obtained Internship']}
                          color={getStatusColor(
                            internship['Obtained Internship']
                          )}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Offer Letter">
                            <Chip
                              label="OL"
                              color={getStatusColor(
                                internship['Offer Letter Submitted']
                              )}
                              size="small"
                            />
                          </Tooltip>
                          <Tooltip title="Completion Certificate">
                            <Chip
                              label="CC"
                              color={getStatusColor(
                                internship['Completion Certificate']
                              )}
                              size="small"
                            />
                          </Tooltip>
                          <Tooltip title="Internship Report">
                            <Chip
                              label="IR"
                              color={getStatusColor(
                                internship['Internship Report Submitted']
                              )}
                              size="small"
                            />
                          </Tooltip>
                          <Tooltip title="Student Feedback">
                            <Chip
                              label="SF"
                              color={getStatusColor(
                                internship['Student Feedback Submitted']
                              )}
                              size="small"
                            />
                          </Tooltip>
                          <Tooltip title="Employer Feedback">
                            <Chip
                              label="EF"
                              color={getStatusColor(
                                internship['Employer Feedback Submitted']
                              )}
                              size="small"
                            />
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredInternships.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
    </motion.div>
  );
};

export default Reports;
