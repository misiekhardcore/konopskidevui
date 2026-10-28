export default {
  '*.{ts,tsx,mjs}': ['eslint --fix --max-warnings=0', 'prettier --write'],
  '*.{css,md,json,yaml,yml}': ['prettier --write'],
};
