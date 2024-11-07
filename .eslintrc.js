const { SemicolonPreference } = require("typescript")

module.exports = {
  extends: ["expo", "prettier"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": [
      "error",
      {
        endOfLine: "semi",
        semi: false,
      },
    ],
  },
}
