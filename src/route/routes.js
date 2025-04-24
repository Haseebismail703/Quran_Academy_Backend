import express from "express";
import { signupUser, signinUser, adminLogin, updateUser, logOut } from '../controler/authController.js'
import { creatReview, getReview } from '../controler/reviewController.js'
import { billingAddress } from "../controler/billingControler.js"
import { getClassByTeacherId, getJoinStudentByClassId, addFile, deleteFile,getFilesByClassId } from "../controler/teacherController.js"
import { createPackage, getAllPackages, buyPackage, getAllPackageStudentId } from "../controler/packageController.js"
import { getAllClassesByStudentId, getPackageByStudentId } from "../controler/studentController.js"
import { createClass, getAllClasses, addStudentToClass, removeStudentFromClass, getWaitingStudentCourseId, updateClass, deleteClass, getAllTeacher, getAllUserData, createCourse, getAllCourses, UpdateClassLink, updateCourseDetails, deleteCourse } from '../controler/adminController.js'

import multer from 'multer'
import { getStudentAttendanceHistory, getStudentAttendence, markAttendance, updateAttendance } from "../controler/attendenceController.js";
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
router.put('/updateClass/:classId', updateClass)
router.delete('/deleteClass/:classId', deleteClass)
router.get('/getAllUserData', getAllUserData);
router.get('/getAllTeacher', getAllTeacher)
router.put('/UpdateClassLink/:studentId', UpdateClassLink)

// auth routes
router.post('/signupUser', signupUser);
router.post('/signinUser', signinUser);
router.post('/adminLogin', adminLogin);
router.put('/updateUser/:userId',upload.single('file'), updateUser);
router.post('/logOut', logOut)
// review routes
router.post('/creatReview', creatReview);
router.get('/getReview/:packageId', getReview);

// Billing Route 
router.post('/createBillingAdress', billingAddress);
// Package routes
router.post('/createPackage', createPackage);
router.get('/getAllPackages', getAllPackages);
router.post('/buyPackage', buyPackage);
router.get('/getAllPackageStudentId', getAllPackageStudentId)
// teacher route 
router.get('/getClassByTeacherId/:teacherId', getClassByTeacherId);
router.get('/getJoinStudentByClassId/:classId', getJoinStudentByClassId);
router.post('/addFile', upload.single('file'), addFile);
router.delete('/deleteFile/:fileId', deleteFile);
// student route
router.get('/getAllClassesByStudentId/:studentId', getAllClassesByStudentId);
router.get('/getFilesByClassId/:classId', getFilesByClassId);
router.get('/getPackageByStudentId/:studentId', getPackageByStudentId);

// attendece route 
router.post('/markAttendance',markAttendance)
router.get('/getStudentAttendanceHistory/:studentId/classId/:classId',getStudentAttendanceHistory)
router.put('/updateAttendance',updateAttendance)
router.get('/getStudentAttendence/:studentId',getStudentAttendence)
export default router


