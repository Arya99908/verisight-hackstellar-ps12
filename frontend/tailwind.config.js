/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        workbench: {
          canvas: "#070b14",
          card: "#0d1527",
          panel: "#0f172a",
          border: "#1e293b",
          highlight: "#1e2942",
          text: "#f1f5f9",
          muted: "#94a3b8",
        },
        forensic: {
          cyan: "#38bdf8",
          emerald: "#10b981",
          crimson: "#f43f5e",
          amber: "#f59e0b",
          purple: "#c084fc",
          magenta: "#ec4899",
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
