import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#08070f",
        night: "#12101f",
        mist: "#d7d5e7",
        acid: "#b9ff66",
        pulse: "#ff4f87",
        signal: "#72e8ff"
      },
      boxShadow: {
        glow: "0 0 36px rgba(114, 232, 255, 0.22)",
        rose: "0 0 46px rgba(255, 79, 135, 0.2)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" }
        },
        scan: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        scan: "scan 5s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
