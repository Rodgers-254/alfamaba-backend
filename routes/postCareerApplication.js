// api/postCareerApplication.js
import nodemailer from 'nodemailer';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const upload = multer({ dest: 'uploads/' });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default [
  upload.single('certificate'), // field name from frontend
  async (req, res) => {
    try {
      const {
        fullName,
        email,
        phone,
        category,
        location,
        nationalId,
      } = req.body;

      const file = req.file;

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'rogiamani8@gmail.com.com',
        subject: `New Career Application from ${fullName}`,
        text: `
Name: ${fullName}
Email: ${email}
Phone: ${phone}
Category: ${category}
Location: ${location}
National ID: ${nationalId}
        `,
        attachments: file
          ? [
              {
                filename: file.originalname,
                path: file.path,
              },
            ]
          : [],
      };

      await transporter.sendMail(mailOptions);

      // Remove the uploaded file after sending
      if (file) fs.unlinkSync(file.path);

      res.status(200).json({ message: 'Application submitted successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Failed to submit application' });
    }
  },
];
