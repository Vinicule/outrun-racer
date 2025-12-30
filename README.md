Outrun Racer

A retro-style pseudo-3D arcade racing game built with vanilla JavaScript and HTML5 Canvas. Made as a final year project, it features a custom raster-based rendering engine to simulate depth and speed without using 3D libraries.

## Current Features

* **Pseudo-3D Engine:** Custom scanline-based rendering for curves, hills, and perspective.
* **Dynamic Environment:**
    * Day/Night cycles (sky changes).
    * Weather effects (rain animation and screen filtering).
    * Road assets including billboards, trees, and start lights.
* **Game Loop:**
    * **Main Menu:** Select track, difficulty, opponent count, and audio settings.
    * **Race Sequence:** Animated start lights countdown (3-2-1-GO).
    * **Pause Menu:** Resume, Restart, Volume Control, and Exit options.
    * **Result Screen:** Final position and total time display.
* **Physics & Gameplay:**
    * Centrifugal force on curves.
    * Off-road deceleration.
    * Collision detection with opponents and roadside objects.
    * Lap timing and real-time position tracking (e.g., "POS 1/12").
* **Audio:** Music playback with volume control and mute functionality.

##  How to Run

1.  **Clone or Download** the repository.
2.  Open `index.html` in a modern web browser (Chrome, Firefox, Edge).
    * *Note:* For modules to load correctly, you may need to run this through a local server (VS Code "Live Server" extension, Python `http.server`, or Node `http-server`).

##  Project Structure

* `index.html`: Main entry point.
* `js/main.js`: Game loop and initialization.
* `js/director.js`: Manages game state (racing, paused, finished), timer, and rules.
* `js/road.js`: Handles track segment generation, geometry, and physics calculations.
* `js/render.js`: Drawing logic for sprites, shapes, and text.
* `js/player.js`: Player car physics, input handling, and rendering.
* `js/opponent.js`: AI behavior, speed correction, and collision logic.
* `js/menu.js`: Main menu and pause menu UI logic.
* `js/util.js`: Helper functions, constants, and static data (tracks, drivers).

## To Implement in the future:

### Visuals & Polish
- [ ] **Parallax Backgrounds:** Multi-layered scrolling backgrounds (distant mountains moving slower than nearby hills).
- [ ] **Sprite Scaling Smoothness:** Improve sprite scaling to reduce "popping" as objects get closer.

### Audio
- [ ] **Engine Sounds:** Pitch-shifted engine noise based on speed/RPM.
- [ ] **Tire Screech:** Sound effect triggered by high centrifugal force.
- [ ] **Menu SFX:** Confirmation sounds for UI navigation.

### Gameplay Mechanics
- [ ] **Turbo/Nitro Boost:** A limited-use speed boost mechanic with visual effects (flames/blur).
- [ ] **Time Extension Mode:** Arcade-style mode with a countdown where checkpoints add time.
- [ ] **Drifting Mechanic:** Allow the car to slide more dramatically for bonus speed or points.

### Data & Persistence
- [ ] **High Scores:** Save best lap times to `localStorage`.
- [ ] **Track Editor:** A simple JSON editor to allow users to create custom track layouts.
