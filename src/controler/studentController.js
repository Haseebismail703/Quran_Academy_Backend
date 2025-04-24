import User from '../model/authModel.js'
import Course from '../model/courseModel.js'
import Package from '../model/packageModel.js'
import File from '../model/fileModel.js'
import Class from '../model/classModel.js'

// get all class by student id 
export const getAllClassesByStudentId = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await User.findById(studentId)
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        const classes = student.classes.map(cls => cls.classId)
        const classDetails = await Class.find({ _id: { $in: classes } })
        return res.status(200).json(classDetails);
    }
    catch (error) {
        console.error('Error fetching class:', error);
        return res.status(500).json({ message: error.message });
    }
}
// get files by class id
export const getFilesByClassId = async (req, res) => {
    try {
        const { classId } = req.params;
        const files = await File.find({
            classId: classId
        })
        if (!files) {
            return res.status(404).json({ message: 'Files not found' });
        }
        return res.status(200).json(files);
    }
    catch (error) {
        console.error('Error fetching files:', error);
        return res.status(500).json({ message: error.message });
    }
}
// get package by student id 
export const getPackageByStudentId = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await User.findById(studentId)
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        const packages = await Package.find({ studentId: studentId })
        if (!packages) {
            return res.status(404).json({ message: 'Packages not found' });
        }
        return res.status(200).json(packages);
    }
    catch (error) {
        console.error('Error fetching packages:', error);
        return res.status(500).json({ message: error.message });
    }
}

