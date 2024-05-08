const Student = require("../models/studentModel")

//@controller function to save data of student via form
const createStudent=async(req,res)=>{
    try {

        //@recieving data from via req.body
        const data=req.body

        //@creating instance of student model
        const newStudent=new Student(data)
        //@saving data of student from form
        await newStudent.save()
        //@returning data 
        res.status(200).json({
            message:'student creation succesful',
            student:newStudent
        })
    } catch (error) {
        console.error('Error creating student:', error);

        return res.status(500).json({
            message: 'Error creating student',
            error: error.message,
        });
    }
}
module.exports=createStudent