import User from '../model/authModel.js'
import Course from '../model/courseModel.js'
import Package from '../model/packageModel.js'
import File from '../model/fileModel.js'
import cloudinary from '../confiq/cloudinary.js'
import streamifier from 'streamifier';
import Class from '../model/classModel.js'
// get Class by teacher id
export const getClassByTeacherId = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const classData = await Class.find({ teacherId: teacherId }).populate('teacherId', 'firstName lastName email')
            .populate('students.studentId', 'firstName lastName email')
            .populate('courseId', 'courseName')
        if (!classData) {
            return res.status(404).json({ message: "No class found for this teacher" });
        }
        return res.status(200).json(classData);
    } catch (error) {
        console.error("Error fetching class by teacher ID:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
// get all student by class id
export const getJoinStudentByClassId = async (req, res) => {
    const { classId } = req.params;
    try {
        const students = await Class.findById(classId)
            .populate({
                path: 'students.studentId',
                select: 'firstName email gender profileUrl'
            })
            .populate('courseId', 'courseName')
            .select('students classTiming courseId')
        res.status(200).json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}
// add File
export const addFile = async (req, res) => {
    // console.log("Uploaded File: ", req.body);

    try {
        const { title, type, classId } = req.body;
        const file = req.file;
        //  console.log("File: ", file);
        if (!file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        if (type === 'pdf' && !file.mimetype.includes('pdf')) {
            return res.status(400).json({ error: 'Only PDF files allowed for type pdf' });
        }

        if (type === 'image' && !file.mimetype.includes('image')) {
            return res.status(400).json({ error: 'Only image files allowed for type image' });
        }

        // Function to upload file buffer to Cloudinary
        const streamUpload = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: type === 'pdf' ? 'raw' : 'image',
                        folder: type === 'pdf' ? 'pdfs' : 'images',
                    },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );

                streamifier.createReadStream(fileBuffer).pipe(stream);
            });
        };

        const result = await streamUpload(file.buffer);

        const fileData = new File({
            title,
            type,
            classId: classId,
            url: result.secure_url,
            publicId: result.public_id,
            type,
        });

        await fileData.save();

        res.status(200).json({ message: `${type.toUpperCase()} uploaded successfully`, data: fileData });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ error: 'Upload failed' });
    }
};
// get all files by class id
export const getFilesByClassId = async (req, res) => {
    const { classId } = req.params;
    try {
        const files = await File.find({
            classId: classId
        })
            .populate({
                'path': 'classId',
                select: 'classTiming',
                populate: {
                    path: 'courseId',
                    select: 'courseName'
                }
            })
        if (!files) {
            return res.status(404).json({ message: "No files found for this class" });
        }
        return res.status(200).json(files);
    }
    catch (error) {
        console.error("Error fetching files by class ID:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// delete the file using publick id and file id
export const deleteFile = async (req, res) => {
    const { fileId } = req.params;
    try {
        const file = await File
            .findById(fileId);
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }
        // Delete from Cloudinary
        await cloudinary.uploader.destroy(file.publicId, { resource_type: file.type === 'pdf' ? 'raw' : 'image' });
        // Delete from MongoDB
        await File.findByIdAndDelete
            (fileId);

        return res.status(200).json({ message: "File deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting file:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// get all files by class id and student id 
export const getFilesByClassIdAndStudentId = async (req, res) => {
    const { classId, studentId } = req.params;

    try {
        let getClass = await Course.findById(classId)
        if (!getClass) {
            return res.status(404).json({ message: "Class not found" });
        }
        if (getClass.studentId.toString() !== studentId) {
            return res.status(403).json({ message: "You are not enrolled in this class" });
        }
        const files = await File.find({
            classId: classId,
            studentId: studentId
        });
        if (!files) {
            return res.status(404).json({ message: "No files found for this class" });
        }
        return res.status(200).json(files);
    }
    catch (error) {
        console.error("Error fetching files by class ID:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// addd class link using student id
export const addClassLinkToStudent = async (req, res) => {
    const { classLink } = req.body;
    const { studentId } = req.params
    try {
        const updatedClass = await Class.findOneAndUpdate(
            { 'students.studentId': studentId },
            { $set: { 'students.$.classLink': classLink } },
            { new: true }
        ).populate('students.studentId', 'firstName email');

        if (!updatedClass) {
            return res.status(404).json({ message: 'Class with this student not found' });
        }

        res.status(200).json({
            message: 'Class link updated successfully',
            updatedClass
        });
    } catch (error) {
        console.error('Error updating class link:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


