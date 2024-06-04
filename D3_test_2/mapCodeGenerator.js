const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const OpenAI = require('openai');
const execAsync = promisify(exec);
const glob = require('glob');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const systemPrompts = {
  "world": "You are the master of D3 cartography. Use D3.js to write a script to create the map that was just described. Return only the JavaScript code necessary to create the map, without any additional explanations or HTML structure. Create the map using countries.geojson for the country polygons and country_bounds.geojson for the national boundaries. The country names are stored under the 'NAME' field in countries.geojson. All map data is located within the directory 'map_data'. The script should project the map using an appropriate projection (do NOT leave it in a geographic CRS), default to projection 'ESRI:54030'. If asked for a map that includes data from a supplied CSV, XLS or XLSX file, read it from the directory 'uploads' and use it. If your script renders a key for the color ramp, label it with whatever it is depicting. You must show a legend! Save the output as both PDF and PNG. Ensure the script is ready to execute. All fonts must be in Arial. Don't bold the text. Polygons should have no stroke/outline. The code should be executable in a browser environment.",
  "us": "TK",
  "other": "TK"
};

async function generateMapCode(inputString, mapType) {
  const systemPrompt = systemPrompts[mapType] || "You are a helpful assistant.";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: inputString }
      ],
      max_tokens: 1500,
    });

    const generatedCode = completion.choices[0].message.content.trim();
    return generatedCode;
  } catch (e) {
    console.error(`Failed to generate map code: ${e.message}`);
    throw e;
  }
}

async function writeCodeToFile(filename, code) {
  await fs.promises.writeFile(filename, code);
  console.log(`Successfully wrote to ${filename}`);
}

async function executeScript(filename) {
  try {
    await execAsync(`node ${filename}`);
    console.log(`Executed ${filename} successfully.`);
    return true;
  } catch (e) {
    console.error(`Failed to execute ${filename}: ${e}`);
    return false;
  }
}

async function renameOutputs(iteration) {
  const movedFiles = [];
  const staticDir = 'static';
  await fs.promises.mkdir(staticDir, { recursive: true });

  const files = await glob(`${UPLOAD_FOLDER}/*.{pdf,png}`);
  for (const file of files) {
    const { base, ext } = path.parse(file);
    const newBase = `${base}_${iteration}`;
    const newFilename = `${newBase}${ext}`;
    const newPath = path.join(staticDir, newFilename);
    await fs.promises.rename(file, newPath);
    console.log(`Renamed and moved ${file} to ${newPath}`);
    if (ext.toLowerCase() === '.png') {
      movedFiles.push(newFilename);
    }
  }

  return movedFiles;
}

module.exports = {
  generateMapCode,
  writeCodeToFile,
  executeScript,
  renameOutputs,
};