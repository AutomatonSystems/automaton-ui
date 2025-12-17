import css from 'rollup-plugin-css-only';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';
import typescript from '@rollup/plugin-typescript';
import eol from 'rollup-plugin-eol';
import terser from '@rollup/plugin-terser';

export default [
	{
		input: 'src/ui.ts',
		plugins: [
			typescript({
				"declaration": true,
				tsconfig: './tsconfig.json'
			}),
			webWorkerLoader({targetPlatform: "browser", inline: true, preserveFileNames: true}),
			css({ output: 'ui.css' }),
			eol({
				outputFiles: true,
				watchFiles: true,
			}),
		], 
		output: {
			dir: 'dist',
			/*file: 'ui.js',*/
			format: 'es',
			sourcemap: true
		}
	},{
		input: 'dist/ui.js',
		plugins: [
			terser()
		], 
		output: {
			file: 'dist/ui.min.js',
			format: 'es'
		}
	}
];