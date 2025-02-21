<script lang="ts">
	export let items: any[] | any = [];
	export let label: string;
	export let color: string = '#954500';
	let truncate = 5;
	let showAll = false;

	$: itemsArray = Array.isArray(items) ? items : [items];
	$: filteredItems = showAll ? itemsArray : itemsArray.slice(0, truncate);
</script>

{#key itemsArray}
	{#if itemsArray.length}
		<div class="c-meta">
			<div class="text-label">
				{label}
				{#if itemsArray.length > 1}
					<span class="num">(<span style:color>{itemsArray.length}</span>)</span>
				{/if}
			</div>
			<ul class="values">
				{#each filteredItems as item}
					{#if item && item.name}
						<li class="value">
							<slot name="itemSlot" {item}>
								<a href="/{item.full_slug}" style:color>{item.name}</a>
							</slot>
						</li>
					{/if}
					{#if item && item.book && item.book.name}
						<li class="value">
							<slot name="itemSlot" {item}>
								<a href="/{item.book.full_slug}" style:color>{item.book.name}</a>
							</slot>
						</li>
					{/if}
				{/each}
				{#if itemsArray.length > truncate && !showAll}
					<li class="value more">
						<button
							on:click={() => {
								showAll = true;
							}}
							style:color>Show All</button
						>
					</li>
				{/if}
			</ul>
		</div>
	{/if}
{/key}

<style lang="scss">
	.c-meta {
		.text-label {
			white-space: nowrap;
		}
		.values {
			display: flex;
			flex-wrap: wrap;
		}
		.value {
			gap: 5px;
			white-space: nowrap;
			display: flex;
			align-items: center;
			justify-content: flex-start;
			font-size: 15px;

			&::after {
				content: '';
				display: inline-block;
				width: 2px;
				height: calc(100% - 5px);
				margin-right: 5px;
				background-color: var(--c-tan);
			}

			&:last-child {
				&::after {
					display: none;
				}
			}

			a {
				display: inline-block;
				margin: 0;
				padding: 0;
			}

			&.more {
				button {
					transform: translateY(2px);
					font-family: var(--font-display);
					line-height: 18px;
					cursor: pointer;
					&:hover,
					&:focus {
						text-decoration: underline;
					}
				}
			}
		}
	}
</style>
