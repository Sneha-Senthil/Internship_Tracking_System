const express = require('express');
const router = express.Router();
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// Path to the Excel file
const filePath = path.join(__dirname, '../..', 'student_data.xlsx');

// Helper function to find internship index by register number and company
const findInternshipIndex = (data, registerNo, companyName) => {
    return data.findIndex(item => 
        item['Register No'] === registerNo && 
        item['Company Name'] === companyName
    );
};

// Endpoint to read Excel and send data as JSON
router.get('/data', (req, res) => {
    try {
        if (!fs.existsSync(filePath)) {
            console.log('Excel file not found at:', filePath);
            return res.status(404).json({ 
                error: "Excel file not found",
                message: "Please upload an Excel file first",
                path: filePath
            });
        }

        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Read first sheet
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        
        console.log('Excel file read successfully. Number of records:', data.length);
        res.json({
            success: true,
            count: data.length,
            data: data
        });
    } catch (error) {
        console.error('Error reading Excel file:', error);
        res.status(500).json({ 
            error: "Error reading Excel file",
            message: error.message
        });
    }
});

// Endpoint to add new internship
router.post('/add', (req, res) => {
    console.log('Add internship request received:', req.body);
    
    try {
        if (!fs.existsSync(filePath)) {
            console.log('Excel file not found at:', filePath);
            return res.status(404).json({ 
                error: "Excel file not found",
                message: "Please upload an Excel file first"
            });
        }

        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        
        // Check if internship already exists for this student and company
        const existingIndex = findInternshipIndex(
            data,
            req.body['Register No'],
            req.body['Company Name']
        );

        if (existingIndex !== -1) {
            return res.status(400).json({
                error: "Internship already exists",
                message: "An internship with this company already exists for this student"
            });
        }

        // Add new internship
        data.push(req.body);

        // Convert back to worksheet
        const worksheet = xlsx.utils.json_to_sheet(data);
        workbook.Sheets[sheetName] = worksheet;

        // Write back to file
        xlsx.writeFile(workbook, filePath);

        console.log('Internship added successfully');
        res.json({
            success: true,
            message: "Internship added successfully",
            internship: req.body
        });
    } catch (error) {
        console.error('Error adding internship:', error);
        res.status(500).json({ 
            error: "Error adding internship",
            message: error.message
        });
    }
});

// Endpoint to update internship data
router.put('/update/:id', (req, res) => {
    console.log('Update request received for ID:', req.params.id);
    console.log('Request body:', req.body);
    
    try {
        if (!fs.existsSync(filePath)) {
            console.log('Excel file not found at:', filePath);
            return res.status(404).json({ 
                error: "Excel file not found",
                message: "Please upload an Excel file first"
            });
        }

        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        
        console.log('Total records in Excel:', data.length);
        
        // Filter internships for the specific student
        const studentInternships = data.filter(
            internship => internship['Register No'] === req.body['Register No']
        );
        
        console.log('Found student internships:', studentInternships.length);
        
        // Get the specific internship using the index from the filtered list
        const internshipIndex = parseInt(req.params.id);
        if (internshipIndex < 0 || internshipIndex >= studentInternships.length) {
            console.log('Invalid internship index:', internshipIndex);
            return res.status(404).json({ 
                error: "Internship not found",
                message: "The internship you're trying to update doesn't exist"
            });
        }

        // Find the actual index in the full data array
        const actualIndex = findInternshipIndex(
            data, 
            studentInternships[internshipIndex]['Register No'],
            studentInternships[internshipIndex]['Company Name']
        );

        if (actualIndex === -1) {
            console.log('Could not find internship in full dataset');
            return res.status(404).json({ 
                error: "Internship not found",
                message: "Could not locate the internship in the dataset"
            });
        }

        console.log('Found internship at index:', actualIndex);

        // Update the internship data
        data[actualIndex] = { ...data[actualIndex], ...req.body };

        // Convert back to worksheet
        const worksheet = xlsx.utils.json_to_sheet(data);
        workbook.Sheets[sheetName] = worksheet;

        // Write back to file
        xlsx.writeFile(workbook, filePath);

        console.log('Internship updated successfully');
        res.json({
            success: true,
            message: "Internship updated successfully",
            updatedInternship: data[actualIndex]
        });
    } catch (error) {
        console.error('Error updating internship:', error);
        res.status(500).json({ 
            error: "Error updating internship",
            message: error.message
        });
    }
});

// Endpoint to upload Excel file
router.post('/upload', (req, res) => {
    try {
        // TODO: Implement file upload logic
        res.status(501).json({ 
            error: "Not implemented",
            message: "Excel file upload endpoint not yet implemented"
        });
    } catch (error) {
        console.error('Error uploading Excel file:', error);
        res.status(500).json({ 
            error: "Error uploading Excel file",
            message: error.message
        });
    }
});

module.exports = router;