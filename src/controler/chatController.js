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
   
// Get teachers and admins for student chat with unread counts
// let getTeacherInTheChat = async (req, res) => {
//     const { studentId } = req.params;

//     try {
//         // 1. Find all classes where the student is enrolled and populate teacher info
//         const classes = await Class.find({ 
//             'students.studentId': studentId,
//             'status': 'join'
//         })
//         .populate({
//             path: 'teacherId',
//             select: 'firstName lastName email gender role profileUrl'
//         })
//         .exec();

//         // 2. Get all admin users
//         const admins = await User.find({ role: 'admin' })
//             .select('firstName lastName email gender role profileUrl')
//             .exec();

//         // 3. Extract unique teachers from classes
//         const teacherMap = new Map();
//         classes.forEach(classItem => {
//             if (classItem.teacherId && !teacherMap.has(classItem.teacherId._id.toString())) {
//                 teacherMap.set(classItem.teacherId._id.toString(), classItem.teacherId);
//             }
//         });
//         const teachers = Array.from(teacherMap.values());

//         // 4. Combine teachers and admins
//         const allUsersToChat = [...teachers, ...admins];

//         if (allUsersToChat.length === 0) {
//             return res.status(404).json({ message: 'No teachers or admins found for this student' });
//         }

//         // 5. Fetch unread messages count for each user
//         const usersWithUnreadMessages = await Promise.all(
//             allUsersToChat.map(async (user) => {
//                 const unreadMessagesCount = await Message.countDocuments({
//                     sender: user._id,
//                     receiver: studentId,
//                     read: false,
//                     content: { $ne: "Message Deleted" } // Exclude deleted messages
//                 });

//                 return {
//                     ...user.toObject(),
//                     unreadMessages: unreadMessagesCount
//                 };
//             })
//         );

//         res.status(200).json({ users: usersWithUnreadMessages });

//     } catch (error) {
//         console.error('Error fetching chat users:', error);
//         res.status(500).json({ 
//             message: 'Server error', 
//             error: error.message 
//         });
//     }
// };



// get student in the teacher chat 
const getStudentsInChat = async (req, res) => {
    const { teacherId } = req.params;

    try {
        // 1. Find all classes where the teacherId matches and populate students
        const classes = await Class.find({ teacherId })
            .populate({
                path: 'students.studentId',
                select: 'firstName lastName email gender role profileUrl'
            })
            .exec();

        // 2. Get all admin users
        const admins = await User.find({ role: 'admin' })
            .select('firstName lastName email gender role profileUrl')
            .exec();

        // 3. Get the teacher user document
        const teacherUser = await User.findById(teacherId)
            .select('firstName lastName email gender role profileUrl')
            .exec();

        // 4. Extract unique students from class collection
        const studentMap = new Map();
        classes.forEach(classItem => {
            classItem.students.forEach(student => {
                const studentObj = student.studentId;
                if (studentObj && !studentMap.has(studentObj._id.toString())) {
                    studentMap.set(studentObj._id.toString(), studentObj);
                }
            });
        });

        // 5. Also find users whose embedded `classes.teacherId` matches the teacherId
        const embeddedStudents = await User.find({ 'classes.teacherId': teacherId })
            .select('firstName lastName email gender role profileUrl')
            .exec();

        embeddedStudents.forEach(student => {
            if (!studentMap.has(student._id.toString())) {
                studentMap.set(student._id.toString(), student);
            }
        });

        // 6. Combine all users: students (unique), admins, teacher
        const students = Array.from(studentMap.values());
        let allUsers = [...students, ...admins];
        if (teacherUser) allUsers.push(teacherUser);

        if (allUsers.length === 0) {
            return res.status(404).json({ message: 'No users found for chat' });
        }

        // 7. Fetch unread messages for each user
        const usersWithUnread = await Promise.all(
            allUsers.map(async (user) => {
                const unreadMessagesCount = await Message.countDocuments({
                    sender: user._id,
                    receiver: teacherId,
                    read: false,
                    content: { $ne: "Message Deleted" }
                });

                return {
                    ...user.toObject(),
                    unreadMessages: unreadMessagesCount
                };
            })
        );

        res.status(200).json({ users: usersWithUnread });

    } catch (error) {
        console.error('Error fetching chat users:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// get all teacher in student chat
const getTeacherInTheChat = async (req, res) => {
    const { studentId } = req.params;

    try {
        // Step 1: Get student with populated teacher info
        const student = await User.findById(studentId).populate({
            path: 'classes.teacherId',
            select: 'firstName lastName email profileUrl role',
            match: { role: 'teacher' }
        });

        if (!student || !student.classes) {
            return res.status(404).json({ success: false, message: 'No teachers found' });
        }

        // Step 2: Get all teachers from student classes
        const teachers = student.classes
            .filter(c => c.teacherId)
            .map(c => c.teacherId);

        // Step 3: Add unread message count to each teacher
        const teacherWithUnread = await Promise.all(
            teachers.map(async teacher => {
                const count = await Message.countDocuments({
                    sender: teacher._id,
                    receiver: studentId,
                    read: false
                });

                return {
                    ...teacher.toObject(),
                    unreadMessages: count
                };
            })
        );

        // Step 4: Get all admins
        const admins = await User.find({ role: 'admin' });

        // Step 5: Add unread message count to each admin
        const adminWithUnread = await Promise.all(
            admins.map(async admin => {
                const count = await Message.countDocuments({
                    sender: admin._id,
                    receiver: studentId,
                    read: false
                });

                return {
                    ...admin.toObject(),
                    unreadMessages: count
                };
            })
        );

        // ✅ Step 6: Add student itself
        const studentWithMeta = {
            ...student.toObject(),
            unreadMessages: 0 // or calculate if you want reverse (teacher/admin to student)
        };

        // ✅ Step 7: Merge all into one array
        const allUsers = [studentWithMeta, ...teacherWithUnread, ...adminWithUnread];

        res.status(200).json({
            success: true,
            users: allUsers
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
// get all user in admin chat
const adminAllUserInchat = async (req, res) => {
  try {
    const { adminId } = req.params;

    // Find all distinct user IDs jinhone admin ko message bheja ya jinko admin ne message bheja
    const senderIds = await Message.distinct("sender", { receiver: adminId });
    const receiverIds = await Message.distinct("receiver", { sender: adminId });

    // Merge and remove duplicates
    const allChatUserIds = [...new Set([...senderIds, ...receiverIds])].filter(id => id !== adminId);

    // Get user info
    const allUsers = await User.find({ _id: { $in: allChatUserIds } });

    const users = await Promise.all(
      allUsers.map(async (user) => {
        const unreadMessages = await Message.countDocuments({
          sender: user._id,
          receiver: adminId,
          read: false,
        });

        return {
          _id: user._id,
          firstName: user.firstName,
          email: user.email,
          role: user.role,
          unreadMessages,
        };
      })
    );

    res.status(200).json({ users });
  } catch (err) {
    console.error("Error fetching users with unread count:", err);
    res.status(500).json({ error: "Server error" });
  }
};









export {allUser,message,getMessage,getTeacherInTheChat,getStudentsInChat ,adminAllUserInchat};
