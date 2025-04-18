import User from '../model/authModel.js'
import Course from '../model/courseModel.js'
import Package from '../model/packageModel.js'
import File from '../model/fileModel.js'
import cloudinary from '../confiq/cloudinary.js'
import streamifier from 'streamifier';

// get Course by teacher id
export const getCourseByTeacherId = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const courses = await Course.find({ teacherId: teacherId }).populate('studentId');
        if (!courses) {
            return res.status(404).json({ message: "No courses found for this teacher" });
        }
        return res.status(200).json(courses);
    } catch (error) {
        console.error("Error fetching courses by teacher ID:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// get all student by course id
export const getJoinStudentByCourseId = async (req, res) => {
    const { courseId } = req.params;
    try {
        const students = await User.find({ role: "student", courses: { $elemMatch: { courseId: courseId, status: 'join' } } })
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
        const { title, type, courseId } = req.body;
        const file = req.file;

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
            courseId: courseId,
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


// get all files by course id
export const getFilesByCourseId = async (req, res) => {
    const { courseId } = req.params;
    try {
        const files = await File.find({
            courseId: courseId
        });
        if (!files) {
            return res.status(404).json({ message: "No files found for this course" });
        }
        return res.status(200).json(files);
    }
    catch (error) {
        console.error("Error fetching files by course ID:", error.message);
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

// get all files by course id and student id 
export const getFilesByCourseIdAndStudentId = async (req, res) => {
    const { courseId, studentId } = req.params;

    try {
        let getCourse = await Course.findById(courseId)
        if (!getCourse) {
            return res.status(404).json({ message: "Course not found" });
        }
        if (getCourse.studentId.toString() !== studentId) {
            return res.status(403).json({ message: "You are not enrolled in this course" });
        }
        const files = await File.find({
            courseId: courseId,
            studentId: studentId
        });
        if (!files) {
            return res.status(404).json({ message: "No files found for this course" });
        }
        return res.status(200).json(files);
    }
    catch (error) {
        console.error("Error fetching files by course ID:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}