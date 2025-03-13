import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',      // App Router files
    './pages/**/*.{js,ts,jsx,tsx,mdx}',     // Pages Router files
    './components/**/*.{js,ts,jsx,tsx,mdx}', // Component files
  ],
  theme: {
    extend: {
      colors: {
        custom: '#36c4c5', // Example custom color
      },
    },
  },
  plugins: [],
};

export default config;