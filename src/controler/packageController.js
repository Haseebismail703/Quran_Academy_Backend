import Package from "../model/packageModel.js";
import User from "../model/authModel.js";
import Course from '../model/courseModel.js'
import cloudinary from "../confiq/cloudinary.js";


// create a new package
const createPackage = async (req, res) => {
  console.log("create package", req.body)
  try {
    const { packageName, coursePrice, classPerMonth, classPerWeek, classType, sessionDuration, studentId, courseId } = req.body;
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
      packageName,
      coursePrice,
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
// buy a package 
const buyPackage = async (req, res) => {
  const { studentId, courseId } = req.body;

  try {
    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get current date
    const currentDate = new Date();

    // Start Date (formatted)
    const startDate = currentDate.toISOString().split("T")[0];

    // Add 1 month for end date
    const endDateObj = new Date(currentDate);
    endDateObj.setMonth(endDateObj.getMonth() + 1);

    // Handle edge cases (e.g. adding 1 month to Jan 31 results in March 2)
    if (endDateObj.getDate() !== currentDate.getDate()) {
      endDateObj.setDate(0); // Set to last day of previous month
    }

    const endDate = endDateObj.toISOString().split("T")[0]; // Format: YYYY-MM-DD

    // Check if already joined
    const alreadyJoined = student.classes.find(
      (cls) => cls.courseId.toString() === courseId && cls.status === 'join'
    );

    if (!alreadyJoined) {
      // Push course with waiting status
      student.classes.push({
        teacherId: null,
        courseId,
        status: 'waiting',
      });
    }

    // Update package with correct start & end dates
    if (alreadyJoined) {
      const packages = await Package.findOneAndUpdate(
        { studentId, courseId },
        {
          monthStart: startDate,
          monthEnd: endDate,
          paymentStatus: 'completed'
        },
        { new: true }
      );

      if (!packages) {
        return res.status(404).json({ message: "Package not found" });
      }

    } else {
      const packages = await Package.findOneAndUpdate(
        { studentId, courseId },
        {
          paymentStatus: 'completed'
        },
        { new: true }
      );

      if (!packages) {
        return res.status(404).json({ message: "Package not found" });
      }
    }

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
// delete package by id
let deletePackage = async (req, res) => {
  const { packageId } = req.params;
  try {
    const packages = await Package.findByIdAndDelete(packageId);
    if (!packages) {
      return res.status(404).json({ message: "Package not found" });
    }
    res.status(200).json({ message: "Package deleted successfully", data: packages });
  }
  catch (error) {
    res.status(500).json({ message: "Error deleting package", error: error.message });
  }
}




export { createPackage, getAllPackages, buyPackage, deletePackage };