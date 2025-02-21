<script lang="ts">
	import ButtonLink from '$components/reusable-components/button-link.svelte';
	import Citation from '$components/reusable-components/citation.svelte';
	import Image from '$components/reusable-components/image.svelte';
	import RichText from '$components/reusable-components/rich-text.svelte';
	import type { TextSidebarStoryblok } from '$src/types/storyblok';
	import { GetUrl } from '$src/utils/general';
	import { storyblokEditable } from '@storyblok/svelte';

	export let blok: TextSidebarStoryblok;
	export let i: number = 0;
	export let color: string = '';
	export let path = '';

	// $: hasImage =
	// 	(blok.image && blok.image.filename) ||
	// 	(blok.unsplash && blok.unsplash.image && blok.unsplash.image.urls);
</script>

{#key blok}
	<div
		class="c-text-sidebar main-wrapper"
		style:background-color={blok.background_color}
		use:storyblokEditable={blok}
		style:padding-top={blok.spacing}
		style:padding-bottom={blok.spacing}
		style={`--series-color: ${blok.override_pareng_color ? blok.text_color : color};`}
	>
		<div
			class="max-width wrapper {blok.sidebar_right === undefined || blok.sidebar_right
				? ''
				: 'reverse'}"
		>
			<div class="text-block" style:color={blok.text_color}>
				<RichText content={blok.content} centered={blok.justification === 'center'} />
			</div>
			{#if blok.sidebar && blok.sidebar.length}
				<aside
					style:background-color={blok.sidebar_background_color}
					style:color={blok.sidebar_text_color}
					class="sidebar"
				>
					{#each blok.sidebar as item, i}
						{#if item.component === 'image'}
							<div
								class="image-wrap"
								style={blok.max_image_size ? `max-width: ${blok.max_image_size}px;` : ''}
							>
								<Image image={item.image} />
							</div>
						{/if}
						{#if item.component === 'button'}
							<ButtonLink
								label={item.label}
								link={GetUrl(item.link)}
								btnStyle={item.style}
								btnColor={item.color}
							/>
						{/if}
						{#if item.component === 'link'}
							<a href={GetUrl(item.link_url)} class="sidebar-link">
								<span>{item.title || 'Label'}</span>
							</a>
						{/if}
						{#if item.component === 'text'}
							<div class="full-width">
								<RichText content={item.content} centered={blok.justification === 'center'} />
							</div>
						{/if}
						{#if item.component === 'citation'}
							<Citation citation={item} />
						{/if}
						{#if item.component === 'divider'}
							Divider
						{/if}
					{/each}
				</aside>
			{/if}
		</div>
	</div>
{/key}

<style lang="scss">
	.main-wrapper {
		display: flex;
		position: relative;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		padding: 0 35px;
	}

	.wrapper {
		gap: 60px;
		display: flex;
		width: 100%;
		padding: 10px;
		&.reverse {
			flex-direction: row-reverse;
			@include breakpoint('tablet') {
				flex-direction: column;
			}
		}

		@include breakpoint('tablet') {
			flex-direction: column;
			aside {
				width: 100%;
			}
		}
	}

	.text-block {
		width: 100%;
		flex: 1 1 100%;
	}

	.sidebar {
		gap: 30px;
		display: flex;
		width: 300px;
		flex: 0 0 300px;
		flex-direction: column;
		align-items: center;
		overflow: hidden;
		padding: 30px;
		border-radius: 8px;
		background-color: var(--c-cream);
		.full-width {
			width: 100%;
		}
		.image-wrap {
			width: 100%;
			height: auto;
			overflow: hidden;
			border-radius: 8px;
		}

		@include breakpoint('tablet') {
			flex: 1 1 auto;
			margin: 0 -35px;

			.week-nav {
				display: none;
			}
		}
	}

	.sidebar-link {
		font-size: 20px;
	}
</style>
