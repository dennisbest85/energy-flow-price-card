import resolve from "@rollup/plugin-node-resolve";

export default {
  input: "src/energy-flow-price-card.js",
  output: {
    file: "dist/energy-flow-price-card.js",
    format: "es",
    inlineDynamicImports: true,
  },
  plugins: [resolve()],
};
