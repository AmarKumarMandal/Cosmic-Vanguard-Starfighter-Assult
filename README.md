# 🚀 Cosmic Vanguard Starfighter Assault

Welcome to **Cosmic Vanguard Starfighter Assault**, an action-packed 2D top-down space arcade shooter built with **Next.js**, **React**, and **HTML5 Canvas**. Pilot advanced starfighters, purchase upgrades in the Hangar, and battle challenging alien forces!

---

## 🌌 Key Features

* **Universal Viewport Responsiveness**: Fully scalable layouts that adapt to laptops, desktops, tablets, iPads, and mobile devices.
* **Fixed Virtual Resolution (1600x900)**: Coordinates, aircraft sizes, speeds, and gameplay physics are virtualized at a fixed 1600x900 resolution and scaled dynamically. This prevents player/enemy ships from looking oversized on compact viewports and keeps gameplay identical across all screens.
* **Automatic Viewport Rotation in Portrait**: Automatically applies a 90-degree CSS rotation and maps touch coordinate translations on portrait devices to simulate landscape mode without forcing the user to physically rotate their screen.
* **Split Touch Screen Controllers**: Two-handed D-pads (Left/Down on the left; Up/Right on the right) and flanking active ability buttons positioned for thumb reaches, optimized to automatically hide on mouse-based desktops.
* **Programmatic Screen Lock**: Safely locks the viewport orientation to landscape using HTML5 fullscreen and Screen Orientation APIs when launching a game on touch devices.
* **Dynamic Hangar UI**: High-definition, scrollable hangar cards scaling down dynamically via a CSS Grid reordering system with proportional layout rules to prevent overflows on mobile/tablet viewports.
* **Sleek Audio Controller**: A side-by-side Play/Pause (in-game) and Mute/Unmute bar designed to match the theme. Includes a hover-expand volume slider that collapses when not in use.
* **Pure Unidirectional Audio State Sync**: Drives state changes entirely from custom event streams emitted by the Web Audio `SoundManager` singleton, guaranteeing that the Play/Pause UI state remains in perfect sync with the playback engine upon page reloads.
* **Caps Lock / Casing-Independent Keyboard Input**: Key listeners automatically normalize single-character keyboard inputs to lowercase. Pilot WASD movement and active abilities function flawlessly regardless of Caps Lock or Shift states.
* **Stuck Movement Key Fix**: Clears both uppercase and lowercase states on keyup, with a global window blur listener that flushes active inputs when switching tabs or window focus.
* **Unified Cross-Device Controls**: Integrates physical keyboard, touch gestures (swipes), and mouse inputs under a single controls layout (Up/Down Arrows, Enter, M Mute, Backspace/Escape, +/- Volume).
* **Controls Mappings Sheet**: An interactive high-fidelity keyboard controls panel visible only on keyboard-based layouts (PC/Laptop) between Hangar and Exit options. Automatically hidden on touch-only mobile/tablet viewports.
* **Swipe Gesture Navigation**: Swiping Up/Down on touch screens automatically scrolls selection highlights in main and pause menus.
* **12 Unique Playable Ships**: Choose from basic scout ships to heavy prototype dreadnoughts, each with specialized stats, custom weapons, and levels.
* **Procedural Engine Flame Rendering**: Dynamic canvas-based rocket thruster flames that flicker organically in real-time, custom-aligned to match each starship's design and colors.
* **Smooth 2D Canvas Controls**: High frame rate rendering with responsive keyboard, mouse, and touch event handling.

---

## 🛸 Starship Fleet Catalog

Here is the current lineup of starfighters available in the Hangar:

1. **A1-CYAN** (Level 1) - *Basic Attack* (Color: `#66fcf1`)
2. **Z-51 gen 1st** (Level 20) - *Prototype Heavy* (Color: `#ffd700` - Sun Gold/Orange engine)
3. **Lightning Ice Storm** (Level 30) - *Ice Storm Scout* (Color: `#00e5ff`)
4. **Z-51 gen 2nd** (Level 50) - *Maximum Overdrive* (Color: `#e84545`)
5. **Spectre** (Level 60) - *Plasma Fighter* (Color: `#00ff00` - Neon Green engine)
6. **Ghost** (Level 70) - *Stealth* (Color: `#a020f0`)
7. **Apex** (Level 80) - *Elite Strike* (Color: `#ff6600`)
8. **Gold Eagle** (Level 90) - *Elite Interceptor* (Color: `#ffd700`)
9. **Reaper** (Level 100) - *Death Assault* (Color: `#ff0033`)
10. **Phantom 7** (Level 100) - *Brawler* (Color: `#00ff00`)
11. **White Titan Vulcan** (Level 100) - *Heavy Dreadnought* (Color: `#ffffff` - 4-layered thruster system)

---

## 🎮 How to Play

### 🎹 Keyboard Controls (Desktops & Laptops)
* **Move Left/Right/Up/Down**: `A`, `S`, `D`, `W` or `Arrow Keys`
* **Activate Ability**: `Spacebar`, `Shift`, `F`, or `E` key
* **Select / Confirm**: `Enter` key
* **Pause / Back / Menu**: `Escape` or `Backspace` keys
* **Mute / Unmute Track**: `M` key
* **Adjust Soundtrack Volume**: `+` (or `=`) and `-` keys

### 📱 Touch Controls (Mobiles & Tablets)
* **Move Aircraft**: Use the split glassmorphic D-pad controls on the left and right edges, or drag anywhere on the screen.
* **Menu Navigation**: Swipe Up/Down to cycle selection highlights.
* **Select / Confirm**: Tap on button options.
* **Unblock Music**: Tap the pulsing overlay prompt on load/refresh.

---

## 🛠️ Getting Started & Run Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/AmarKumarMandal/Cosmic-Vanguard-Starfighter-Assault.git
cd Cosmic-Vanguard-Starfighter-Assault
npm install
```

### Running in Development Mode
Start the local Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your web browser to play the game!

### Building for Production
Build the production bundle and start the production server:
```bash
npm run build
npm start
```
