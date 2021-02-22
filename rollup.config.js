import { terser } from "rollup-plugin-terser";
import css from 'rollup-plugin-css-only';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';

export default [
	{
		input: 'main.js',
		plugins: [
			webWorkerLoader({targetPlatform: "browser", }),
			css({ output: 'dist/ui.css' }),
		], 
		output: {
		  file: 'dist/ui.js',
		  format: 'es'
		}
	},{
		input: 'main.js',
		plugins: [
			webWorkerLoader({targetPlatform: "browser", }),
			css({ output: 'dist/ui.css' }),
			terser()
		], 
		output: {
		file: 'dist/ui.min.js',
		format: 'es'
		}
	}
];