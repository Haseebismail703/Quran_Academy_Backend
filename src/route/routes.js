import express from "express";
import { signupUser, signinUser, adminLogin, updateUser, logOut } from '../controler/authController.js'
import { creatReview, getReview } from '../controler/reviewController.js'
import { billingAddress } from "../controler/billingControler.js"
import {
    createCourse, getAllCourses, addStudentToCourse, removeStudentFromCourse, getAllUserData,
    getWaitingStudentByCourseId, UpdateClassLink, updateCourse, deleteCourse
} from "../controler/adminController.js"
import { getCourseByTeacherId, getJoinStudentByCourseId, addFile, deleteFile } from "../controler/teacherController.js"
import { createPackage, getAllPackages, buyPackage } from "../controler/packageController.js"
import { getAllCoursesByStudentId, getFilesByCourseId, getPackageByStudentId } from "../controler/studentController.js"
import multer from 'multer'
const router = express.Router();

let storage = multer.memoryStorage();
let upload = multer({ storage });
// auth routes
router.post('/signupUser', signupUser);
router.post('/signinUser', signinUser);
router.post('/adminLogin', adminLogin);
router.put('/updateUser/:userId', updateUser);
router.post('/logOut', logOut)
// review routes
router.post('/creatReview', creatReview);
router.get('/getReview/:packageId', getReview);

// Billing Route 
router.post('/createBillingAdress', billingAddress);

// admin routes
router.post('/createCourse', createCourse);
router.get('/getAllCourses', getAllCourses);
router.get('/getAllUserData', getAllUserData);
router.get('/getWaitingStudentByCourseId/:courseId', getWaitingStudentByCourseId);
router.post('/addStudentToCourse', addStudentToCourse);
router.post('/removeStudentFromCourse', removeStudentFromCourse);
router.put('/UpdateClassLink/:studentId', UpdateClassLink);
router.put('/updateCourse/:courseId', updateCourse);
router.delete('/deleteCourse/:courseId', deleteCourse);

// Package routes
router.post('/createPackage', createPackage);
router.get('/getAllPackages', getAllPackages);
router.post('/buyPackage', buyPackage);

// teacher route 
router.get('/getCourseByTeacherId/:teacherId', getCourseByTeacherId);
router.get('/getJoinStudentByCourseId/:courseId', getJoinStudentByCourseId);
router.post('/addFile', upload.single('file'), addFile);
router.delete('/deleteFile/:fileId', deleteFile);

// student route
router.get('/getAllCoursesByStudentId/:studentId', getAllCoursesByStudentId);
router.get('/getFilesByCourseId/:courseId', getFilesByCourseId);
router.get('/getPackageByStudentId/:studentId', getPackageByStudentId); 

export default router


