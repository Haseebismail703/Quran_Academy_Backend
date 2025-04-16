import Pdf from "../model/pdfModel.js";
import cloudinary from "../confiq/cloudinary.js";
import streamifier from "streamifier";
import Class from '../model/classModel.js'
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

// create Classs
let createClass = async (req, res) => {
  try {
    const { className, teacherId, studentId, classLink, packageId } = req.body;
    const newClass = new Class({
      className,
      teacherId,
      studentId,
      classLink,
      packageId
    });
    await newClass.save();
    res.status(200).json({ message: "Class created successfully", classData: newClass });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create class" });
  }
}
// get all classes in admin panel
let getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
    .populate('teacherId', 'firstName lastName email role')
    .populate('packageId', 'packageName')
    res.status(200).json({ classes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch classes" });
  }
}
// add student in class 
let addStudentToClass = async (req, res) => {
  const { classId, studentId } = req.body;
  try {

    // Check if the student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // check if student status join 
    if (student.status === 'join') {
      return res.status(400).json({ error: "Student already in class" });
    }
    // check if class not exist 
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ error: "Class not found" });
    }
    // Check if the student is already in the class
    if (classData.studentId.includes(studentId)) {
      return res.status(400).json({ error: "Student already in class" });
    }

    // Add student to the class
    classData.studentId.push(studentId);
    await classData.save();

    // Update the student's status to 'join'
    student.status = 'join';
    await student.save();

    res.status(200).json({ message: "Student added to class", classData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add student to class" });
  }
}
// remove student from class
let removeStudentFromClass = async (req, res) => {
  const { classId, studentId } = req.body;
  try {
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ error: "Class not found" });
    }

    // Check if the student is in the class
    if (!classData.studentId.includes(studentId)) {
      return res.status(400).json({ error: "Student not in class" });
    }

    // Remove student from the class
    classData.studentId = classData.studentId.filter(id => id.toString() !== studentId);
    await classData.save();

    // update the status of student to 'waiting'
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    student.status = 'waiting';
    await student.save();
    res.status(200).json({ message: "Student removed from class", classData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to remove student from class" });
  }
}
// get student by class id package name 
let getStudentByClassId = async (req, res) => {
  const { classId } = req.params;
  try {
    const classData = await Class.findById(classId)
      .populate({
        path: 'studentId',
        select: 'firstName lastName email role packageId status',
        populate: {
          path: 'packageId',
          select: 'packageName'
        }
      })
      .populate('packageId', 'packageName');
    if (!classData) {
      return res.status(404).json({ error: "Class not found" });
    }
    // filter by student package 
    let students = classData.studentId.filter((student) => {
      return student.packageId && student.packageId.packageName === classData.packageId.packageName && student.status === 'waiting' && student.role === 'student';
    })
    res.status(200).json({ students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
}
// Update classLink by class id and update
let UpdateClassLink = async (req, res) => {
  const { classId } = req.params;
  const { classLink } = req.body;
  try {
    const classData = await Class.findByIdAndUpdate(classId, { classLink }, { new: true });
    if (!classData) {
      return res.status(404).json({ error: "Class not found" });
    }
    res.status(200).json({ message: "Class updated successfully", classData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update class" });
  }
}
// update class deatil 
let updateClassDetail = async (req, res) => {
  const { classId } = req.params;
  const { className, teacherId, packageId } = req.body;
  try {
    const getClass = await Class.findById(classId);
    if (!getClass) {
      return res.status(404).json({ error: "Class not found" });
    }

    const updatedData = {
      className: className || getClass.className,
      teacherId: teacherId || getClass.teacherId,
      packageId: packageId || getClass.packageId,
    };

    const classData = await Class.findByIdAndUpdate(classId, updatedData, { new: true });
    res.status(200).json({ message: "Class updated successfully", classData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update class" });
  }
};
// delete class by id
let deleteClass = async (req, res) => {
  const { classId } = req.params;
  try {
    const classData = await Class.findByIdAndDelete(classId);
    if (!classData) {
      return res.status(404).json({ error: "Class not found" });
    }
    res.status(200).json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete class" });
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
  createClass,
  getAllClasses,
  addStudentToClass,
  removeStudentFromClass,
  getStudentByClassId,
  getAllUserData,
  UpdateClassLink,
  updateClassDetail,
  deleteClass
};