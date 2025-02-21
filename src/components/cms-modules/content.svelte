<script lang="ts">
	import ButtonGroup from '$components/reusable-components/button-group.svelte';
	import Image from '$components/reusable-components/image.svelte';
	import RichText from '$components/reusable-components/rich-text.svelte';
	import type { ContentStoryblok } from '$src/types/storyblok';
	import { storyblokEditable, StoryblokComponent} from '@storyblok/svelte';

	export let blok: ContentStoryblok;
	export let i: number;
	export let color: string;
	export let path;

	// console.log(blok);
	const titleSize =
		blok.title && blok.title_size ? parseInt(blok.title_size.replace('px', '')) : 35;

	$: hasImage = blok.image && (blok.image.filename || blok.image.urls);
</script>

{#key blok}
	<div
		class="main-wrapper"
		style:background-color={blok.background_color}
		use:storyblokEditable={blok}
		style:padding-top={blok.spacing}
		style:padding-bottom={blok.spacing}
		style={`--series-color: ${color || 'var(--c-orange)'};`}
	>
		<div class="max-width wrapper {blok.image_location}">
			{#if hasImage}
				<div class="image">
					<Image image={blok.image} sizes="500px, 33vw" />
				</div>
			{/if}
			<!-- in future add title? -->

			<div class="content {blok.justification || ''}">
				{#if blok?.title}<h2 class="title" style="font-size:{titleSize + 10}px;">
						{blok.title}
					</h2>{/if}
				{#if blok.divider}
					<div class="divider" style:background-color={blok.divider_color} />
				{/if}
				<div class="content-blocks">
					{#each blok.content_blocks as col, i}
						<div class="column {blok.justification || ''}">
              {#if col.component==="content_block"}
                {#if col.icon && col.icon.filename}
                  <img
                    class="icon"
                    src={`${col.icon.filename}/m/${col.icon_width || 90}x0/smart`}
                    alt={col.icon.alt}
                    style={`--icon-bg-color: ${col.icon_background_color?.colorOne}; width:${col.icon_width}px;`}
                    loading="lazy"
                  />
                {/if}
                {#if col.title}
                {#if blok.title}
                  <h3
                    class="title-md title"
                    style:color={col.title_color}
                    style="font-size:{titleSize}"
                  >
                    {col.title}
                  </h3>
                {:else}
                <h2
                    class="title"
                    style:color={col.title_color}
                    style="font-size:{titleSize + 10}px;"
                  >
                    {col.title}
                  </h2>
                {/if}
                {/if}
                {#if col.divider}
                  <div class="divider" style:background-color={col.divider_color} />
                {/if}
                {#if col.content && col.content.content && col.content.content[0] && col.content.content[0].content}
                  <div style:color={col.text_color}>
                    <RichText content={col.content} centered={blok.justification === 'center'} />
                  </div>
                {/if}
                {#if col.buttons && col.buttons.length}
                  <div class="buttons">
                    <ButtonGroup buttons={col.buttons} />
                  </div>
                {/if}
              {:else }
                  <StoryblokComponent blok={col} />
              {/if}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/key}

<style lang="scss">
	.main-wrapper {
		display: flex;
		position: relative;
		flex-direction: column;
		align-items: left;
		overflow: hidden;
		padding: 0 35px;
	}

	.wrapper {
		gap: 60px;
		display: flex;
		flex-direction: row;
		// Changed to column layout and centered alignment
		// flex-direction: column;
		align-items: center;
		@include breakpoint(tablet) {
			flex-wrap: wrap;
			justify-content: center;
		}

		&.right {
			flex-direction: row-reverse;
			// Modified to reverse only content blocks, not entire wrapper
			// flex-direction: column;
			// .content {
			// 	flex-direction: row-reverse;
			// }
		}
	}
	.flex-start {
		align-items: flex-start;
	}
	.center {
		align-items: center;
	}
	.flex-end {
		align-items: flex-end;
	}
	.title {
		// Added for better text wrapping
		text-wrap: balance;
	}
	@media (max-width: 800px) {
		.title {
			white-space: wrap;
		}
	}

	.image {
		aspect-ratio: 1 / 1;
		width: 33%;
		flex: 0 0 auto;
		overflow: hidden;
		max-width: 500px;
		border-radius: 9999px;
		@include breakpoint('tablet') {
			width: 100%;
			max-width: 300px;
		}
	}
	.content {
		gap: 30px;
		display: flex;
		width: 100%;
		flex-direction: column;
	}
	.content-blocks {
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 60px;
		// Changed to grid layout for responsiveness
		display: grid;
		width: 100%;
	}

	.column {
		gap: 20px;
		// Simplified to work with grid layout
		display: flex;
		flex-direction: column;
	}

	@media (max-width: 800px) {
		.wrapper {
			gap: 40px;
		}

		.content-blocks {
			// Reduced gap for smaller screens
			gap: 40px;
		}
	}

	.divider {
		width: 100%;
		height: 1px;
	}
	.icon {
		width: 90px;
	}
	h2,
	h3,
	h4,
	h5,
	h6 {
		color: var(--series-color);
	}
</style>
