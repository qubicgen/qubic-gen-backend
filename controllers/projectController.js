const Project = require("../models/projectModel")


//@controller function to save data of project via form
const createProject=async(req,res)=>{
    try {

        //@recieving data from via req.body
        const data=req.body

        //@creating instance of student model
        const newProject=new Project(data)
        //@saving data of project from form
        await newProject.save()
        //@returning data 
        res.status(200).json({
            message:'project creation succesful',
            student:newProject
        })
    } catch (error) {
        console.error('Error creating project:', error);

        return res.status(500).json({
            message: 'Error creating project',
            error: error.message,
        });
    }
}
module.exports=createProject