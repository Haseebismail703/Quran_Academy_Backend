import Package from "../model/packageModel.js";
import User from "../model/authModel.js";
import Course from '../model/courseModel.js'
// create a new package
const createPackage = async (req, res) => {
    try {
        const { courseName, coursePrice, courseDuration, classPerMonth, classPerWeek, classType, sessionDuration, studentId, courseId } = req.body;
        // check student id is valid
        const user = await User.findById(studentId);
        if (!user) {
            return res.status(404).json({ message: "Student not found" });
        }
        // check the courseId is valid
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "course not found" });
        }
        const newPackage = new Package({
            courseName,
            coursePrice,
            courseDuration,
            classPerMonth,
            classPerWeek,
            classType,
            sessionDuration,
            studentId,
            courseId
        });
        await newPackage.save();
        res.status(200).json({ message: "Package created successfully", data: newPackage });
    } catch (error) {
        res.status(500).json({ message: "Error creating package", error: error.message });
    }
};
// get all packages
const getAllPackages = async (req, res) => {
    try {
        const packages = await Package.find().populate("studentId", "name email role status gender").sort({ createdAt: -1 })
            .populate("courseId", "courseName")
        res.status(200).json({ message: "Packages retrieved successfully", data: packages });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving packages", error: error.message });
    }
};
// get package by student id 
let getPackageByStudentId = async (req, res) => {
    try {
        const { studentId } = req.params;
        const packages = await Package.find({ studentId }).populate("studentId", "name email role status gender")
            .populate("courseId", "courseName")
        if (packages.length === 0) {
            return res.status(404).json({ message: "No packages found for this student" });
        }
        // check the role of the student
        if (packages[0].studentId.role !== "student") {
            return res.status(403).json({ message: "You are not authorized to access this package" });
        }

        res.status(200).json({ message: "Packages retrieved successfully", data: packages });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving packages", error: error.message });
    }
};
// buy a package 
const buyPackage = async (req, res) => {
    const { studentId, courseId } = req.body;
  
    try {
      const student = await User.findById(studentId);
  
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      // check cource id alredy exist 
        const courseExist = student.courses.find((course) => course.courseId.toString() === courseId);
        if (courseExist) {
            return res.status(400).json({ message: "Course already exists" });
        }
      // Push the course with teacherId and courseId
      student.courses.push({
        teacherId : null,
        courseId,
        status: 'waiting' 
      });
  
      await student.save();
  
      res.status(200).json({
        message: "Course added successfully",
        data: student
      });
    } catch (error) {
      res.status(500).json({
        message: "Something went wrong",
        error: error.message
      });
    }
  };
export { createPackage, getAllPackages, getPackageByStudentId, buyPackage };