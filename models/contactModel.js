const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new Schema({
	firstName: String,
	lastName: String,
	email: String,
	jobTitle: String,
	company: String,
	phone: Number,
	address: String,
});
const Contact = mongoose.model('Contact', contactSchema);

module.exports = {
	Contact,
};
