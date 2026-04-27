# Attendance Counter

A modern web-based attendance tracking application for college students. Track your attendance percentage, calculate how many classes you can skip, and manage your subjects efficiently.

## Features

- 📊 Real-time attendance percentage calculation
- 📅 Subject-wise attendance tracking
- 🎯 Target percentage goal setting
- 📈 Skip day calculations
- 💾 Local data persistence
- 📱 Responsive design

## Live Demo

The application is deployed at: [https://yourusername.github.io/attendance-counter](https://yourusername.github.io/attendance-counter)

## Development

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
```

### Deploy to GitHub Pages
```bash
npm run deploy
```

## Deployment Instructions

1. Create a new repository on GitHub named `attendance-counter`
2. Update the `homepage` field in `package.json` with your GitHub username:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/attendance-counter"
   ```
3. Push this code to your GitHub repository
4. Run `npm run deploy` to deploy to GitHub Pages
5. Enable GitHub Pages in your repository settings (source: gh-pages branch)

## Project Structure

- `src/App.tsx` - Main application component
- `src/types.ts` - TypeScript type definitions
- `src/index.css` - Global styles and Tailwind CSS
- `java_project/` - Java Swing desktop version (separate implementation)

## Technologies Used

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (icons)
- Motion (animations)
