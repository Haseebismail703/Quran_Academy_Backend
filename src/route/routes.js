import express from "express";
import { signupUser, signinUser, adminLogin,updateUser, logOut } from '../controler/authController.js'
import {creatReview,getReview} from '../controler/reviewController.js'
import {billingAddress} from "../controler/billingControler.js"
import {addPdf,createClass,getAllClasses,addStudentToClass,removeStudentFromClass,getAllUserData,
    getStudentByClassId,UpdateClassLink,updateClassDetail,deleteClass} from "../controler/adminController.js"
import {createPackage,getAllPackages} from "../controler/packageController.js"
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
router.post('/createClass' ,createClass);
router.get('/getClass', getAllClasses);
router.get('/getAllUserData', getAllUserData);
router.get('/getStudentByClassId/:classId', getStudentByClassId);
router.post('/addStudentToClass', addStudentToClass);
router.post('/removeStudentFromClass', removeStudentFromClass);
router.put('/UpdateClassLink/:classId', UpdateClassLink);
router.put('/updateClassDetail/:classId', updateClassDetail);
router.delete('/deleteClass/:classId', deleteClass);
// Package routes
router.post('/createPackage', createPackage);
router.get('/getAllPackages', getAllPackages);

export default router


