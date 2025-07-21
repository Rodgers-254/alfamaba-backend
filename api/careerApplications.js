// backend/api/careerApplications.js
import nodemailer from 'nodemailer';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const handler = async (req, res) => {
  upload.single('certificate')(req, res, async (err) => {
    if (err) {
      console.error('❌ Multer error:', err);
      return res.status(500).json({ message: 'File upload failed' });
    }

    const {
      fullName,
      email,
      phone,
      location,
      idNumber,
      professionalCategory,
    } = req.body;

    const file = req.file;

    if (!fullName || !email || !phone || !location || !idNumber || !professionalCategory || !file) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Set up nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER, // e.g. yourapp@gmail.com
        pass: process.env.MAIL_PASS, // App Password, not your Gmail login
      },
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: 'rogiamani8@gmail.com',
      subject: `🎯 New Career Application from ${fullName}`,
      text: `
New service provider application:

• Name: ${fullName}
• Email: ${email}
• Phone: ${phone}
• Location: ${location}
• ID Number: ${idNumber}
• Professional Category: ${professionalCategory}
      `,
      attachments: [
        {
          filename: file.originalname,
          content: file.buffer,
        },
      ],
    };

    try {
      await transporter.sendMail(mailOptions);
      return res.status(200).json({ message: 'Application submitted successfully' });
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return res.status(500).json({ message: 'Failed to send application' });
    }
  });
};

export default handler;
