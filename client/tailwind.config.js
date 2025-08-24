/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    patterns: {
      opacities: {
          100: "1",
          80: ".8",
          60: ".6",
          40: ".4",
          20: ".2",
          10: ".1",
          5: ".05",
      },
      sizes: {
          1: "0.25rem",
          2: "0.5rem",
          4: "1rem",
          6: "1.5rem",
          8: "2rem",
          12: "3rem",
          16: "4rem",
          20: "5rem",
          24: "6rem",
          32: "8rem",
      }
  },
    extend: {
      boxShadow: {
        'custom': 'rgba(17, 17, 26, 0.1) 0px 0px 16px',
      },
      fontSize: {
        '10xl': '10rem',
        '11xl': '11rem',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        bebas: ['Bebas Neue', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'], // Add this line for Roboto font
      },
      colors: {
        customGray: '#999190',
        GrayDark: '#726968',
        YellowDark: '#F0DC13',
        Graytext: '#7A7A7A',
        DarkYellow : '#FDBE10',
        DarkOrange:'#FDBE10',
        GrayFoot:'#565656',
        YellowPoint :'#FDBE10',
        GrayBar:'#8B7F7E',
        YellowLight:'#FDBE10',
        DarkBlue :'#243670'
      },
      backgroundImage: {
        'stripes': "linear-gradient(45deg, #FDBE10 25%, transparent 25%, transparent 50%, #FDBE10 50%, #FDBE10 75%, transparent 75%, transparent)",
      },
      backgroundSize: {
        'stripes': '10px 10px',
      },
      borderWidth: {
        40: '40px',
        20: '20px',
      },
    },
  },
  plugins: [
    require('tailwindcss-bg-patterns'),
  ],

}
