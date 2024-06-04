const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { OpenAI } = require('openai');
const execAsync = promisify(exec);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Initialize the OpenAI client with your API key
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Define different system prompts based on map_type
const systemPrompts = {
  "world": "You are the master of D3 cartography. Use D3.js to write a script to create the map that was just described. Create the map using countries.geojson for the country polygons and country_bounds.geojson for the national boundaries. The country names are stored under the 'NAME' field in countries.geojson. All map data is located within the directory 'map_data'. The script should project the map using an appropriate projection (do NOT leave it in a geographic CRS), default to projection 'ESRI:54030'. If asked for a map that includes data from a supplied CSV, XLS or XLSX file, read it from the directory 'uploads' and use it. If your script renders a key for the color ramp, label it with whatever it is depicting. You must show a legend! Save the output as both PDF and PNG. Ensure the script is ready to execute. All fonts must be in Arial. Don't bold the text. Polygons should have no stroke/outline.",

  "us": "You are the master of python cartography. Use geopandas and matplotlib to write a script to create the map that was just described. Create the map using US_states.geojson for the state polygons and US_bounds.geojson for the state boundaries. The state's names are stored under the 'name' field in US_states.geojson. If the map request includes US postal code-labels, they're stored under the field 'postal' in US_states.geojson. The script should project the map using an appropriate projection (do NOT leave it in a geographic CRS), color the states according to the specified colors, add labels if asked. If asked for a map that includes data from a supplied CSV, XLS or XLSX file, read it from the directory 'uploads' and use it. If your script renders a key for the color ramp, label it with whatever it is depicting. You must show a legend! Save the output as both PDF and PNG. Ensure the script is ready to execute, starting with import geopandas as gpd and import matplotlib.pyplot as plt. Set the plt.rcParams pdf fonttype to 42, set the plt.rcParams ps.fonttype to 42, and set plt.rcParams['font.family'] to Arial. Don't bold the text. The PDF bbox_inches should be set to 'tight'. Polygons should have no stroke/outline. Borders should be stroked according to the format bounds.plot(ax=ax, color='USER_COLOR', linewidth='USER_CHOSEN_WIDTH').",

  "other": "You are the master of python cartography. Use geopandas and matplotlib to write a script to create the map that was just described. Create the map using countries.geojson for the country polygons and country_bounds.geojson for the national boundaries. The country names are stored under the 'NAME' field in countries.geojson. All map data is located within the directory 'map_data'. The script should project the map in universal transverse mercator. The map should be cropped to NOT show the entire world, fill most of the frame with the requested country polygon. You gotta zoom in a bit. If asked for a map that includes data from a supplied CSV, XLS or XLSX file, read it from the directory 'uploads' and use it. If your script renders a key for the color ramp, label it with whatever it is depicting. You must show a legend! Save the output as both PDF and PNG. Ensure the script is ready to execute, starting with import geopandas as gpd and import matplotlib.pyplot as plt. Set the plt.rcParams pdf fonttype to 42, set the plt.rcParams ps.fonttype to 42, and set plt.rcParams['font.family'] to Arial. Don't bold the text. The PDF bbox_inches should be set to 'tight'. Polygons should have no stroke/outline. Borders should be stroked according to the format bounds.plot(ax=ax, color='USER_COLOR', linewidth='USER_CHOSEN_WIDTH')."
};

async function generateMapCode(inputString, mapType) {
  const systemPrompt = systemPrompts[mapType] || "You are a helpful assistant.";

  try {
    // Update the method to the correct one based on the OpenAI Node.js library
    const response = await openai.Completion.create({
      model: "gpt-4o",
      prompt: `${systemPrompt}\n${inputString}`,
      max_tokens: 1500,
    });

    // The rest of your code remains the same
    const generatedCode = response.data.choices[0].text.trim();
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
  await fs.promises.mkdir(staticDir, { recursive: true }); // Ensure the static directory exists

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