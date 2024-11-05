const { NewJobApplication } = require('../models/newJobModel');
const fs = require('fs');
const nodemailer = require('nodemailer');

// Create transporter here instead of importing
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: 'services@qubicgen.com',
        pass: process.env.EMAIL_PASSWORD
    }
});

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

      const applicationData = {
        ...req.body,
        resume: req.file.filename
      };

      const newApplication = new NewJobApplication(applicationData);
      const savedApplication = await newApplication.save();

      // Send email
      try {
        const emailContent = `
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .content { margin-bottom: 30px; }
                .footer { text-align: center; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Application Received</h1>
                </div>
                <div class="content">
                  <p>Dear ${req.body.fullName},</p>
                  <p>Thank you for applying to QubicGen. We have received your job application and our team will review it shortly.</p>
                  <p>Application Details:</p>
                  <ul>
                    <li>Name: ${req.body.fullName}</li>
                    <li>Position: ${req.body.course}</li>
                    <li>Application ID: ${savedApplication._id}</li>
                  </ul>
                  <p>We will contact you through your provided email (${req.body.personalEmail}) regarding the next steps.</p>
                </div>
                <div class="footer">
                  <p>Best regards,<br>QubicGen Recruitment Team</p>
                </div>
              </div>
            </body>
          </html>
        `;

        await transporter.sendMail({
          from: {
            name: 'QubicGen Careers',
            address: 'services@qubicgen.com'
          },
          to: req.body.personalEmail,
          subject: 'Application Received - QubicGen',
          html: emailContent
        });
      } catch (emailError) {
        console.error('Email error:', emailError);
        // Continue even if email fails
      }

      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: savedApplication
      });

    } catch (error) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      console.error('Application submission error:', error);
      return res.status(400).json({
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