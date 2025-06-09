
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();
const OpenAI = require("openai");
const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'visionbuilder', allowed_formats: ['jpg', 'png'] },
});
const upload = multer({ storage });

app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;
  try {
    const chat = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }]
    });
    const dalle = await openai.createImage({ prompt, n: 1, size: '512x512' });
    res.json({ text: chat.data.choices[0].message.content, image_url: dalle.data.data[0].url });
  } catch (err) {
    res.status(500).json({ error: 'AI failed' });
  }
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  res.json({ message: 'Upload successful', imageUrl: req.file.path });
});

app.listen(5000, () => console.log('Server running on port 5000'));
