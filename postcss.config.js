export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      overrideBrowserslist: [
        'iOS >= 12',
        'Safari >= 12',
        'last 2 versions',
        '> 1%',
        'not dead'
      ],
      flexbox: 'no-2009',
      grid: 'autoplace'
    },
  },
};
