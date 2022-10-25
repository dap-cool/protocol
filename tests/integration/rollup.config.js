import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

export default {
    input: './src/index.js',
    output: {
        file: './dist/bundle.js',
        format: 'es'
    },
    plugins: [
        commonjs(),
        nodePolyfills(
            {
                include: ['buffer']
            }
        ),
        resolve({
            browser: true,
            preferBuiltins: false
        }),
        typescript(
            {target: "es2019"}
        ),
        json()
    ]
};
