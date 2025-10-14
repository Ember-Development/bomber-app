/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    // optionally shared packages:
    '../../packages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      writingMode: {
        'vertical-lr': 'vertical-lr',
      },
    },
  },
  plugins: [],
};
