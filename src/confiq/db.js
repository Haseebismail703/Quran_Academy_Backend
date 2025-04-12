import mongoose from "mongoose";
import { configDotenv } from "dotenv";
configDotenv()
mongoose.connect(process.env.DB_URI)
export default mongoose
