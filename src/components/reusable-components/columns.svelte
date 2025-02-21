<script lang="ts">
	import Column from '$components/reusable-components/column.svelte';

	// Props for an array of rich text content for each column
	export let blok: any[];
</script>

<div class="columns">
	{#if blok.columns && blok.columns.length}
		{#each blok.columns as columnContent}
			<div class="column">
				<Column content={columnContent.column} />
			</div>
		{/each}
	{/if}
</div>

<style lang="scss">
	.columns {
		gap: 20px;
		display: flex;
	}
	.column {
		flex: 1;
	}
</style>
