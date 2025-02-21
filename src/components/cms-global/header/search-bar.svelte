<script lang="ts">
	import Icon from '$components/reusable-components/icon.svelte';
	import { tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let open = false;
	let expand = false;
	let searchInputEl: HTMLInputElement;
	let searchTerm = $page.url.searchParams.get('q') || '';

	const toggleSearch = () => {
		open = !open;
		if (open) {
			tick().then(() => {
				searchInputEl.focus();
				expand = true;
			});
		} else {
			expand = false;
		}
	};

	function searchBtnTransition(node: HTMLElement, { delay = 0, duration = 0 }) {
		return {
			delay,
			duration,
			css: (t: number) => `
        opacity: ${t};
        transform: translateX(${50 * (1 + t)}px);`
		};
	}

	const search = () => {
		goto(`/search?q=${encodeURIComponent(searchTerm)}`);
	};
</script>

<div class="search-bar max-width {open ? 'open' : ''}">
	{#if open}
		<div class="search-wrap">
			<div class="icon-wrap">
				<Icon width="14px" name="search" />
			</div>
			<input
				bind:this={searchInputEl}
				bind:value={searchTerm}
				on:keydown={(e) => {
					if (e.key === 'Enter') search();
					if (e.key === 'Escape') toggleSearch();
				}}
				class="search-input {expand ? 'expand' : ''}"
				type="text"
			/>
			<button class="search-btn" on:click={search}><span>Search</span></button>
			<button class="close-btn-mobile show-tablet" on:click={toggleSearch}
				><Icon width="14px" name="x-icon" />Close</button
			>
		</div>
	{/if}

	{#if !open}
		<button class="search-toggle {open ? 'open' : ''}" on:click={toggleSearch}>
			<div class="hide-tablet">
				<Icon width="14px" name="search" />
			</div>
			<div class="show-tablet">
				<Icon width="24px" name="search" />
			</div>
			<span class="text hide-tablet">Search</span>
			<div class="blue-animate hide-tablet" />
		</button>
	{/if}

	{#if open}
		<button class="close-btn hide-tablet" on:click={toggleSearch}
			><Icon width="14px" name="x-icon" />Close</button
		>
	{/if}
</div>

<style lang="scss">
	.search-bar {
		display: flex;
		justify-content: flex-end;
		margin-top: 36px;
		@include breakpoint('tablet') {
			position: absolute;
			z-index: 1;
			top: 14px;
			right: 30px;
			left: 30px;
			width: auto;
			justify-content: flex-start;
			color: var(--c-white);

			&.open {
				z-index: 6;
			}
		}
	}
	.search-toggle {
		gap: 8px;
		display: flex;
		position: relative;
		width: 170px;
		height: 40px;
		align-items: center;
		justify-content: center;
		color: var(--c-blue-600);
		font-size: 12px;
		font-weight: bold;
		cursor: pointer;
		transition: color 75ms ease;
		:first-child {
			height: 15px;
		}
		.text {
			height: min-content;
			line-height: 0.8;
		}

		.blue-animate {
			position: absolute;
			z-index: -1;
			inset: 0;
			transform: scaleX(0.7);
			transform-origin: center;
			border-radius: 999px;
			background-color: transparent;
			transition: transform 150ms ease-out, background-color 100ms ease;
		}

		&:hover,
		&:focus,
		.open {
			color: var(--c-white);
			.blue-animate {
				transform: scaleX(1);
				background-color: var(--c-blue-600);
			}
		}
		@media (max-width: 1500px) {
			width: 128px;
		}

		@include breakpoint('tablet') {
			width: 40px;
			height: 40px;
			color: var(--c-white);
		}
	}

	.close-btn {
		gap: 8px;
		display: flex;
		position: relative;
		align-items: center;
		justify-content: center;
		margin-left: 14px;
		padding: 0 16px;
		color: var(--c-blue-600);
		font-size: 12px;
		font-weight: bold;
		line-height: 39px;
		border-radius: 999px;
		cursor: pointer;
		transition: all 125ms ease;

		&::after {
			content: '';
			display: block;
			position: absolute;
			z-index: -1;
			inset: 0;
			border-radius: 999px;
			background-color: transparent;
			transition: all 125ms ease;
		}

		&:hover,
		&:focus,
		.open {
			color: var(--c-white);
			background-color: var(--c-blue-600);

			&::after {
				inset: 0 -4px;
				background-color: var(--c-blue-600);
			}
		}
	}

	.search-wrap {
		gap: 20px;
		display: flex;
		height: 39px;
		padding: 0 0 0 20px;
		color: var(--c-white);
		border-radius: 999px;
		background-color: var(--c-blue-600);

		.icon-wrap {
			display: flex;
			flex: 0 0 auto;
			align-items: center;
			justify-content: center;
		}
		@include breakpoint('tablet') {
			gap: 3px;
			width: 100%;
			color: var(--c-blue-600);
			background-color: var(--c-white);
		}
	}

	.search-btn {
		gap: 8px;
		display: flex;
		position: relative;
		align-items: center;
		justify-content: center;
		margin: -5px;
		padding: 0 16px;
		color: var(--c-black);
		font-size: 12px;
		font-weight: bold;
		line-height: 39px;
		border: 4px solid var(--c-white);
		border-radius: 999px;
		background-color: var(--c-yellow);
		cursor: pointer;
		transition: all 125ms ease;

		> span {
			position: relative;
			z-index: 3;
		}

		&::after {
			content: '';
			display: block;
			position: absolute;
			inset: -4px;
			border: 4px solid var(--c-white);
			border-radius: 999px;
			background-color: transparent;
			transition: all 125ms ease;
		}

		&:hover,
		&:focus {
			color: var(--c-white);
			background-color: var(--c-black);

			&::after {
				inset: -4px -8px;
				background-color: var(--c-black);
			}
		}

		@include breakpoint('tablet') {
			margin: 3px;
			border: 0px solid var(--c-white);
			&::after {
				display: none;
			}
		}
	}

	.close-btn-mobile {
		gap: 8px;
		display: flex;
		position: relative;
		align-items: center;
		justify-content: center;
		margin: 3px;
		padding: 0 16px;
		color: var(--c-blue-600);
		font-size: 12px;
		font-weight: bold;
		line-height: 39px;
		border: 2px solid var(--c-blue-600);
		border-radius: 999px;
		cursor: pointer;
	}

	.search-input {
		width: 0px;
		flex: 1 1 100%;
		color: var(--c-white);
		font-size: 14px;
		font-weight: bold;
		border: none;
		background-color: transparent;
		transition: width 200ms ease-out;
		&:focus {
			outline: none;
		}
		&.expand {
			width: 570px;
		}
		@include breakpoint('tablet') {
			padding-left: 10px;
			color: var(--c-blue-600);
			&.expand {
				width: 100%;
			}
		}
	}
</style>
