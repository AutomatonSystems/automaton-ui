// import { terser } from "rollup-plugin-terser";
import css from 'rollup-plugin-css-only';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';

export default {
	input: 'main.js',
	plugins: [
		webWorkerLoader({targetPlatform: "browser", }),
		css({ output: 'dist/ui.css' })
		//terser() //disabled until https://github.com/terser/terser/issues/567 resolves and feeds up into the plugin
	], 
	output: {
	  file: 'dist/ui.js',
	  format: 'es'
	}
  };