<script lang="ts">
	import type { IframeEmbedStoryblok } from '$src/types/storyblok';

	export let blok: IframeEmbedStoryblok;

	// console.log(blok);
</script>

{#key blok}
	{#if blok.iframe}
		{@html blok.iframe}
	{/if}
{/key}
