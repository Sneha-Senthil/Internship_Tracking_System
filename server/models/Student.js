const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
  registerNo: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  mobileNo: {
    type: String
  },
  section: {
    type: String
  },
  internship: {
    obtained: {
      type: Boolean,
      default: false
    },
    period: String,
    startDate: Date,
    endDate: Date,
    company: String,
    placementSource: String,
    stipend: Number,
    type: String,
    location: String
  },
  documents: {
    offerLetter: {
      type: Boolean,
      default: false
    },
    completionCertificate: {
      type: Boolean,
      default: false
    },
    internshipReport: {
      type: Boolean,
      default: false
    },
    studentFeedback: {
      type: Boolean,
      default: false
    },
    employerFeedback: {
      type: Boolean,
      default: false
    }
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Student", StudentSchema);