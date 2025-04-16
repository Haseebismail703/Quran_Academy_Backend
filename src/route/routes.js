import express from "express";
import { signupUser, signinUser, adminLogin,updateUser, logOut } from '../controler/authController.js'
import {creatReview,getReview} from '../controler/reviewController.js'
import {billingAddress} from "../controler/billingControler.js"
import {addPdf} from "../controler/adminController.js"
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
export default router


