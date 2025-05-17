import express from "express";
import { signupUser, signinUser, adminLogin, updateUser, logOut,updateStatusAndFirstName, updatePassword, getProfile } from '../controler/authController.js'
import { creatReview, getReview } from '../controler/reviewController.js'
import { billingAddress } from "../controler/billingControler.js"
import { getClassByTeacherId, getJoinStudentByClassId, addFile, deleteFile,getFilesByClassId, addClassLinkToStudent, getTeacherDashboardData, getD } from "../controler/teacherController.js"
import { createPackage, getAllPackages, buyPackage, deletePackage } from "../controler/packageController.js"
import { getAllClassesByStudentId, getPackageByStudentId,getPaymentHistory, getStudentDashboardData } from "../controler/studentController.js"
import { createClass, getAllClasses, addStudentToClass, removeStudentFromClass, getWaitingStudentCourseId, updateClass, deleteClass, getAllTeacher, getAllUserData, createCourse, getAllCourses, UpdateClassLink, updateCourseDetails, deleteCourse, getClassWithStudents, getCourseAndWaitingStudent, createCareer, getAllCareer, allUser, getAdminDasData, getPaymentData, getMonthlyApprovedFee } from '../controler/adminController.js'

import multer from 'multer'
import { getAllAttendance, getStudentAttendanceHistory, getStudentAttendence, markAttendance, updateAttendance } from "../controler/attendenceController.js";
import { adminAllUserInchat, getMessage, getStudentsInChat, getTeacherInTheChat, message } from "../controler/chatController.js";
import { createNotification, deleteNoti, getAllNotification, getNotificationsForUser, markNotificationAsRead } from "../controler/notificationController.js";
import { createClassNotification, deleteNotification, getAllNotifications, getClassNotification, getNotificationsByClass } from "../controler/teacherNotification.js";
import {  checkAndGenerateVoucher, createRecipe,  getLatestVoucher, updateRecipeImage,  updateVoucherStatus } from "../controler/voucherController.js";
import { getNotify, markAllAsRead } from "../utils/sendNotify.js";
const router = express.Router();

let storage = multer.memoryStorage();
let upload = multer({ storage });

// Admin route
router.post('/createCourse', createCourse);
router.get('/getAllCourses', getAllCourses);
router.put('/updateCourseDetails/:courseId', updateCourseDetails)
router.delete('/deleteCourse/:courseId', deleteCourse)
router.post('/createClass', createClass)
router.get('/getAllClasses', getAllClasses)
router.post('/addStudentToClass', addStudentToClass)
router.post('/removeStudentFromClass', removeStudentFromClass)
router.get('/getWaitingStudentCourseId/:courseId', getWaitingStudentCourseId)
router.get('/getClassWithStudents/:classId', getClassWithStudents)
router.put('/updateClass/:classId', updateClass)
router.delete('/deleteClass/:classId', deleteClass)
router.get('/getAllUserData', getAllUserData);
router.get('/getAllTeacher', getAllTeacher)
router.put('/UpdateClassLink/:studentId', UpdateClassLink)
router.get('/getCourseAndWaitingStudent', getCourseAndWaitingStudent)
router.post('/createCareer',createCareer)
router.get('/getAllCareer',getAllCareer)
router.get('/allUser',allUser)
router.get('/getAdminDasData',getAdminDasData)
router.get('/getPaymentData',getPaymentData)
router.get('/getMonthlyApprovedFee', getMonthlyApprovedFee)
// auth routes
router.post('/signupUser', signupUser);
router.post('/signinUser', signinUser);
router.post('/adminLogin', adminLogin);
router.put('/updateUser/:userId',upload.single('file'), updateUser);
router.put('/update-password/:userId', updatePassword);
router.put('/updateStatusAndFirstName/:userId', updateStatusAndFirstName);
router.get('/getProfile/:userId',getProfile)
router.post('/logOut', logOut)
// review routes
router.post('/creatReview', creatReview);
router.get('/getReview/:packageId', getReview);

// Billing Route 
router.post('/createBillingAdress', billingAddress);
// Package routes
router.post('/createPackage', createPackage);
router.get('/getAllPackages', getAllPackages);
router.post('/buyPackage', upload.single('file') ,buyPackage);
router.delete('/deletePackage/:packageId', deletePackage);
// teacher route 
router.get('/getClassByTeacherId/:teacherId', getClassByTeacherId);
router.get('/getJoinStudentByClassId/:classId', getJoinStudentByClassId);
router.post('/addFile', upload.single('file'), addFile);
router.delete('/deleteFile/:fileId', deleteFile);
router.put('/addClassLink/:studentId', addClassLinkToStudent)
router.get('/getAllAttendance/:classId/:date',getAllAttendance)
router.get('/teacher-dashboard/:teacherId', getTeacherDashboardData);
router.get('/getD/:teacherId',getD)
// student route
router.get('/getAllClassesByStudentId/:studentId', getAllClassesByStudentId);
router.get('/getFilesByClassId/:classId', getFilesByClassId);
router.get('/getPackageByStudentId/:studentId', getPackageByStudentId);
router.get('/paymentHistory/:studentId', getPaymentHistory);
router.get('/getStudentDashboardData/:studentId',getStudentDashboardData)

// attendece route 
router.post('/markAttendance',markAttendance)
router.get('/getStudentAttendanceHistory/:studentId/classId/:classId',getStudentAttendanceHistory)
router.put('/updateAttendance',updateAttendance)
router.get('/getStudentAttendence/:studentId',getStudentAttendence)

// chat route
router.post('/messages',message)
router.get("/messages/:senderId/:receiverId",getMessage)
router.get('/getTeacherInChat/:studentId',getTeacherInTheChat)
router.get('/getStudentsInChat/:teacherId',getStudentsInChat)
router.get('/adminAllUserInchat/:adminId',adminAllUserInchat)

// Notification route
router.post("/creatNoti", createNotification);
router.get("/noti/:userId/:role", getNotificationsForUser);
router.get('/getAllNotification',getAllNotification)
router.put("/noti/read/:id", markNotificationAsRead);
router.delete('/deleteNoti/:id',deleteNoti)

// teacher Notification
router.get('/getAllClassNotification', getAllNotifications);
router.get('/classNotification/:classId', getNotificationsByClass);
router.post('/createClassNotification', createClassNotification);
router.delete('/classNotification/:id', deleteNotification); 
router.get('/getClassNotification',getClassNotification)

// voucher route
router.post('/createRecipe',upload.single('file'),createRecipe)
router.get('/getLatestVoucher', getLatestVoucher);
router.put('/recipe/update', upload.single('file'), updateRecipeImage);
router.put('/updateVoucherStatus',updateVoucherStatus)
router.get('/generate-voucher/:studentId/:courseId/:packageId', checkAndGenerateVoucher);

// Notify
router.get('/getNotify/:receiverId' , getNotify)
router.put('/read-all/:receiverId', markAllAsRead);

export default router


