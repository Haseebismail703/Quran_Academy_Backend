import cloudinary from "../confiq/cloudinary.js";
import User from "../model/authModel.js";
import Package from "../model/packageModel.js";
import Voucher from "../model/voucherModel.js";
import { sendNotify } from "../utils/sendNotify.js";
import { io } from '../Socket/SocketConfiq.js'

export let createRecipe = async (req, res) => {
  const { packageId, courseId, studentId } = req.body;
  const file = req.file;
  //    console.log(req.body)
  try {
    let recipeUrl = null;
    let publicId = null
    if (file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'package',
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        // Pipe the file buffer into the upload stream
        uploadStream.end(file.buffer);
      });

      recipeUrl = uploadResult.secure_url; // Get the uploaded image URL
      publicId = uploadResult.public_id
      // console.log(uploadResult,req.body)
    }

    // Create a new recipe in the database
    const newRecipe = await Voucher.create({
      packageId,
      courseId,
      studentId,
      recipeUrl,
      publicId
    });

    res.status(201).json({
      success: true,
      message: "Recipe created successfully",
      data: newRecipe,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the recipe",
      error: error.message,
    });
  }
};


export const checkAndGenerateVoucher = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // All packages for student
    const studentPackages = await Package.find({ studentId });

    // if (!studentPackages || studentPackages.length === 0) {
    //   return res.status(404).json({
    //     success: false,
    //     message: 'No active packages found for this student'
    //   });
    // }

    // Function to calculate full months between two dates
    const calculateFullMonthsDifference = (startDate, endDate) => {
      const start = new Date(startDate);
      const end = new Date(endDate);

      let yearDiff = end.getFullYear() - start.getFullYear();
      let monthDiff = end.getMonth() - start.getMonth();
      let totalMonths = yearDiff * 12 + monthDiff;

      // If the end date's day is >= start date's day, count the current month too
      if (end.getDate() >= start.getDate()) {
        totalMonths += 1;
      }

      return Math.max(0, totalMonths);
    };


    const newVouchers = [];

    for (const pkg of studentPackages) {
      if (!pkg.monthEnd || pkg.monthEnd.getTime() === new Date(0).getTime()) continue;

      const missedMonths = calculateFullMonthsDifference(pkg.monthEnd, today);

      if (missedMonths <= 0) continue;

      // Check if voucher already exists for current month
      const existingVoucher = await Voucher.findOne({
        packageId: pkg._id,
        studentId: pkg.studentId,
        createdAt: {
          $gte: new Date(today.getFullYear(), today.getMonth(), 1),
          $lte: new Date(today.getFullYear(), today.getMonth() + 1, 0)
        }
      });

      if (!existingVoucher) {
        const totalFee = pkg.coursePrice * missedMonths;

        // Calculate the last missed month's end date
        const lastMissedMonthDate = new Date(pkg.monthEnd);
        lastMissedMonthDate.setMonth(lastMissedMonthDate.getMonth() + missedMonths);

        const newVoucher = new Voucher({
          packageId: pkg._id,
          courseId: pkg.courseId,
          studentId: pkg.studentId,
          status: "pending",
          fee: totalFee,
          pendingMonth: missedMonths,
          monthEnd: lastMissedMonthDate
        });

        const savedVoucher = await newVoucher.save();
        newVouchers.push(savedVoucher);
      }
    }

    const allVouchers = await Voucher.find({ studentId })
      .populate('packageId', 'packageName coursePrice')
      .populate('courseId', 'courseName')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: newVouchers.length > 0
        ? `${newVouchers.length} new voucher(s) generated`
        : 'No voucher needed',
      data: {
        vouchers: allVouchers,
        newlyCreated: newVouchers,
        packagesChecked: studentPackages.length
      }
    });

  } catch (error) {
    // console.error('Error in checkAndGenerateVouchers:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};





export const getLatestVoucher = async (req, res) => {

  try {
    const latestVoucher = await Voucher.find({
      status: { $in: ['pending', 'approved', 'rejected'] },  // filter allowed statuses
      recipeUrl: { $ne: '' },
    })
      .sort({ createdAt: -1 })
      .populate('studentId', 'firstName')
      .populate('courseId', 'courseName')
      .populate('packageId', 'packageName');
    console.log(latestVoucher)
    res.status(200).json(latestVoucher);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching the latest voucher.',
      error: error.message,
    });
  }
};

