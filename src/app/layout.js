import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Cosmic Vanguard Starfighter Assault",
  description: "A premium Next.js 2D Arcade Space Shooter using HTML5 Canvas",
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical UI assets */}
        <link rel="preload" href="/Game Title.png" as="image" />
        <link rel="preload" href="/menu_background.png" as="image" />
        <link rel="preload" href="/galaxy%201.jpg" as="image" />
        <link rel="preload" href="/galaxy%202.jpg" as="image" />
        <link rel="preload" href="/galaxy%203.jpg" as="image" />
        <link rel="preload" href="/galaxy%204.jpg" as="image" />
        <link rel="preload" href="/warning_alarm.mp3" as="audio" />
        
        {/* Preload player craftship images for instant hangar/game load */}
        <link rel="preload" href="/player%20craftship/A1-CYAN.png" as="image" />
        <link rel="preload" href="/player%20craftship/Z-51%20gen%201.png" as="image" />
        <link rel="preload" href="/player%20craftship/Lightning_Ice_storm.png" as="image" />
        <link rel="preload" href="/player%20craftship/Z-51%20gen%202.png" as="image" />
        <link rel="preload" href="/player%20craftship/Spectre.png" as="image" />
        <link rel="preload" href="/player%20craftship/Ghost.png" as="image" />
        <link rel="preload" href="/player%20craftship/Apex.png" as="image" />
        <link rel="preload" href="/player%20craftship/Shadow%20Stealth-Spectre.png" as="image" />
        <link rel="preload" href="/player%20craftship/Gold_Eagle.png" as="image" />
        <link rel="preload" href="/player%20craftship/Reaper.png" as="image" />
        <link rel="preload" href="/player%20craftship/Phantom%207.png" as="image" />
        <link rel="preload" href="/player%20craftship/White_Titan_Vulcan.png" as="image" />
        <link rel="preload" href="/player%20craftship/Drone.png" as="image" />
        <link rel="preload" href="/player%20craftship/sting_missile.png" as="image" />
      </head>
      <body className={outfit.className}>{children}</body>
    </html>
  );
}
