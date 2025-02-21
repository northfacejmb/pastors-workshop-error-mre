<script lang="ts">
	import Citation from '$components/reusable-components/citation.svelte';
	import type { CitationStoryblok } from '$src/types/storyblok';

	export let citations: CitationStoryblok[];
	export let color: string = '#000000';
	export let scale: number = 1;
</script>

{#if citations && citations.length}
	{#each citations as citation}
		<Citation {citation} {color} {scale} />
	{/each}
{/if}

<style lang="scss">
</style>
