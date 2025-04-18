import User from '../model/authModel.js'
import Course from '../model/courseModel.js'
import Package from '../model/packageModel.js'
import File from '../model/fileModel.js'


// get all courses by student id
export const getAllCoursesByStudentId = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await User.findById(studentId)
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        const courses = student.courses.map(course => course.courseId)
        const courseDetails = await Course.find({ _id: { $in: courses } })
        return res.status(200).json(courseDetails);
    }
    catch (error) {
        console.error('Error fetching courses:', error);
        return res.status(500).json({ message: error.message });
    }
}
// get files by course id
export const getFilesByCourseId = async (req, res) => {
    try {
        const { courseId } = req.params;
        const files = await File.find({
            courseId: courseId
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