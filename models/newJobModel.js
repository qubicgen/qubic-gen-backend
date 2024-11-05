const mongoose = require('mongoose');

const newJobApplicationSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: 'Please enter a valid 10-digit phone number'
    }
  },
  whatsappNumber: {
    type: String,
    required: [true, 'WhatsApp number is required'],
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: 'Please enter a valid 10-digit WhatsApp number'
    }
  },
  personalEmail: {
    type: String,
    required: [true, 'Personal email is required'],
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please enter a valid email address'
    }
  },
  officialMail: {
    type: String,
    required: [true, 'Official email is required'],
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please enter a valid email address'
    }
  },
  course: {
    type: String,
    required: [true, 'Course is required']
  },
  branch: {
    type: String,
    required: [true, 'Branch is required']
  },
  collegeName: {
    type: String,
    required: [true, 'College name is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  passedOutYear: {
    type: String,
    required: [true, 'Passed out year is required'],
    enum: ['2024', '2025']
  },
  tenthPercentage: {
    type: Number,
    required: [true, '10th percentage is required'],
    min: [0, 'Percentage cannot be less than 0'],
    max: [100, 'Percentage cannot be more than 100']
  },
  twelfthPercentage: {
    type: Number,
    required: [true, '12th percentage is required'],
    min: [0, 'Percentage cannot be less than 0'],
    max: [100, 'Percentage cannot be more than 100']
  },
  graduationPercentage: {
    type: Number,
    required: [true, 'Graduation percentage is required'],
    min: [0, 'Percentage cannot be less than 0'],
    max: [100, 'Percentage cannot be more than 100']
  },
  resume: {
    type: String,
    required: ['Resume is required']
  },
  comments: {
    type: String
  },
  applicationStatus: {
    type: String,
    enum: ['pending', 'under_review', 'shortlisted', 'rejected', 'accepted'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
newJobApplicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const NewJobApplication = mongoose.model('NewJobApplication', newJobApplicationSchema);
module.exports = { NewJobApplication };