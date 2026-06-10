# 🚀 Space War Game

Welcome to **Space War**, an action-packed 2D top-down space arcade shooter built with **Next.js**, **React**, and **HTML5 Canvas**. Pilot advanced starfighters, purchase upgrades in the Hangar, and battle challenging alien forces!

---

## 🌌 Key Features

* **Universal Viewport Responsiveness**: Fully scalable layouts that adapt to laptops, desktops, tablets, iPads, and mobile devices.
* **Landscape Orientation warning Overlay**: Displays a beautiful full-screen rotation warning overlay in portrait mode, auto-hiding when held horizontally.
* **Split Touch Screen Controllers**: Two-handed D-pads (Left/Down on the left; Up/Right on the right) and flanking active ability buttons positioned for thumb reaches, optimized to automatically hide on mouse-based desktops.
* **Programmatic Screen Lock**: Safely locks the viewport orientation to landscape using HTML5 fullscreen and Screen Orientation APIs when launching a game on touch devices.
* **Dynamic Hangar UI**: High-definition, scrollable hangar cards scaling down dynamically on lower-height monitors and mobile phones.
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
11. **White Titan Vulcan** (Level 100) - *Heavy Dreadnought* (Color: `#ffffff`)

---

## 🎮 How to Play

### 🎹 Keyboard Controls (Desktops & Laptops)
* **Move Left/Right/Up/Down**: `A`, `S`, `D`, `W` or `Arrow Keys`
* **Activate Ability**: `Spacebar`, `Shift`, `F`, or `E` key
* **Pause / Menu**: `Escape` key

### 📱 Touch Controls (Mobiles & Tablets)
* **Move Aircraft**: Use the split glassmorphic D-pad controls on the left and right edges.
* **Activate Ability**: Tap the flanking ability buttons matching your craft's special weapon.
* **Play Area**: Touch and drag anywhere on the canvas if you prefer direct tracking movement.

---

## 🛠️ Getting Started & Run Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/AmarKumarMandal/Space-War-Game.git
cd Space-War-Game
npm install
```

### Running in Development Mode
Start the local Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser to play the game!

### Building for Production
Build the production bundle and start the production server:
```bash
npm run build
npm start
```
