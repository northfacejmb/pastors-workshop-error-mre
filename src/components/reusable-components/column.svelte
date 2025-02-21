<script lang="ts">
	import RichText from '$components/reusable-components/rich-text.svelte';
	import type { ISbRichtext } from '@storyblok/svelte';

	// Props for the rich text content of each column
	export let content: ISbRichtext;
</script>

<RichText {content} />
