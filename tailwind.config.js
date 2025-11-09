module.exports = {
  content: ['./src/**/*.{js,liquid}'],
  safelist: [
    // Alpine/Liquid-generated classes, variants, or state classes
  ],
  theme: {
    extend: {
      colors: {
        terracotta: '#925357',
        ancientRed: '#743e44',
        black: '#111010',
        charcoal: '#232221',
        clay: '#807774',
        sonicSilver: '#7f7774',
        stone: '#d7d3cd',
        cream: '#efebe7',
        cloud: '#f9f6f4',
        white: '#ffffff',
        white2: '#f7f5f3',
        white3: '#F8F6F4',
        white4: '#EEEBE7',
        gray: '#D6D3CE',
        brown: '#6D4145',
        errorRed: '#D01C1F',
      },
      fontFamily: {
        proximaNova: ['ProximaNova', 'Arial', 'sans-serif'],
        ivar: ['IvarDisplay', 'Open Sans', 'sans-serif'],
      },
      fontSize: {
        'font-base': [
          'clamp(12px, 1rem, 20px)',
          {
            lineHeight: '1.3',
            fontWeight: '400',
          },
        ],
        'lp-nav-font': [
          'clamp(12px, 1rem, 20px)',
          {
            lineHeight: '1.3',
            fontWeight: '400',
          },
        ],
        'nav-font': [
          'clamp(10px, 1rem, 20px)',
          {
            lineHeight: '1.3',
            fontWeight: '400',
          },
        ],
        310: [
          'clamp(100px, 19.375rem, 320px)',
          {
            lineHeight: '1.2',
            fontWeight: '400',
          },
        ],
        100: [
          'clamp(64px, 6.25rem, 120px)',
          {
            lineHeight: '1',
            fontWeight: '400',
          },
        ],
        60: [
          'clamp(40px, 3.75rem, 70px)',
          {
            lineHeight: '1.1',
            fontWeight: '400',
          },
        ],
        50: [
          'clamp(40px, 3.125rem, 60px)',
          {
            lineHeight: '1.1',
            fontWeight: '400',
          },
        ],
        46: [
          'clamp(37px, 2.875rem, 50px)',
          {
            lineHeight: '1.1',
            fontWeight: '400',
          },
        ],
        36: [
          'clamp(30px, 2.25rem, 50px)',
          {
            lineHeight: '1.1',
            fontWeight: '400',
          },
        ],
        30: [
          '30px',
          {
            lineHeight: '1.1',
            fontWeight: '400',
          },
        ],
        24: [
          '24px',
          {
            lineHeight: '1.1',
            fontWeight: '400',
          },
        ],
        20: [
          '20px',
          {
            lineHeight: '1.1',
            fontWeight: '400',
          },
        ],
        18: '18px',
        16: [
          '16px',
          {
            lineHeight: '1.3',
            fontWeight: '400',
          },
        ],
        14: '14px',
      },
      container: {
        screens: {
          tablet: '910px',
        },
      },
      screens: {
        wide: {
          raw: 'only screen and (max-height: 480px) and (max-width: 960px)',
        },
        landscape: {
          raw: '(orientation: landscape)',
        },
      },
    },
  },
  variants: {},
  plugins: [],
};
