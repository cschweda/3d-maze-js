/**
 * Generate actual huge maze content
 *
 * This script generates the actual maze layout for the huge maze and replaces
 * the "PROCEDURAL" placeholder with actual maze data.
 */

const fs = require("fs");
const path = require("path");

// Re-use the generate maze functionality
const { generateMaze } = require("./maze_generator");

// Generate the maze
const width = 40;
const height = 40;
const maze = generateMaze(width, height);

// Read the huge.json file
const hugeMazePath = path.join(__dirname, "huge.json");
const hugeJson = JSON.parse(fs.readFileSync(hugeMazePath, "utf8"));

// Replace the "PROCEDURAL" with actual maze data
hugeJson.layout = maze;

// Write back to file
fs.writeFileSync(hugeMazePath, JSON.stringify(hugeJson, null, 2));

console.log(`Updated huge.json with generated maze of size ${width}x${height}`);
