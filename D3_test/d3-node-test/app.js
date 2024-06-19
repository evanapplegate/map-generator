require('dotenv').config();
console.log(process.env.OPENAI_API_KEY);
const fs = require('fs').promises; 
const express = require('express');
const multer = require('multer');
const { OpenAI } = require('openai'); // Ensure correct import
const { systemPrompt } = require('./prompts');
const app = express();
const port = 3000;

// Setup for file uploads
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.static('public')); // Serve static files
app.use('/generated_scripts', express.static('generated_scripts'));

// Initialize OpenAI API client with your API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post('/generate-map', upload.single('file'), async (req, res) => {
  const userInput = req.body.userInput;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userInput
        },
      ]
    });
    console.log(response); // Log the entire response
    if (!response.choices || response.choices.length === 0 || !response.choices[0].message) {
      throw new Error('Unexpected API response format');
    }
    let mapScript = response.choices[0].message.content;
    // Strip "Map Script: " if it exists
    const prefix = "Map Script: ";
    if (mapScript.startsWith(prefix)) {
      mapScript = mapScript.slice(prefix.length);
    }
    // Save to script.js with an index to prevent overwriting
    const basePath = 'generated_scripts/generated_script';
    const extension = '.js';
    let index = 0;
    let filePath = `${basePath}${index}${extension}`;

    // Check if the file exists and increment the index until an available filename is found
    while (await fs.access(filePath).then(() => true).catch(() => false)) {
      index++;
      filePath = `${basePath}${index}${extension}`;
    }

    await fs.writeFile(filePath, mapScript);
    // Adjusted response to include the filePath
    res.json({ message: `Map script saved successfully as ${filePath}.`, filePath: `/generated_scripts/generated_script${index}.js` });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    res.status(500).send("Failed to generate map");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});