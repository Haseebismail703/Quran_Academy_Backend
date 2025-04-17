import Pdf from "../model/pdfModel.js";
import cloudinary from "../confiq/cloudinary.js";
import streamifier from "streamifier";
import Course from '../model/courseModel.js'
import User from "../model/authModel.js";
let addPdf = async (req, res) => {
  try {
    const { title } = req.body;
    const file = req.file;

    if (!file || !file.mimetype.includes('pdf')) {
      return res.status(400).json({ error: 'Only PDF files allowed' });
    }

    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'raw', folder: 'pdfs' },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };

    const result = await streamUpload(file.buffer);
    console.log(result);
    const pdf = new Pdf({
      title,
      url: result.secure_url,
      publicId: result.public_id,
    });

    await pdf.save();

    res.status(200).json({ message: 'PDF uploaded', data: pdf });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upload failed' });
  }
}

// create Course
let createCourse = async (req, res) => {
  try {
    const { courseName,shift ,teacherId, studentId, classLink } = req.body;
    // check teacher id is valid 
    const teacher = await User.find({_id : teacherId, role : 'teacher'});
    if (teacher.length === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    const newCourse = new Course({
      courseName,
      shift,
      teacherId,
      studentId,
      classLink,
    });
    await newCourse.save();
    res.status(200).json({ message: "Course created successfully", classData: newCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
// get all Courses in admin panel
let getAllCourses = async (req, res) => {
  try {
    const Courses = await Course.find()
    .populate('teacherId', 'firstName lastName email role')
    res.status(200).json({ Courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
// add student in Courses
let addStudentToCourse = async (req, res) => {
  const { courseId, studentId,timing } = req.body;
  try {
    // Check if the student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
   // check the role of student
    if (student.role !== 'student') {
      return res.status(400).json({ error: "only student allow" });
    }
    // check if Courses not exist 
    const courseData = await Course.findById(courseId);
    if (!courseData) {
      return res.status(404).json({ error: "Course not found" });
    }
    // Check if the student is already in the Courses
    if (courseData.studentId.includes(studentId)) {
      return res.status(400).json({ error: "Student already in course" });
    }

    // Add student to the Courses
    courseData.studentId.push(studentId);
    await courseData.save();

    // Update the student's status to 'join'
    let courseExist = student.courses.find((course) => course.courseId.toString() === courseId);
    if (!courseExist) {
    return res.status(400).json({ error: "Course not found in student data" });
    }
    courseExist.status = 'join';
    courseExist.timing = timing ;
    await student.save();

    res.status(200).json({ message: "Student added to Course", courseData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
// remove student from course
let removeStudentFromCourse = async (req, res) => {
  const { courseId, studentId } = req.body;
  try {
    const courseData = await Course.findById(courseId);
    if (!courseData) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Check if the student is in the course
    if (!courseData.studentId.includes(studentId)) {
      return res.status(400).json({ error: "Student not in course" });
    }

    // Remove student from the course
    courseData.studentId = courseData.studentId.filter(id => id.toString() !== studentId);
    await courseData.save();

    // update the status of student to 'waiting'
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    let courseExist = student.courses.find((course) => course.courseId.toString() === courseId);
    if (!courseExist) {
      return res.status(400).json({ error: "Course not found in student data" });
    }
    courseExist.status = 'waiting';
    await student.save();
    res.status(200).json({ message: "Student removed from course", courseData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
// get student by course id package name 
let getStudentByCourseId = async (req, res) => {
  const { courseId } = req.params;

  if (!courseId) {
    return res.status(400).json({ message: "Invalid courseId" });
  }

  try {
    const students = await User.find({
      role: "student",
      courses: {
        $elemMatch: {
          courseId: courseId,
          status: "waiting"
        }
      }
    })

    res.status(200).json({
      message: "Waiting students fetched successfully",
      data: students
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
}
// Update classLink by student id and update
let UpdateClassLink = async (req, res) => {
  const { studentId } = req.params;
  const { classLink } = req.body;
  try {
    const courseData = await User.findByIdAndUpdate(studentId, { classLink }, { new: true });
    if (!courseData) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.status(200).json({ message: "Class link update successfully", courseData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
// update course deatil 
let updateCourse = async (req, res) => {
  const { courseId } = req.params;
  const { courseName, teacherId, shift } = req.body;

  if(teacherId){
    // check teacher id is valid 
    const teacher = await User.find({_id : teacherId, role : 'teacher'});
    if (teacher.length === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }
  }
  try {
    const getCourse = await Course.findById(courseId);
    if (!getCourse) {
      return res.status(404).json({ error: "Class not found" });
    }

    const updatedData = {
      courseName: courseName || getCourse.courseName,
      teacherId: teacherId || getCourse.teacherId,
      shift: shift || getCourse.shift,
    };

    const classData = await Course.findByIdAndUpdate(courseId, updatedData, { new: true });
    res.status(200).json({ message: "Class updated successfully", classData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update class" });
  }
};
// delete course by id
let deleteCourse = async (req, res) => {
  const { courseId } = req.params;
  try {
    const courseData = await Course.findByIdAndDelete(courseId);
    if (!courseData) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
// get all data waiting student  total student and total teacher 
let getAllUserData = async (req, res) => {
  try {
    const waitingStudents = await User.countDocuments({ status: 'waiting' , role : 'student' });
    const allStudent = await User.countDocuments({ role: 'student' });
    const allTeacher = await User.countDocuments({ role: 'teacher' });
    res.status(200).json({ waitingStudents, allStudent, allTeacher });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch waiting students" });
  }
}
// get all taecher 
let getAllTeacher = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' });
    res.status(200).json({ teachers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch teachers" });
  }
}


export {
  addPdf,
  createCourse,
  getAllCourses,
  addStudentToCourse,
  removeStudentFromCourse,
  getStudentByCourseId,
  getAllUserData,
  UpdateClassLink,
  updateCourse,
  deleteCourse
};