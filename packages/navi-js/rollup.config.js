const resolve = require('@rollup/plugin-node-resolve');
const replace = require('@rollup/plugin-replace');
const typescript = require('@rollup/plugin-typescript');
const pkg = require('./package.json');

module.exports = [
  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'named',
    },
    plugins: [
      resolve(),
      replace({
        _VERSION: JSON.stringify(pkg.version),
        preventAssignment: true,
      }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist',
      }),
    ],
  },
  // ESM build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.mjs',
      format: 'esm',
    },
    plugins: [
      resolve(),
      replace({
        _VERSION: JSON.stringify(pkg.version),
        preventAssignment: true,
      }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
      }),
    ],
  },
]; 