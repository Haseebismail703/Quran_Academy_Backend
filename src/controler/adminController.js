import Course from '../model/courseModel.js'
import User from "../model/authModel.js";
import Class from '../model/classModel.js'


// create Course
export let createCourse = async (req, res) => {
  try {
    const { courseName, duration, theme } = req.body;
    const newCourse = new Course({
      courseName, duration, theme
    });
    await newCourse.save();
    res.status(200).json({ message: "Course created successfully", courseData: newCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
// get all Courses in admin panel
export let getAllCourses = async (req, res) => {
  try {
    const Courses = await Course.find()
    res.status(200).json({ Courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
// delete course 
export let deleteCourse = async (req, res) => {
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
// update course 
export let updateCourseDetails = async (req, res) => {
  const { courseId } = req.params;
  const { courseName, shift, theme } = req.body;

  try {
    // Fetch the course
    const existingCourse = await Course.findById(courseId);
    if (!existingCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Prepare update data
    const updatedData = {
      courseName: courseName || existingCourse.courseName,
      theme: theme || existingCourse.theme,
      shift: shift || existingCourse.shift,
    };

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(courseId, updatedData, { new: true });

    res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ error: "Failed to update course" });
  }
};
// Update classLink by student id and update 
export let UpdateClassLink = async (req, res) => {
  const { studentId } = req.params;
  const { classId, classLink } = req.body;

  try {
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find the class in student's classes array
    const classEntry = student.classes.find(
      cls => cls.classId?.toString() === classId
    );

    if (!classEntry) {
      return res.status(404).json({ message: "Class not found in student's record" });
    }

    // Update the classLink
    classEntry.classLink = classLink;
    await student.save();

    res.status(200).json({
      message: "Class link updated successfully",
      updatedClass: classEntry,
    });
  } catch (error) {
    console.error("Error updating class link:", error);
    res.status(500).json({ error: error.message });
  }
};
// create class
export let createClass = async (req, res) => {
  try {
    const { courseId, classTiming, teacherId, studentId, theme } = req.body;
    // check teacher id is valid 
    const teacher = await User.find({ _id: teacherId, role: 'teacher' });
    if (teacher.length === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    const newClass = new Class({
      courseId,
      classTiming,
      teacherId,
      studentId,
      theme
    });
    await newClass.save();
    res.status(200).json({ message: "Class created successfully", classData: newClass });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
// get all classes in admin page

export let getAllClasses = async (req, res) => {
  try {
    const classData = await Class.find()
      .populate('teacherId', 'firstName lastName email role profileUrl')
      .populate('courseId', 'courseName')
      .populate('students.studentId', 'firstName profileUrl gender');

    res.status(200).json({ classData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


export let addStudentToClass = async (req, res) => {
  const { classId, studentId, timing } = req.body;

  try {
    // 1. Check if the student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // 2. Ensure the user has a 'student' role
    if (student.role !== 'student') {
      return res.status(400).json({ error: "Only students are allowed to join classes" });
    }

    // 3. Check if the class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ error: "Class not found" });
    }
   // check time is alredy used 
    const isTimeSlotUsed = classData.students.some(
      (s) => s.studentTiming === timing
    );
    if (isTimeSlotUsed) {
      return res.status(400).json({ error: "Time slot is already used" });
    }
    
    // 4. Check if the student is already added to this class
    const isStudentAlreadyInClass = classData.students.some(
      (s) => s.studentId.toString() === student._id.toString()
    );
    if (isStudentAlreadyInClass) {
      return res.status(400).json({ error: "Student is already in the class" });
    }

    // 5. Find the 'waiting' entry in student.classes
    const waitingEntry = student.classes.find(
      (cls) => cls.status === 'waiting' && cls.classId === null
    );

    if (waitingEntry) {
      // Update the existing 'waiting' entry
      waitingEntry.classId = classId;
      waitingEntry.status = 'join';
      waitingEntry.timing = timing;
    } else {
      return res.status(400).json({ error: "No waiting status found to update" });
    }

    // Save updated student data
    await student.save();

    // 6. Add student to class
    classData.students.push({
      studentId: student._id,
      studentTiming: timing,
      addedAt: new Date()
    });
    await classData.save();

    res.status(200).json({
      message: "Student successfully added to class",
      class: classData
    });
  } catch (error) {
    console.error("Error adding student to class:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};
// remove the student from class


export const removeStudentFromClass = async (req, res) => {
  const { classId, studentId } = req.body;
  console.log(req.body)
  try {
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ error: "Class not found" });
    }

    const originalLength = classData.students.length;

    // Remove student by _id of the inner object
    classData.students = classData.students.filter(
      (student) => student.studentId.toString() !== studentId
    );
    if (classData.students.length === originalLength) {
      return res.status(404).json({ error: "Student record not found in class" });
    }
    // Update the student's classes array to remove the classId
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    const studentClassEntry = student.classes.find(
      (cls) => cls.classId.toString() === classId
    );
    if (studentClassEntry) {
      studentClassEntry.classId = null; 
      studentClassEntry.status = 'waiting'; 
      studentClassEntry.timing = '';
    } else {
      return res.status(404).json({ error: "Student not found in classes" });
    }
    // Save the updated student data
    await student.save();
    // Save the updated class data
    await classData.save();

    res.status(200).json({
      message: "Student successfully removed from class",
      updatedStudents: classData.students,
    });

  } catch (error) {
    console.error("Error removing student:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};
// get waiting student by course id 
export let getWaitingStudentCourseId = async (req, res) => {
  const { courseId } = req.params;

  if (!courseId) {
    return res.status(400).json({ message: "Course ID is required" });
  }

  try {
    // Get waiting students for the course
    const waitingStudents = await User.find({
      role: "student",
      classes: {
        $elemMatch: {
          courseId: courseId,
          status: "waiting"
        }
      }
    });

    // Get class by courseId (not _id)
    const getClass = await Class.findOne({ courseId });

    if (!getClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Define time slots
    const timeSlots = {
      "3 PM to 7 PM (Afternoon)": [
        "03:00 PM to 03:30 PM",
        "03:30 PM to 04:00 PM",
        "04:00 PM to 04:30 PM",
        "04:30 PM to 05:00 PM",
        "05:00 PM to 05:30 PM",
        "05:30 PM to 06:00 PM",
        "06:00 PM to 06:30 PM",
        "06:30 PM to 07:00 PM"
      ],
      "7 PM to 1 AM (Evening)": [
        "07:00 PM to 07:30 PM",
        "07:30 PM to 08:00 PM",
        "08:00 PM to 08:30 PM",
        "08:30 PM to 09:00 PM",
        "09:00 PM to 09:30 PM",
        "09:30 PM to 10:00 PM",
        "10:00 PM to 10:30 PM",
        "10:30 PM to 11:00 PM",
        "11:00 PM to 11:30 PM",
        "11:30 PM to 12:00 AM",
        "12:00 AM to 12:30 AM",
        "12:30 AM to 01:00 AM"
      ],
      "2 AM to 8 AM (Night)": [
        "02:00 AM to 02:30 AM",
        "02:30 AM to 03:00 AM",
        "03:00 AM to 03:30 AM",
        "03:30 AM to 04:00 AM",
        "04:00 AM to 04:30 AM",
        "04:30 AM to 05:00 AM",
        "05:00 AM to 05:30 AM",
        "05:30 AM to 06:00 AM",
        "06:00 AM to 06:30 AM",
        "06:30 AM to 07:00 AM",
        "07:00 AM to 07:30 AM",
        "07:30 AM to 08:00 AM"
      ]
    };

    // Get timing based on classTiming field
    const fullSlotList = timeSlots[getClass.classTiming] || [];
    // Get already used timings
    const usedTimings = getClass.students.map(std => std.studentTiming)

    // Remaining available time slots
    const remainingSlots = fullSlotList.filter(slot => !usedTimings.includes(slot));

    return res.status(200).json({
      message: "Waiting students and remaining time slots fetched successfully",
      waitingStudent: waitingStudents,
      remainingSlots: remainingSlots
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};

// get all class by  class id 
export const getClassWithStudents = async (req, res) => {
    const { classId } = req.params;

    try {
        const classData = await Class.findById(classId)
            .populate({
                path: 'courseId',
                select: 'courseName'
            })
            .populate({
                path: 'teacherId',
                select: 'firstName lastName email profilePicture' 
            })
            .populate({
                path: 'students.studentId',
                select: 'firstName lastName email gender profileUrl status' 
            });
           
        if (!classData) {
            return res.status(404).json({ message: "Class not found" });
        }


        res.status(200).json({
             classData
        });

    } catch (error) {
        console.error("Error in getClassWithStudents:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};
// update course deatil 
export let updateClass = async (req, res) => {
  const { classId } = req.params;
  const { courseId, teacherId, classTiming } = req.body;

  if (teacherId) {
    // check teacher id is valid 
    const teacher = await User.find({ _id: teacherId, role: 'teacher' });
    if (teacher.length === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }
  }
  try {
    const getClass = await Class.findById(classId);
    if (!getClass) {
      return res.status(404).json({ error: "Class not found" });
    }

    const updatedData = {
      courseId: courseId || getClass.courseId,
      teacherId: teacherId || getClass.teacherId,
      classTiming: classTiming || getClass.classTiming,
    };

    const classData = await Class.findByIdAndUpdate(classId, updatedData, { new: true });
    res.status(200).json({ message: "Class updated successfully", classData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update class" });
  }
};
// delete class
export let deleteClass = async (req, res) => {
  const { classId } = req.params;
  try {
    const classData = await Class.findByIdAndDelete(classId);
    if (!classData) {
      return res.status(404).json({ error: "Class not found" });
    }
    res.status(200).json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

// get all data waiting student  total student and total teacher 
export let getAllUserData = async (req, res) => {
  try {
    const waitingStudents = await User.countDocuments({ status: 'waiting', role: 'student' });
    const allStudent = await User.countDocuments({ role: 'student' });
    const allTeacher = await User.countDocuments({ role: 'teacher' });
    res.status(200).json({ waitingStudents, allStudent, allTeacher });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch waiting students" });
  }
}

// get all taecher 
export let getAllTeacher = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' });
    res.status(200).json({ teachers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch teachers" });
  }
}

// get course and waiting student 
export let getCourseAndWaitingStudent = async (req, res) => {
  try {
    const courses = await Course.find();
    const waitingStudents = await User.find(
     { role : 'student',
      classes: {
        $elemMatch: {
          status: 'waiting'
        }
      }}
    );
    res.status(200).json({ courses, waitingStudents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch courses and waiting students" });
  }
}