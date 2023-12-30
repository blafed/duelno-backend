const path = require("path")

module.exports = {
  entry: "./dist/server/main.js",
  output: {
    filename: "main.bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    fallback: {
      bufferutil: false,
      "utf-8-validate": false,
    },
  },
  target: "node",
}
