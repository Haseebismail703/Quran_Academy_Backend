import Pdf from "../model/pdfModel.js";
import cloudinary from "../confiq/cloudinary.js";
import streamifier from "streamifier";
let addPdf = async (req, res) => {
    try {
        const { title } = req.body;
        const file = req.file;
    
        if (!file || !file.mimetype.includes('pdf')) {
          return res.status(400).json({ error: 'Only PDF files allowed' });
        }
    
        const streamUpload = (fileBuffer) => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { resource_type: 'raw', folder: 'pdfs' },
              (error, result) => {
                if (result) resolve(result);
                else reject(error);
              }
            );
            streamifier.createReadStream(fileBuffer).pipe(stream);
          });
        };
    
        const result = await streamUpload(file.buffer);
        console.log(result);
        const pdf = new Pdf({
          title,
          url: result.secure_url,
          publicId: result.public_id,
        });
    
        await pdf.save();
    
        res.status(200).json({ message: 'PDF uploaded', data: pdf });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Upload failed' });
      }
}


export { addPdf };