module.exports = {
  "*.{ts,tsx,js,jsx}": (files) => {
    const paths = files.map((f) => `"${f}"`).join(" ");
    return [`eslint --fix ${paths}`, `prettier --write ${paths}`];
  },
  "*.{json,css,md}": (files) => {
    const paths = files.map((f) => `"${f}"`).join(" ");
    return `prettier --write ${paths}`;
  },
};
