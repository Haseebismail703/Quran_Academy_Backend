import User from '../model/authModel.js'
import Course from '../model/courseModel.js'
import Package from '../model/packageModel.js'
import File from '../model/fileModel.js'
import Class from '../model/classModel.js'

// get all class by student id 
export const getAllClassesByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    const classes = await Class.find({ 
      students: { 
        $elemMatch: { studentId } 
      } 
    })
    .select('courseId teacherId students')
    .populate('courseId', 'courseName') // populate only courseName from course
    .populate('teacherId', 'firstName gender profileUrl'); // populate teacher info
    
    if (!classes.length) {
      return res.status(404).json({ message: "No classes found for this student" });
    }

    res.status(200).json(classes);
  } catch (error) {
    console.error("Error fetching classes by student ID:", error);
    res.status(500).json({ message: error.message });
  }
};

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
  
      const payments = await Package.find({ studentId })
        .populate("courseId", "courseName");
  
      const currentDate = new Date();
  
      const updatedPayments = payments.map((payment) => {
        const endDate = new Date(payment.monthEnd);
        const isMonthEnded = endDate < currentDate;
  
        // Calculate days difference
        const diffInMs = endDate - currentDate;
        const days = Math.ceil(diffInMs / (1000 * 60 * 60 * 24)); // Total days (may be negative)
  
        let daysStatus;
        if (days > 0) {
          daysStatus = `${days} din baqi hain`;
        } else if (days === 0) {
          daysStatus = `Aaj last din hai`;
        } else {
          daysStatus = `${Math.abs(days)} din guzr chuke hain`;
        }
  
        return {
          ...payment.toObject(),
          canPay:
            payment.paymentStatus === "inCompleted" ||
            (isMonthEnded && payment.paymentStatus === "inCompleted"),
          daysRemainingText: daysStatus,
          daysRemaining: days // can be positive or negative
        };
      });
  
      res.status(200).json(updatedPayments);
    } catch (err) {
      console.error("Error fetching payments:", err);
      res.status(500).json({ message: "Server Error" });
    }
  };
  
  

