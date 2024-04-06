const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const querySchema = new Schema({
	firstName: String,
	lastName: String,
	email: String,
	jobTitle: String,
	company: String,
	phone: Number,
	message: String,
	date: {
        type: Date,
        default: () => {
            const ISTOffset = 330 * 60 * 1000; // Offset in milliseconds for IST (UTC+5:30)
            const dateIST = new Date(Date.now() + ISTOffset);
            return dateIST;
        },
});
const Query = mongoose.model('Query', querySchema);

module.exports = {
	Query,
};
