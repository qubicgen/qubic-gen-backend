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
    }
})
const Project=mongoose.model('Project',projectSchema)
module.exports=Project