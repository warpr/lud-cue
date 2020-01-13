import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default {
    input: 'lib/cue.mjs',
    output: {
        file: 'dist/lud-cue.mjs',
        format: 'esm',
    },
    plugins: [commonjs(), resolve()],
    treeshake: false,
};
