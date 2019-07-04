import typescript from 'rollup-plugin-typescript2';

// read output targets from package
import pkg from './package.json';

// set the shebang line in front to force npm binary to use node
const banner = '#!/usr/bin/env node';

export default {
  input: 'src/index.ts',
  output: [
    {
      banner,
      file: pkg.main,
      format: 'cjs'
    },
    {
      banner,
      file: pkg.module,
      format: 'es'
    }
  ],
  context: 'global',
  external: [
    'chalk',
    'node-fetch',
    'path',
    'url',
    ...Object.keys(pkg.dependencies || {})
  ],
  plugins: [
    typescript()
  ]
};