export const updateRecipeImage = async (req, res) => {
  const { recipeId, studentId } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ success: false, message: 'No image file provided' });
  }

  try {
    // Get latest voucher entry for that student and course
    const latestVoucher = await Voucher.findById(recipeId)

    if (!latestVoucher) {
      return res.status(404).json({
        success: false,
        message: 'No voucher found to update.',
      });
    }

    // Delete previous image from Cloudinary
    if (latestVoucher.publicId) {
      await cloudinary.uploader.destroy(latestVoucher.publicId);
    }

    // Upload new image
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'vouchers',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(file.buffer);
    });

    // Update voucher with new image URL and publicId
    latestVoucher.recipeUrl = uploadResult.secure_url;
    latestVoucher.publicId = uploadResult.public_id;
    latestVoucher.status = 'pending'
    await latestVoucher.save();


    if (uploadResult) {
      let getUser = await User.find({ role: "admin" })
      let adminId = getUser.map(ids => ids._id)
      const notify = await sendNotify({
        senderId: studentId,
        receiverId: [adminId],
        message: "💰 Fee has been submitted by the student.",
        path: "/admin/allvoucher"
      }, io);
    }
    res.status(200).json({
      success: true,
      message: 'Voucher recipe image updated successfully',
      data: latestVoucher,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update recipe image.',
      error: error.message,
    });
  }
};

// update recipe  status and package update 
export const updateVoucherStatus = async (req, res) => {
  const { studentId, courseId, status, voucherId, packageId, adminId } = req.body;
  console.log("req body", req.body)
  try {

    // notify the student 
    let feeText = status === "approved" ? '✅ Fee received. Thank you!' : "⚠️ fee rejected. Contact admin."

    let notify = async () => {
      await sendNotify({
        senderId: adminId,
        receiverId: [studentId],
        message: feeText,
        path: "/student/feevoucher"
      }, io);
    }



    // Validate student existence
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Validate voucher existence
    const voucher = await Voucher.findById(voucherId)
      .populate('packageId', 'coursePrice')
    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    // Reject: only update voucher status
    if (status === 'rejected') {
      voucher.status = 'rejected';
      voucher.feePaidDate = new Date(0)
      // voucher.fee = 0
      await voucher.save();
      notify()
      return res.status(200).json({
        message: "Voucher rejected successfully",
        data: voucher
      });
    }

    // Approve: update voucher and run course logic
    if (status === 'approved') {

      // Update voucher status
      voucher.status = 'approved';
      voucher.feePaidDate = new Date()
      // voucher.fee = voucher.packageId?.coursePrice
      await voucher.save();
      notify()
      // Dates
      const currentDate = new Date();
      const startDate = currentDate.toISOString().split("T")[0];

      const endDateObj = new Date(currentDate);
      endDateObj.setMonth(endDateObj.getMonth() + 1);
      if (endDateObj.getDate() !== currentDate.getDate()) {
        endDateObj.setDate(0); // Handle overflow days
      }
      const endDate = endDateObj.toISOString().split("T")[0];

      // Check if student already joined course
      const alreadyJoined = student.classes.find(
        (cls) => cls.courseId.toString() === courseId && cls.status === 'join'
      );

      if (!alreadyJoined) {
        student.classes.push({
          teacherId: null,
          courseId,
          status: 'waiting',
        });
      }

      // Update package info
      const updatedPackage = await Package.findByIdAndUpdate(
        packageId,
        {
          monthStart: startDate,
          monthEnd: endDate,
          paymentStatus: 'completed',
        },
        { new: true }
      );
      if (!updatedPackage) {
        return res.status(404).json({ message: "Package not found" });
      }

      await student.save();
      return res.status(200).json({
        message: "Voucher approved and course added successfully",
        data: student
      });
    }

    // Invalid status
    return res.status(400).json({ message: "Invalid status provided" });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};

