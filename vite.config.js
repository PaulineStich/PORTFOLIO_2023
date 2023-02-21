import path from 'path';

import { createHtmlPlugin } from 'vite-plugin-html';
import { defineConfig } from 'vite';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import { ViteAliases } from 'vite-aliases';
import autoprefixer from 'autoprefixer';
import glslify from 'rollup-plugin-glslify';
import importURL from 'postcss-import-url';
import mkcert from 'vite-plugin-mkcert';
import basicSsl from '@vitejs/plugin-basic-ssl';

const htmlPreBuild = () => {
	return {
		enforce: 'pre',
		apply: 'build',
		name: 'html-pre',
		transform(htmlRaw, id) {
			let html = htmlRaw;
			html = html.replace(`<script type="module" id="___demo___">`, `<script id="___demo___">`); // disable module for ___demo___
			return html;
		},
	};
};

const htmlPostBuild = () => {
	return {
		enforce: 'post',
		apply: 'build',
		name: 'html-post',
		transformIndexHtml(htmlTransformed) {
			// using transformIndexHtml hook for output
			// https://vitejs.dev/guide/api-plugin.html#transformindexhtml
			let html = htmlTransformed;
			html = html.replace(`<script type="module" crossorigin src="/index.js"></script>`, ``); // remove genereated bundled module
			html = html.replace(`<script id="___demo___">`, `<script src="/index.js"></script>\n<script>`); // add as generic script before demo
			html = html.replace(`<script src="./assets/js/dat.gui.min.js"></script>`, ``); // remove dat gui
			return html;
		},
	};
};

export default ({ command, mode }) => {
	const DIR_SRC = path.resolve(process.cwd(), 'src');
	const DIR_PUBLIC = path.resolve(process.cwd(), 'public');
	const DIR_BUILD = path.resolve(process.cwd(), 'build');

	const IS_PRODUCTION = mode === 'production';
	const IS_API_MODE = false;

	const CONFIG = defineConfig({
		root: DIR_SRC,
		publicDir: DIR_PUBLIC,
		plugins: [
			basicSsl(),
			mkcert(),

			IS_API_MODE && IS_PRODUCTION && htmlPreBuild(),

			ViteAliases({
				allowGlobalAlias: true,
				deep: true,
				depth: 2,
				prefix: '@',
				useConfig: true,
				useRelativePaths: true,
			}),
			glslify({
				compress: false, // disable it for now until we found a better solution
			}),

			!IS_API_MODE &&
				IS_PRODUCTION &&
				createHtmlPlugin({
					minify: {
						collapseBooleanAttributes: true,
						collapseWhitespace: true,
						minifyCSS: true,
						minifyJS: true,
						minifyURLs: true,
						quoteCharacter: '"',
						removeAttributeQuotes: false,
						removeComments: true,
						removeEmptyAttributes: false,
					},
				}),

			{
				...getBabelOutputPlugin({
					presets: [['@babel/preset-env', { modules: 'commonjs', targets: { browsers: ['defaults', 'last 3 version', 'not IE > 0'] } }]],
					compact: true,
				}),
				apply: 'build',
			},

			IS_API_MODE && IS_PRODUCTION && htmlPostBuild(),
		],
		css: {
			postcss: {
				plugins: [importURL, autoprefixer],
				sourceMap: false,
				minimize: { discardComments: { removeAll: true } },
			},
		},
		server: {
			force: true,
			host: true,
			https: { maxSessionMemory: 100 },
			open: '/',
			port: 3000,
		},
		build: {
			outDir: DIR_BUILD,
			assetsDir: './',
			emptyOutDir: true,
			brotliSize: false,
			sourcemap: false,
			chunkSizeWarningLimit: 5000,
			minify: 'terser',
			terserOptions: {
				compress: { arrows: false, passes: 2 },
				ecma: 6,
				format: { comments: false },
				keep_classnames: false,
				keep_fnames: false,
			},
			cssCodeSplit: false,
			rollupOptions: {
				plugins: [],
				output: {
					manualChunks: undefined,
					entryFileNames: `[name].js`,
					chunkFileNames: `[name].[ext]`,
					assetFileNames: `[name].[ext]`,
				},
			},
		},
	});

	console.log({
		IS_PRODUCTION,
		IS_API_MODE,
		// CONFIG,
	});

	return CONFIG;
};
