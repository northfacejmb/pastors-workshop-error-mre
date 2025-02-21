<script lang="ts">
	import type { ContentStoryblok } from '$src/types/storyblok';
	import { storyblokEditable } from '@storyblok/svelte';

	export let blok: ContentStoryblok;
	const code = blok.embed_code;
</script>

{#key blok}
	<div class="c-embed" use:storyblokEditable={blok}>
		{@html code}
	</div>
{/key}

<style lang="scss">
	.c-embed {
	}
</style>
