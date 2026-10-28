export default {
  printWidth: 100,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'all',
  endOfLine: 'lf',
  semi: true,
  // Plugin order matters: Tailwind's plugin must come last.
  plugins: ['prettier-plugin-tailwindcss'],
  // The library stylesheet has no `@import 'tailwindcss'` of its own (by
  // design), so point the class sorter at the complete graph that Storybook
  // builds: Tailwind first, then the package styles.
  tailwindStylesheet: './.storybook/preview.css',
  tailwindFunctions: ['cn', 'cva'],
};
