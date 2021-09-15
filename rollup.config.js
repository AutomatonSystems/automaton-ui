import { terser } from "rollup-plugin-terser";
import css from 'rollup-plugin-css-only';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';
import dts from "rollup-plugin-dts";
import typescript from '@rollup/plugin-typescript';
//import replace from '@rollup/plugin-replace';
import modify from 'rollup-plugin-modify';

export default [
	{
		input: 'src/ui.ts',
		plugins: [
			typescript({
				"declaration": false,
				outDir: "./dist",
				tsconfig: './tsconfig.json'
			}),
			webWorkerLoader({targetPlatform: "browser", inline: true, preserveFileNames: true}),
			css({ output: 'dist/ui.css' }),
		], 
		output: {
			dir: 'dist',
			/*file: 'ui.js',*/
			format: 'es',
			sourcemap: true
		}
	},
	{
		input: "./build/ui.d.ts",
		output: [{ file: "dist/ui.d.ts", format: "es" }],
		plugins: [
			modify({
				find: /import ".*\.css";/,
				replace: ""
			}),
			dts()
		]
	}/*,{
		input: 'dist/ui.js',
		plugins: [
			terser()
		], 
		output: {
			file: 'dist/ui.min.js',
			format: 'es'
		}
	}*/
];