const mongoose=require('mongoose')
const studentSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    course:{
        type:String,
        
        required:true
    },
    college:{
        type:String,
        
        required:true
    },
    stream:{
        type:String,
        required:true
    },

    message:{
        type:String,
        required:true
    },
    date: {
		type: Date,
		default: () => {
			const ISTOffset = 330 * 60 * 1000; // Offset in milliseconds for IST (UTC+5:30)
			const dateIST = new Date(Date.now() + ISTOffset);
			return dateIST;
		},
    }
})
const Student=mongoose.model('Student',studentSchema)
module.exports=Student