const path = require("path");

const nodeEnv = process.env.NODE_ENV;

/** @type {import("webpack").Configuration} */
module.exports = {
   mode: nodeEnv,
   entry: "./src/index.ts",
   output: {
      filename: "bundle.js",
      path: path.join(__dirname, "dist"),
   },
   module: {
      rules: [
         {
            test: /\.ts$/,
            use: "ts-loader"
         }
      ]
   },
   resolve: {
      extensions: [".ts", ".js"],
   }
}