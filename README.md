# TRS-80 Style 3D Maze Game

A browser-based 3D maze generator and navigation game inspired by classic TRS-80 maze games from the early days of computing like Death Maze 5000 and Asylum. This project is built using pure JavaScript and HTML5 Canvas with no external dependencies.

![TRS-80 Style Maze](screenshot.png)

## Overview

- **Procedural Maze Generation**: Uses a depth-first search algorithm with backtracking to create random mazes with exactly one solution path
- **Pseudo-3D Rendering**: Creates the illusion of 3D using simple geometry and perspective techniques
- **Smooth Animations**: Implements easing functions for fluid movement transitions
- **Canvas-Based Rendering**: Utilizes HTML5 Canvas for both the main view and minimap
- **Direction Vector Interpolation**: Provides smooth rotation transitions when turning

## How to Play

- Use the **arrow keys** to navigate:
  - **↑** Move forward
  - **↓** Move backward
  - **←** Turn left
  - **→** Turn right
- Find the exit (marked with a green "EXIT" sign)
- Use the minimap to help orient yourself
- The "Available paths" indicator shows which directions you can move

## Installation and Setup

No build process or dependencies required!

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/3d-maze-js.git
   cd 3d-maze-js
   ```

2. Open `index.html` in your browser:
   - Directly open the file in your browser
   - Or use a local server:
     ```
     npx serve
     ```
     (Requires Node.js to be installed)

## Customization

You can modify the maze size by changing the parameters in the constructor call at the end of the script:

```javascript
const game = new MazeGame(20, 20); // Width, Height
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
