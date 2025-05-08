import User from "../model/authModel.js";
import Message from '../model/chatModel.js'
import { configDotenv } from 'dotenv'
import Class from "../model/classModel.js";
configDotenv()

let allUser =  async(req,res) =>{ 
        try {
            const users = await User.find({});
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: "Server error" });
        }
   
}

let message = async(req,res) =>{
    const { senderId, receiverId, content } = req.body;
    // console.log(req.body)
    try {
        const message = await  new Message({ sender: senderId, receiver: receiverId, content });
        res.status(200).json({ message: "Message sent", message });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}

let getMessage = async (req, res) => {
    const { senderId, receiverId } = req.params;
  
    try {
      const messages = await Message.find({
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId },
        ],
      }).sort({ timestamp: 1 });
  
      // Count unread messages sent by `receiverId` to `senderId`
      const unreadCount = await Message.countDocuments({
        sender: receiverId,
        receiver: senderId,
        read: false
      });
  
      res.status(200).json({ messages, unreadCount });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  };
   
// get Teacher in the student chat
let getTeacherInTheChat = async (req, res) => {
    const { studentId } = req.params;

    try {
        // Find the student by ID and populate teacher information from classes
        const student = await User.findById(studentId)
            .populate({
                path: 'classes',
                match: { 'status': 'join' },  // Only include joined classes
                select: 'teacherId', // Only return teacherId from classes
                populate: {
                    path: 'teacherId',  // Populate teacher details from teacherId
                    select: 'firstName lastName email gender role profileUrl' // Teacher info
                }
            })
            .exec();

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Extract teachers from the classes array
        const teachers = student.classes
            .filter(classItem => classItem.teacherId) // Filter out classes without a teacher
            .map(classItem => classItem.teacherId); // Get the teacher info

        if (teachers.length === 0) {
            return res.status(404).json({ message: 'No teachers found for this student' });
        }

        // Get the unread message count for each teacher
        const teacherWithUnreadMessages = [];

        for (let teacher of teachers) {
            // Count unread messages where this teacher is the receiver and the student is the sender
            const unreadMessagesCount = await Message.countDocuments({
                sender: studentId, // The student's ID is the sender
                receiver: teacher._id, // The teacher's ID is the receiver
                read: false // Only count unread messages
            });

            teacherWithUnreadMessages.push({
                ...teacher.toObject(), // Convert Mongoose document to plain object
                unreadMessages: unreadMessagesCount // Add the unread message count
            });
        }

        // Send teacher details along with unread messages count
        res.status(200).json({ teachers: teacherWithUnreadMessages });

    } catch (error) {
        console.error('Error fetching teachers or unread messages:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// get student in the teacher chat 
let getStudentsInChat = async (req, res) => {
    const { teacherId } = req.params;

    try {
        // Find all classes where the teacherId matches
        const classes = await Class.find({ teacherId })
            .populate({
                path: 'students.studentId',
                select: 'firstName lastName email gender role profileUrl'
            })
            .exec();

        if (classes.length === 0) {
            return res.status(404).json({ message: 'No classes found for this teacher' });
        }

        // Extract and flatten all students
        const students = classes.flatMap(classItem =>
            classItem.students.map(student => student.studentId)
        );

        if (students.length === 0) {
            return res.status(404).json({ message: 'No students found in the teacher\'s classes' });
        }

        // Fetch unread messages count for each student
        const studentsWithUnread = [];

        for (const student of students) {
            const unreadMessagesCount = await Message.countDocuments({
                sender: student._id,
                receiver: teacherId,
                read: false
            });

            studentsWithUnread.push({
                ...student.toObject(),
                unreadMessages: unreadMessagesCount
            });
        }

        res.status(200).json({ students: studentsWithUnread });

    } catch (error) {
        console.error('Error fetching students for teacher:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};






export {allUser,message,getMessage,getTeacherInTheChat,getStudentsInChat };
