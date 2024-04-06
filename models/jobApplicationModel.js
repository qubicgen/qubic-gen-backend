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
	date: {
		type: Date,
		default: () => {
			const ISTOffset = 330 * 60 * 1000; // Offset in milliseconds for IST (UTC+5:30)
			const dateIST = new Date(Date.now() + ISTOffset);
			return dateIST;
		},
	},
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

module.exports = { JobApplication };
