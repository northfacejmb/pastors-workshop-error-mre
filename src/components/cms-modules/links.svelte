<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';
	import type { LinksStoryblok } from '$src/types/storyblok';

	export let blok: LinksStoryblok;

	// console.log(blok);
</script>

{#key blok}
	<div use:storyblokEditable={blok} class="links">
		<h3 class="title-md">{blok.label}</h3>
		<ul class="links-list">
			{#each blok.links as link}
				<!-- <pre>{JSON.stringify(link, 0, 2)}</pre> -->
				<a href="/{link.full_slug}" class="sidebar-link">
					<span>{link.name || 'Label'}</span>
				</a>
			{/each}
		</ul>
	</div>
{/key}

<style lang="scss">
</style>
