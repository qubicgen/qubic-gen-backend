const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const jobApplicationSchema = new Schema({
	selectedJobRole: String,
	fullName: String,
	email: String,
	phone: Number,
	linkedInURL: String,
	githubURL: String,
	address: String,
	education: {
		level: String,
		institution: String,
		stream: String,
		graduationYear: String, // Assuming graduationYear should be a number
		cgpaPercentage: mongoose.Mixed, // Use Mixed if it can be a string or a number
	},
	workExperience: {
		experienceLevel: String,
		jobTitle: String,
		responsibilities: String,
	},
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

module.exports = { JobApplication };
