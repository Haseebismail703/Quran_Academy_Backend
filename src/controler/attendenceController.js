import Attendance from "../model/attendenceModel.js";


// mark attendence 
export const markAttendance = async (req, res) => {
    const { classId, records, date } = req.body;
    // console.log(req.body)
    try {
        // Step 1: Get today's attendance for the class
        const existingAttendance = await Attendance.findOne({ classId, date });

        // Step 2: Check if any student in records is already marked
        if (existingAttendance) {
            const alreadyMarked = records.some(record =>
                existingAttendance.records.some(r => r.studentId.toString() === record.studentId)
            );

            if (alreadyMarked) {
                return res.status(400).json({ message: "Some students already marked for today" });
            }

            // Step 3: Push remaining students to today's record
            existingAttendance.records.push(...records);
            await existingAttendance.save();

            return res.status(200).json({ message: "Attendance updated for new students", attendance: existingAttendance });
        }

        // Step 4: Create new attendance document
        const newAttendance = await Attendance.create({
            classId,
            date,
            records
        });

        res.status(201).json({ message: "Attendance marked successfully", attendance: newAttendance });
    } catch (error) {
        console.error("Attendance Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
// get attendence 
export const getStudentAttendanceHistory = async (req, res) => {
    const { studentId, classId } = req.params;

    try {
        const records = await Attendance.find({
            classId,
            "records.studentId": studentId
        }, {
            date: 1,
            records: { $elemMatch: { studentId } }
        }).sort({ date: 1 }).populate('records.studentId', 'status');

        res.json(records);
    } catch (error) {
        console.error("Fetch Student Attendance Error:", error);
        res.status(500).json({ message: "Failed to get attendance history", error: error.message });
    }
};

export const updateAttendance = async (req, res) => {
    const { classId, date, studentId, newStatus } = req.body;
    console.log(req.body)
    try {
        // Step 1: Find the attendance record for the class and date
        const attendance = await Attendance.findOne({ classId, date });
        if (!attendance) {
            return res.status(404).json({ message: "Attendance not found for the given class and date" });
        }

        // Step 2: Find the student's record in that day's attendance
        const studentRecord = attendance.records.find(
            (r) => r.studentId.toString() === studentId
        );

        if (!studentRecord) {
            return res.status(404).json({ message: "Student's attendance not found for the given date" });
        }

        // Step 3: Update the status
        studentRecord.status = newStatus;
        await attendance.save();

        res.status(200).json({ message: "Attendance updated successfully", attendance });
    } catch (error) {
        console.error("Update Attendance Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const getStudentAttendence = async (req, res) => {
    const { studentId } = req.params;

    try {
        // 1. Fetch all records from the Attendance collection where this student exists
        const attendanceRecords = await Attendance.find({
            "records.studentId": studentId
        });

        if (attendanceRecords.length === 0) {
            return res.status(404).json({ message: "No attendance records found for this student." });
        }

        // 2. Count present and absent
        let presentCount = 0;
        let absentCount = 0;
        let lateCount = 0
        const studentAttendance = [];

        attendanceRecords.forEach(record => {
            const student = record.records.find(r => r.studentId.toString() === studentId);
            if (student) {
                if (student.status === "present") presentCount++;
                else if (student.status === "absent") absentCount++;
                else if (student.status === "late") lateCount++

                studentAttendance.push({
                    date: record.date,
                    classId: record.classId,
                    status: student.status
                });
            }
        });

        // 3. Send response
        res.status(200).json({
            totalRecords: studentAttendance.length,
            presentCount,
            absentCount,
            lateCount,
            attendance: studentAttendance
        });

    } catch (error) {
        console.error("Fetch Attendance Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get all attendance by class ID and date
export const getAllAttendance = async (req, res) => {
    const { classId, date } = req.params;
    //    console.log(req.params)
    try {
        const attendanceRecords = await Attendance.find({
            classId,
            date
        }).populate('records.studentId', 'firstName lastName email gender');

        if (!attendanceRecords || attendanceRecords.length === 0) {
            return res.status(404).json({ message: "No attendance records found for this class and date." });
        }

        res.status(200).json(attendanceRecords);
    } catch (error) {
        console.error("Fetch Attendance Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

