const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new Schema({
	fullName: String,
	email: String,
	type: String,
	phone: Number,
	details: String,
});
const Contact = mongoose.model('Contact', contactSchema);

module.exports = {
	Contact,
};
