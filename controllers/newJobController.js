const { transporter } = require('../emailConfig');
const { NewJobApplication } = require('../models/newJobModel');

const fs = require('fs');

const newJobController = {
  // Create new job application
  createNewJob: async (req, res) => {
    try {
      // Validate file
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Resume file is required'
        });
      }

      // Validate emails before creating application
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(req.body.personalEmail) || !emailRegex.test(req.body.officialMail)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      const existingApplication = await NewJobApplication.findOne({
        $or: [
          { personalEmail: req.body.personalEmail },
          { officialMail: req.body.officialMail }
        ]
      });

      if (existingApplication) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'You have already submitted an application with this email address'
        });
      }

      // Save the application
      const newApplication = new NewJobApplication({
        ...req.body,
        resume: req.file ? req.file.filename : null
      });
      const savedApplication = await newApplication.save();

      try {
        // 1. Email to Applicant
        const applicantEmailContent = `
          <h1>Application Received</h1>
          <p>Dear ${req.body.fullName},</p>
          <p>Thank you for applying to QubicGen. We have received your application and will review it shortly.</p>
          <p>Application Details:</p>
          <ul>
            <li>Name: ${req.body.fullName}</li>
            <li>Email: ${req.body.personalEmail}</li>
            <li>Position: Job Application</li>
          </ul>
          <p>Best regards,<br>QubicGen Team</p>
        `;

        // 2. Email to Admin
        const adminEmailContent = `
          <h1>New Job Application Received</h1>
          <p>A new job application has been submitted.</p>
          <p>Applicant Details:</p>
          <ul>
            <li>Name: ${req.body.fullName}</li>
            <li>Personal Email: ${req.body.personalEmail}</li>
            <li>Official Email: ${req.body.officialMail}</li>
            <li>Phone: ${req.body.phoneNumber}</li>
            <li>WhatsApp: ${req.body.whatsappNumber}</li>
            <li>Course: ${req.body.course}</li>
            <li>Branch: ${req.body.branch}</li>
            <li>College: ${req.body.collegeName}</li>
            <li>Passed Out Year: ${req.body.passedOutYear}</li>
            <li>10th Percentage: ${req.body.tenthPercentage}%</li>
            <li>12th Percentage: ${req.body.twelfthPercentage}%</li>
            <li>Graduation Percentage: ${req.body.graduationPercentage}%</li>
          </ul>
          <p>Comments: ${req.body.comments || 'No comments provided'}</p>
          <p>Resume: ${req.file ? req.file.filename : 'No resume uploaded'}</p>
          <p>Application ID: ${savedApplication._id}</p>
          <p>You can view the full application in the admin dashboard.</p>
        `;

        // Send email to applicant
        await transporter.sendMail({
          from: {
            name: 'QubicGen Careers',
            address: process.env.EMAIL_USER
          },
          to: req.body.personalEmail,
          subject: 'Application Received - QubicGen',
          html: applicantEmailContent
        });

        // Send email to admin
        await transporter.sendMail({
          from: {
            name: 'QubicGen Careers Portal',
            address: process.env.EMAIL_USER
          },
          to: 'services@qubicgen.com',
          cc: ['hr@qubicgen.com'],
          subject: `New Job Application - ${req.body.fullName}`,
          html: adminEmailContent,
          attachments: req.file ? [
            {
              filename: req.file.filename,
              path: req.file.path
            }
          ] : []
        });

        console.log('All notification emails sent successfully');
      } catch (emailError) {
        console.error('Email error:', emailError);
        // Continue with success response even if email fails
      }

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: savedApplication
      });

    } catch (error) {
      console.error('Application error:', error);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({
        success: false,
        message: 'Error submitting application',
        error: error.message
      });
    }
  },

  // Get all applications
  getAllNewJobs: async (req, res) => {
    try {
      const applications = await NewJobApplication.find()
        .sort({ createdAt: -1 });
      
      res.status(200).json({
        success: true,
        count: applications.length,
        data: applications
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error fetching applications',
        error: error.message
      });
    }
  },

  // Get single application
  getNewJobById: async (req, res) => {
    try {
      const application = await NewJobApplication.findById(req.params.id);
      
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      res.status(200).json({
        success: true,
        data: application
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error fetching application',
        error: error.message
      });
    }
  }
};

module.exports = newJobController;