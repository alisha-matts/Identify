import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#3f3947",
        night: "#ffffff",
        mist: "#6d6374",
        acid: "#c8ef5f",
        pulse: "#f3a6d6",
        signal: "#91dff1"
      },
      boxShadow: {
        glow: "0 18px 48px rgba(145, 223, 241, 0.22)",
        rose: "0 18px 48px rgba(243, 166, 214, 0.22)"
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
