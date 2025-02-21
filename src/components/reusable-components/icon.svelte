<script lang="ts">
	const icons = import.meta.glob('$src/assets/icons/*.svg', { as: 'raw', eager: true });

	export let name: string = 'xyz';
	export let cssClass: string = '';
	export let viewBox: string = '0 0 24 24';
	export let width: string = '24px';
	export let currentColor: string = 'currentColor';

	let icon = '';
	for (const path in icons) {
		const regex = new RegExp(`\/${name}\.svg$`);
		if (regex.test(path)) {
			icon = icons[path];
			viewBox = extractViewBox(icon);
		}
	}

	$: elements = icon.replace(/<svg[ \n]([^>]*)>/, '').replace('</svg>', '');

	function extractViewBox(svg: string) {
		const regex = /viewBox="([\d\- \.]+)"/;
		const res = regex.exec(svg);
		if (!res) return viewBox;
		return res[1];
	}
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	class={`icon ${cssClass}`}
	{viewBox}
	{width}
	fill={currentColor}
>
	{@html elements}
</svg>
