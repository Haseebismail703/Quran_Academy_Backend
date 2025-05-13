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
    const currentDate = new Date();

    const packages = await Package.find({ studentId }).populate("courseId", "courseName");

    const updatedPackages = await Promise.all(
      packages.map(async (pkg) => {
        const startDate = new Date(pkg.monthStart);
        const endDate = new Date(pkg.monthEnd);
        const isExpired = endDate < currentDate;
        const isDefaultStartDate = startDate.getTime() === 0;

        // If package expired & completed -> mark as inCompleted
        if (isExpired && pkg.paymentStatus === 'completed' && !isDefaultStartDate) {
          pkg.paymentStatus = 'inCompleted';
          await pkg.save();
        }

        // Calculate days difference
        const diffInMs = endDate - currentDate;
        const daysDiff = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
        let daysStatus = "";

        if (pkg.paymentStatus === "completed") {
          if (daysDiff > 0) {
            daysStatus = `${daysDiff} days remaining until next payment`;
          } else if (daysDiff === 0) {
            daysStatus = `Today is the last day of your current package`;
          } else {
            daysStatus = `Package expired ${Math.abs(daysDiff)} days ago`;
          }
        } else if (pkg.paymentStatus === "inCompleted") {
          const overdueDays = Math.ceil((currentDate - endDate) / (1000 * 60 * 60 * 24));
          daysStatus = `${overdueDays} days passed since due date`;
        }

        // Pending Months & Fee Calculation (only for inCompleted)
        let pendingMonths = 0;
        let totalPendingFee = 0;

        if (pkg.paymentStatus === 'inCompleted' && !isDefaultStartDate) {
          const paidUntil = new Date(pkg.lastPaymentDate || pkg.monthStart);

          let yearDiff = currentDate.getFullYear() - paidUntil.getFullYear();
          let monthDiff = currentDate.getMonth() - paidUntil.getMonth();
          let months = yearDiff * 12 + monthDiff;

          if (currentDate.getDate() < paidUntil.getDate()) {
            months -= 1;
          }

          pendingMonths = Math.max(months, 0);
          totalPendingFee = pendingMonths * pkg.coursePrice;
        }

        return {
          ...pkg.toObject(),
          canPay: pkg.paymentStatus === "inCompleted",
          daysRemainingText: daysStatus,
          pendingMonths,
          totalPendingFee,
        };
      })
    );

    res.status(200).json(updatedPackages);
  } catch (err) {
    console.error("Error fetching package data:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// get payment history by student id
export let getPaymentHistory = async (req, res) => {
  const { studentId } = req.params;  // Extract studentId from route parameters
  
  try {
    // Find the student in the payments collection using studentId
    const paymentHistory = await Package.find({ studentId })
    .populate('courseId', 'courseName') 
      .sort({ paymentDate: -1 }); 
    
    // Check if payment history exists for the student
    if (!paymentHistory || paymentHistory.length === 0) {
      return res.status(404).json({ error: "No payment history found for this student" });
    }

    // Send the payment history as response
    res.status(200).json({
      message: "Payment history retrieved successfully",
      paymentHistory
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};


  
  

