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
  const { courseName, shift,theme } = req.body;

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
    const { courseId, classTiming, teacherId, studentId,theme } = req.body;
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
      .populate('teacherId', 'firstName lastName email role')
      .populate('courseId', 'courseName')
      .populate('studentId', 'firstName , profileUrl , gender')
    res.status(200).json({ classData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

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

    // 4. Check if the student is already added to this class
    if (classData.studentId.includes(student._id)) {
      return res.status(400).json({ error: "Student is already in the class" });
    }

    // ✅ 5. Find the entry with status 'waiting' (classId is null)
    const waitingEntry = student.classes.find(
      (cls) => cls.status === 'waiting' && !cls.classId
    );

    if (waitingEntry) {
      // Update the existing 'waiting' entry
      waitingEntry.classId = classId;
      waitingEntry.status = 'join';
      waitingEntry.timing = timing;
    } else {
      // if status not 'waiting' 
      return res.status(400).json({ error: "No waiting status found to update" });
    }

    // Save updated student data
    await student.save();

    // 6. Add student to class
    classData.studentId.push(student._id);
    await classData.save();

    res.status(200).json({ message: "Student successfully added to class", class: classData });
  } catch (error) {
    console.error("Error adding student to class:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

export let removeStudentFromClass = async (req, res) => {
  const { classId, studentId } = req.body;

  try {
    // 1. Find the class (no need to populate)
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ error: "Class not found" });
    }

    // 2. Check if student is in class (using ObjectId.equals)
    const isStudentInClass = classData.studentId.some(
      (id) => id.equals(studentId)
    );

    if (!isStudentInClass) {
      return res.status(400).json({ error: "Student not in class" });
    }

    // 3. Remove student from the class
    classData.studentId = classData.studentId.filter(
      (id) => !id.equals(studentId)
    );
    await classData.save();

    // 4. Update student's class entry
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const classEntry = student.classes.find(
      (cls) => cls.classId?.toString() === classId
    );

    if (!classEntry) {
      return res.status(400).json({ error: "Class not found in student's record" });
    }

    classEntry.status = 'waiting';
    classEntry.classId = null;
    classEntry.timing = null; // optional

    await student.save();

    res.status(200).json({
      message: "Student successfully removed from class",
      class: {
        _id: classData._id,
        title: classData.title,
        students: classData.studentId,
      }
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
    return res.status(404).json({ message: "Course not found" });
  }

  try {
    const students = await User.find({
      role: "student",
      classes: {
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
