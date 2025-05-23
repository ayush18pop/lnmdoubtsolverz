/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        aurora: "aurora 60s linear infinite",
      },
      keyframes: {
        aurora: {
          from: {
            backgroundPosition: "50% 50%, 50% 50%",
          },
          to: {
            backgroundPosition: "350% 50%, 350% 50%",
          },
        },
      },
      colors: {
        primary: {
          DEFAULT: "#9333EA", // Purple
          light: "#A855F7",
          dark: "#7E22CE",
        },
        dark: {
          DEFAULT: "#1F2937",
          light: "#374151",
          darker: "#111827",
        },
      },
      backgroundColor: {
        "app-dark": "#111827",
        "app-light": "#1F2937",
      },
      textColor: {
        "app-light": "#F3F4F6",
        "app-dark": "#D1D5DB",
      },
    },
  },
  plugins: [],
};
