import User from "../model/authModel.js";
import Message from '../model/chatModel.js'
import { configDotenv } from 'dotenv'
configDotenv()

let allUser =  async(req,res) =>{ 
        try {
            const users = await User.find({});
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: "Server error" });
        }
   
}

let message = async(req,res) =>{
    const { senderId, receiverId, content } = req.body;
    // console.log(req.body)
    try {
        const message = await  new Message({ sender: senderId, receiver: receiverId, content });
        res.status(201).json({ message: "Message sent", message });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}

 let getMessage = async(req,res) =>{
    const { senderId, receiverId } = req.params;
    // console.log(req.params)
    try {
        const messages = await Message.find({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId },
            ],
        }).sort({ timestamp: 1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}   
export {allUser,message,getMessage };
