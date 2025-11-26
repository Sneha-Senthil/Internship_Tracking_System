const express = require("express");
const router = express.Router();
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const auth = require("../middleware/auth");
const Student = require("../models/Student");

const EXCEL_FILE = path.join(__dirname, "../../student_data.xlsx");

// Helper functions for Excel operations
const loadExcel = () => {
  if (!fs.existsSync(EXCEL_FILE)) return [];
  const workbook = xlsx.readFile(EXCEL_FILE);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return xlsx.utils.sheet_to_json(sheet);
};

const saveExcel = (data) => {
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  xlsx.writeFile(workbook, EXCEL_FILE);
};

// @route   GET api/students
// @desc    Get all students
// @access  Private (Teacher only)
router.get("/", auth, async (req, res) => {
  // Check if user is a teacher
  if (req.user.role !== "teacher") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  try {
    const students = loadExcel();
    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET api/students/:regno
// @desc    Get student by register number
// @access  Private
router.get("/:regno", auth, async (req, res) => {
  try {
    const regno = req.params.regno;
    
    // If student is requesting, verify it's their own data
    if (req.user.role === "student" && req.user.username !== regno) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const students = loadExcel();
    const student = students.find(s => s["Register No"] === regno);

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, student });
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   POST api/students
// @desc    Create or update student details
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const {
      regno, name, mobile, section, internship, period, 
      startdate, enddate, company, src, stipend, type, location,
      offer, completion, report, feedback, emp
    } = req.body;

    // If student is updating, verify it's their own data
    if (req.user.role === "student" && req.user.username !== regno) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    let students = loadExcel();
    let studentIndex = students.findIndex(s => s["Register No"] === regno);

    const updatedStudent = {
      "Register No": regno,
      "Name": name,
      "Mobile No": mobile,
      "Section": section,
      "Obtained Internship": internship,
      "Period": period,
      "Start Date": startdate,
      "End Date": enddate,
      "Company Name": company,
      "Placement Source": src,
      "Stipend (Rs.)": stipend,
      "Internship Type": type,
      "Location": location,
      "Offer Letter Submitted": offer ? "Yes" : "No",
      "Completion Certificate": completion ? "Yes" : "No",
      "Internship Report Submitted": report ? "Yes" : "No",
      "Student Feedback Submitted": feedback ? "Yes" : "No",
      "Employer Feedback Submitted": emp ? "Yes" : "No"
    };

    if (studentIndex === -1) {
      // New student
      students.push(updatedStudent);
    } else {
      // Update existing student
      students[studentIndex] = updatedStudent;
    }

    saveExcel(students);
    res.json({ success: true, message: "Student details updated successfully" });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;