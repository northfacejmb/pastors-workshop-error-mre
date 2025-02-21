import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: [vitePreprocess()],

	kit: {
		adapter: adapter({
      runtime: 'nodejs20.x',
        maxDuration: 300,
        memory: 3009,
      }
    ),
    version: {
      name: Date.now().toString()
    },
		alias: {
			$components: './src/components',
			$src: './src',
			$utils: './src/utils',
      $static: 'static',
			'@storyblok/svelte': './node_modules/@storyblok/svelte'
		},
		//   vite: {
		//     define: {
		//         'process.env': process.env,
		//     },
		// },
		csp: {
			// directives: {
			// 	'script-src': ['self']
			// }
			// reportOnly: {
			//   'script-src': ['self']
			// }
		}
	}
};

export default config;
