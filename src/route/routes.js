import express from "express";
import { signupUser, signinUser, adminLogin,updateUser, logOut } from '../controler/authController.js'
import {creatReview,getReview} from '../controler/reviewController.js'
import {billingAddress} from "../controler/billingControler.js"
import {addPdf,createCourse,getAllCourses,addStudentToCourse,removeStudentFromCourse,getAllUserData,
    getStudentByCourseId,UpdateClassLink,updateCourse,deleteCourse} from "../controler/adminController.js"
import {createPackage,getAllPackages,getPackageByStudentId,buyPackage} from "../controler/packageController.js"
import multer from 'multer'
const router = express.Router();

let storage = multer.memoryStorage();
let upload = multer({storage});
// auth routes
router.post('/signupUser', signupUser);
router.post('/signinUser', signinUser);
router.post('/adminLogin', adminLogin);
router.put('/updateUser/:userId', updateUser);
router.post('/logOut',logOut)
// review routes
router.post('/creatReview', creatReview);
router.get('/getReview/:packageId', getReview);

// Billing Route 
router.post('/createBillingAdress',billingAddress )
// admin routes
router.post('/addPdf',upload.single('pdf') ,addPdf);
router.post('/createCourse' ,createCourse);
router.get('/getAllCourses', getAllCourses);
router.get('/getAllUserData', getAllUserData);
router.get('/getStudentByCourseId/:courseId', getStudentByCourseId);
router.post('/addStudentToCourse', addStudentToCourse);
router.post('/removeStudentFromCourse', removeStudentFromCourse);
router.put('/UpdateClassLink/:studentId', UpdateClassLink);
router.put('/updateCourse/:courseId', updateCourse);
router.delete('/deleteCourse/:courseId', deleteCourse);
// Package routes
router.post('/createPackage', createPackage);
router.get('/getAllPackages', getAllPackages);
router.get('/getPackageByStudentId/:studentId', getPackageByStudentId);// get package by student id in student panel 
router.post('/buyPackage', buyPackage);
export default router


