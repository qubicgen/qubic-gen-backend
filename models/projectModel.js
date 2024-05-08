const mongoose=require('mongoose')
const projectSchema=new mongoose.Schema({
    name:{
        type:"String",
        required:true
    },
    email:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:true
    },
    jobTitle:{
        type:String,
        required:true
    },
    company:{
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
const Project=mongoose.model('Project',projectSchema)
module.exports=Project