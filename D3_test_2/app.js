// app.js
const express = require('express');
const app = express();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { generateMapCode } = require('./mapCodeGenerator'); // Assuming you have a separate module for this

app.use(express.static('public'));
app.use(express.json());

app.post('/generate-map', upload.single('file'), async (req, res) => {
    const mapType = req.body.mapType;
    const inputString = req.body.mapRequest;
    const file = req.file; // The uploaded file
    const filePath = file ? file.path : null;

    try {
        const d3Code = await generateMapCode(inputString, mapType, filePath); // Pass filePath if needed
        res.json({ d3Code });
    } catch (error) {
      console.error('Failed to generate map code:', error);
      res.status(500).send('Server error while generating map code');
    }
  });

// Your server is set to listen on port 3000
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
  });