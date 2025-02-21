<script lang="ts">
	import { page } from '$app/stores';
	import { PUBLIC_STRIPE_PUBLISH_KEY } from '$env/static/public';

	import type { ContentStoryblok } from '$src/types/storyblok';
	import { storyblokEditable } from '@storyblok/svelte';
	export let blok: ContentStoryblok;
	export let i;
	export let path;
	export let color;

	const id =
		$page.data.environment === 'production' ? blok.pricing_table_id : blok.test_pricing_table_id;
</script>

{#key blok}
	<div
		class="c-pricing-table"
		use:storyblokEditable={blok}
		style="padding: {blok.padding_top_bottom || '35px'} 0 "
	>
		<script async src="https://js.stripe.com/v3/pricing-table.js"></script>
		<stripe-pricing-table pricing-table-id={id} publishable-key={PUBLIC_STRIPE_PUBLISH_KEY} />
	</div>
{/key}

<style lang="scss">
	.c-pricing-table {
		padding: 35px 0;
	}
</style>
