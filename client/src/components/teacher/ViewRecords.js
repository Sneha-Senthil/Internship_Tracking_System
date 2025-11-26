import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, TablePagination,
  TextField, InputAdornment, IconButton, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Navbar from '../layout/Navbar';
import axios from 'axios';

const ViewRecords = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get('/api/students');
        if (res.data.success) {
          setStudents(res.data.students);
          setFilteredStudents(res.data.students);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = students.filter(student => 
        student['Register No']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student['Name']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student['Company Name']?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
    setPage(0);
  }, [searchTerm, students]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  if (loading) {
    return (
      <>
        <Navbar title="Student Records" role="teacher" />
        <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar title="Student Records" role="teacher" />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Student Internship Records
            </Typography>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton edge="start">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Register No</strong></TableCell>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Company</strong></TableCell>
                  <TableCell><strong>Period</strong></TableCell>
                  <TableCell><strong>Stipend</strong></TableCell>
                  <TableCell><strong>Offer Letter</strong></TableCell>
                  <TableCell><strong>Completion</strong></TableCell>
                  <TableCell><strong>Report</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((student, index) => (
                    <TableRow key={index}>
                      <TableCell>{student['Register No']}</TableCell>
                      <TableCell>{student['Name']}</TableCell>
                      <TableCell>{student['Company Name']}</TableCell>
                      <TableCell>{student['Period']}</TableCell>
                      <TableCell>{student['Stipend (Rs.)']}</TableCell>
                      <TableCell>{student['Offer Letter Submitted']}</TableCell>
                      <TableCell>{student['Completion Certificate']}</TableCell>
                      <TableCell>{student['Internship Report Submitted']}</TableCell>
                    </TableRow>
                  ))}
                {filteredStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredStudents.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Container>
    </>
  );
};

export default ViewRecords;