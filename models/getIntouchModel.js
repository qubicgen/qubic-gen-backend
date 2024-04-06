const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const getInTouchSchema = new Schema({
	fullName: String,
	email: String,
	message: String,
	date: {
        type: Date,
        default: () => {
            const ISTOffset = 330 * 60 * 1000; // Offset in milliseconds for IST (UTC+5:30)
            const dateIST = new Date(Date.now() + ISTOffset);
            return dateIST;
        },
});
const GetInTouch = mongoose.model('GetInTouch', getInTouchSchema);

module.exports = {
	GetInTouch,
};
