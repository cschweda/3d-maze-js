/**
 * Test runner for the TRS-80 Style Maze project
 * 
 * This script runs all available tests and reports results.
 */

const path = require('path');
const { validateAllMazes } = require('./validate-maze');
const { testRendering } = require('./test-rendering');
const { testMazeGeneration } = require('./test-maze-generator');

// Set up for coloring console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

/**
 * Run a test and report results
 * @param {string} testName - Name of the test
 * @param {Function} testFn - Test function to run
 * @returns {boolean} Whether test passed
 */
async function runTest(testName, testFn) {
  console.log(`\n${colors.cyan}Running test: ${colors.white}${testName}${colors.reset}`);
  console.log('='.repeat(50));
  
  try {
    const start = Date.now();
    const result = await testFn();
    const end = Date.now();
    const duration = end - start;
    
    if (result) {
      console.log(`\n${colors.green}✅ PASS:${colors.reset} ${testName} (${duration}ms)`);
      return true;
    } else {
      console.log(`\n${colors.red}❌ FAIL:${colors.reset} ${testName} (${duration}ms)`);
      return false;
    }
  } catch (err) {
    console.error(`\n${colors.red}❌ ERROR:${colors.reset} ${testName}`);
    console.error(`   ${err.message}`);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log(`${colors.magenta}TRS-80 Style Maze - Test Suite${colors.reset}`);
  console.log('='.repeat(50));
  
  const tests = [
    { name: 'Validate Maze Files', fn: () => {
      const mazeDir = path.join(__dirname, '..', 'mazes');
      return new Promise((resolve) => {
        try {
          // Modified to return success/failure instead of exiting
          let validCount = 0;
          let invalidCount = 0;
          
          const files = require('fs').readdirSync(mazeDir);
          const jsonFiles = files.filter(file => file.endsWith('.json'));
          
          console.log(`Found ${jsonFiles.length} maze files in ${mazeDir}\n`);
          
          for (const file of jsonFiles) {
            const filePath = path.join(mazeDir, file);
            try {
              const mazeData = JSON.parse(require('fs').readFileSync(filePath, 'utf8'));
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
          resolve(invalidCount === 0);
        } catch (err) {
          console.error(`Failed to read maze directory (${mazeDir}): ${err.message}`);
          resolve(false);
        }
      });
    }},
    { name: 'Maze Generation', fn: testMazeGeneration },
    { name: 'Rendering', fn: testRendering }
  ];
  
  let passCount = 0;
  let failCount = 0;
  
  for (const test of tests) {
    const passed = await runTest(test.name, test.fn);
    if (passed) {
      passCount++;
    } else {
      failCount++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`${colors.cyan}Test Summary:${colors.reset}`);
  console.log(`${colors.green}Passed: ${passCount}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failCount}${colors.reset}`);
  console.log('='.repeat(50));
  
  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Helper function for maze validation within the runner
function validateMaze(maze, filePath) {
  const errors = [];
  const fileName = path.basename(filePath);
  const mazeSchema = {
    required: ['width', 'height', 'playerStart', 'exit', 'layout'],
    playerStartRequired: ['x', 'y', 'direction'],
    exitRequired: ['x', 'y'],
    validCells: ['#', ' ', 'E']
  };

  // Check required properties
  for (const prop of mazeSchema.required) {
    if (!maze.hasOwnProperty(prop)) {
      errors.push(`Missing required property: ${prop}`);
    }
  }

  // Basic validation only for runner
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

// Run all tests when this script is executed directly
if (require.main === module) {
  runAllTests().catch(err => {
    console.error('Test runner error:', err);
    process.exit(1);
  });
}

module.exports = {
  runAllTests
};