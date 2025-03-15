/**
 * Maze file validation tests
 * 
 * This script validates the structure and integrity of maze JSON files.
 */

const fs = require('fs');
const path = require('path');

// Validation schema for maze files
const mazeSchema = {
  required: ['width', 'height', 'playerStart', 'exit', 'layout'],
  playerStartRequired: ['x', 'y', 'direction'],
  exitRequired: ['x', 'y'],
  validCells: ['#', ' ', 'E']
};

/**
 * Validate a maze file against the schema
 * @param {Object} maze - The parsed maze JSON object
 * @param {string} filePath - Path to the maze file (for error reporting)
 * @returns {Object} - Validation result with success flag and errors array
 */
function validateMaze(maze, filePath) {
  const errors = [];
  const fileName = path.basename(filePath);

  // Check required properties
  for (const prop of mazeSchema.required) {
    if (!maze.hasOwnProperty(prop)) {
      errors.push(`Missing required property: ${prop}`);
    }
  }

  // Validate width and height are numbers > 0
  if (typeof maze.width !== 'number' || maze.width <= 0) {
    errors.push(`Invalid width: ${maze.width}. Must be a positive number.`);
  }
  
  if (typeof maze.height !== 'number' || maze.height <= 0) {
    errors.push(`Invalid height: ${maze.height}. Must be a positive number.`);
  }

  // Validate playerStart
  if (maze.playerStart) {
    for (const prop of mazeSchema.playerStartRequired) {
      if (!maze.playerStart.hasOwnProperty(prop)) {
        errors.push(`Missing required playerStart property: ${prop}`);
      }
    }

    // Direction should be 0-3
    if (
      typeof maze.playerStart.direction !== 'number' || 
      maze.playerStart.direction < 0 || 
      maze.playerStart.direction > 3
    ) {
      errors.push(`Invalid playerStart.direction: ${maze.playerStart.direction}. Must be 0-3.`);
    }
  }

  // Validate exit
  if (maze.exit) {
    for (const prop of mazeSchema.exitRequired) {
      if (!maze.exit.hasOwnProperty(prop)) {
        errors.push(`Missing required exit property: ${prop}`);
      }
    }
  }

  // Validate layout
  if (Array.isArray(maze.layout)) {
    // Check height matches
    if (maze.layout.length !== maze.height) {
      errors.push(`Layout height (${maze.layout.length}) doesn't match specified height (${maze.height})`);
    }
    
    // Check each row
    for (let y = 0; y < maze.layout.length; y++) {
      const row = maze.layout[y];
      
      // Check if row is array
      if (!Array.isArray(row)) {
        errors.push(`Layout row ${y} is not an array`);
        continue;
      }
      
      // Check width matches
      if (row.length !== maze.width) {
        errors.push(`Layout row ${y} width (${row.length}) doesn't match specified width (${maze.width})`);
      }
      
      // Check cell values
      for (let x = 0; x < row.length; x++) {
        const cell = row[x];
        if (!mazeSchema.validCells.includes(cell)) {
          errors.push(`Invalid cell value at (${x},${y}): "${cell}". Valid values are: ${mazeSchema.validCells.join(', ')}`);
        }
      }
    }
  } else {
    errors.push('Layout is not an array');
  }

  // Validate boundaries (all edges should be walls)
  if (Array.isArray(maze.layout) && maze.layout.length > 0) {
    // Check top and bottom rows
    const topRow = maze.layout[0];
    const bottomRow = maze.layout[maze.layout.length - 1];
    
    if (topRow && topRow.some(cell => cell !== '#')) {
      errors.push('Top boundary is not all walls (#)');
    }
    
    if (bottomRow && bottomRow.some(cell => cell !== '#')) {
      errors.push('Bottom boundary is not all walls (#)');
    }
    
    // Check left and right columns
    for (let y = 0; y < maze.layout.length; y++) {
      const row = maze.layout[y];
      if (!row) continue;
      
      if (row[0] !== '#') {
        errors.push(`Left boundary at row ${y} is not a wall (#)`);
      }
      
      if (row[row.length - 1] !== '#') {
        errors.push(`Right boundary at row ${y} is not a wall (#)`);
      }
    }
  }

  // Validate player and exit positions are within bounds and not walls
  if (
    maze.playerStart && 
    maze.layout && 
    Array.isArray(maze.layout) && 
    maze.playerStart.x >= 0 && 
    maze.playerStart.y >= 0 && 
    maze.playerStart.y < maze.layout.length && 
    maze.layout[maze.playerStart.y] && 
    maze.playerStart.x < maze.layout[maze.playerStart.y].length
  ) {
    const playerCell = maze.layout[maze.playerStart.y][maze.playerStart.x];
    if (playerCell === '#') {
      errors.push(`Player starting position (${maze.playerStart.x},${maze.playerStart.y}) is inside a wall`);
    }
  }

  if (
    maze.exit && 
    maze.layout && 
    Array.isArray(maze.layout) && 
    maze.exit.x >= 0 && 
    maze.exit.y >= 0 && 
    maze.exit.y < maze.layout.length && 
    maze.layout[maze.exit.y] && 
    maze.exit.x < maze.layout[maze.exit.y].length
  ) {
    // Exit should not be marked as 'E' in the layout as the game will set it
    // but it shouldn't be a wall
    const exitCell = maze.layout[maze.exit.y][maze.exit.x];
    if (exitCell === '#') {
      errors.push(`Exit position (${maze.exit.x},${maze.exit.y}) is inside a wall`);
    }
  }

  // Check if player can reach exit (simple check - more complex pathfinding could be added)
  if (errors.length === 0) {
    console.log(`✅ ${fileName}: Maze file structure is valid`);
  } else {
    console.error(`❌ ${fileName}: Maze file has ${errors.length} validation issues:`);
    errors.forEach(err => console.error(`  - ${err}`));
  }

  return {
    success: errors.length === 0,
    errors
  };
}

/**
 * Validate all maze files in the specified directory
 * @param {string} mazeDir - Directory containing maze files
 */
function validateAllMazes(mazeDir) {
  try {
    const files = fs.readdirSync(mazeDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    console.log(`Found ${jsonFiles.length} maze files in ${mazeDir}\n`);
    
    let validCount = 0;
    let invalidCount = 0;
    
    for (const file of jsonFiles) {
      const filePath = path.join(mazeDir, file);
      try {
        const mazeData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const result = validateMaze(mazeData, filePath);
        
        if (result.success) {
          validCount++;
        } else {
          invalidCount++;
        }
      } catch (err) {
        console.error(`❌ ${file}: Failed to read or parse file: ${err.message}`);
        invalidCount++;
      }
      
      console.log(''); // Add space between files
    }
    
    console.log(`\nValidation summary: ${validCount} valid, ${invalidCount} invalid maze files`);
    
    if (invalidCount > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error(`Failed to read maze directory (${mazeDir}): ${err.message}`);
    process.exit(1);
  }
}

// If run directly (not imported)
if (require.main === module) {
  const mazeDir = path.join(__dirname, '..', 'mazes');
  validateAllMazes(mazeDir);
}

module.exports = {
  validateMaze,
  validateAllMazes
};