import vue from "rollup-plugin-vue"; // Handle .vue SFC files
import buble from "rollup-plugin-buble"; // Transpile/polyfill with reasonable browser support
import scss from "rollup-plugin-scss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import postcss from "postcss";
import svg from "rollup-plugin-svg";

export default {
  input: "src/index.js", // Path relative to package.json
  output: {
    name: "DatePicker",
    exports: "named"
  },
  plugins: [
    scss({
      output: "dist/styles.css",
      processor: css =>
        postcss([autoprefixer, cssnano])
          .process(css, { from: undefined })
          .then(result => result.css)
    }),
    vue({
      css: true, // Dynamically inject css as a <style> tag
      compileTemplate: true // Explicitly convert template to render function
    }),
    buble({
      exclude: "src/assets/**"
    }), // Transpile to ES5
    svg()
  ]
};
