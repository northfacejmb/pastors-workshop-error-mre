<script lang="ts">
	import ButtonGroup from '$components/reusable-components/button-group.svelte';
	import Image from '$components/reusable-components/image.svelte';
	import RichText from '$components/reusable-components/rich-text.svelte';
	import type { CirclesStoryblok } from '$src/types/storyblok';
	import { storyblokEditable } from '@storyblok/svelte';
	export let blok: CirclesStoryblok;
	export let i: number;
	export let color;
	export let path;
</script>

{#key blok}
	<div
		class="block-circles"
		use:storyblokEditable={blok}
		style:background-color={blok.background_color}
		style:color={blok.text_color}
		style:padding-top={blok.spacing}
		style:padding-bottom={blok.spacing}
	>
		<div class="image">
			<Image image={blok.image} />
			<div class="overlay" style:background-color={blok.background_color} />
		</div>
		<div class="max-width wrapper">
			{#if blok.title}
				<h2 class="title-lg" style:color={blok.title_color}>{blok.title}</h2>
			{/if}

			{#if blok.circles && blok.circles.length}
				<div class="circles">
					{#each blok.circles as circle, i}
						<div class="circle-wrap">
							<div class="circle" style:background-color={blok.circle_color}>
								{#if circle.icon && circle.icon.filename}
									<img src={circle.icon.filename} alt={circle.icon.alt} />
								{/if}
								{#if circle.title}
									<h3 style:color={blok.circle_title_color} class="title-lg">{circle.title}</h3>
								{/if}
								{#if circle.subtitle}
									<h4 class="subtitle-md">{circle.subtitle}</h4>
								{/if}
							</div>
							<div class="content">
								{#if circle.description}
									<RichText content={circle.description} />
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}

			{#if blok.description}
				<RichText content={blok.description} centered />
			{/if}

			{#if blok.buttons && blok.buttons.length}
				<div class="buttons">
					<ButtonGroup buttons={blok.buttons} />
				</div>
			{/if}
		</div>
	</div>
{/key}

<style lang="scss">
	.block-circles {
		position: relative;
		padding: 0 35px;
	}

	.image {
		position: absolute;
		inset: 0;

		.overlay {
			opacity: 0.8;
			position: relative;
			position: absolute;
			inset: 0;
		}
	}

	.wrapper {
		gap: 40px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.circles {
		gap: 60px;
		display: flex;
		@media only screen and (max-width: 1180px) {
			gap: 30px;
		}

		@include breakpoint('tablet') {
			gap: 40px;
			width: 100%;
			flex-direction: column;
			align-items: center;
			justify-content: center;
		}
	}

	.circle-wrap {
		flex: 1 1 100%;
		text-align: center;
		@include breakpoint('tablet') {
			display: flex;
			flex-direction: column;
			align-items: center;
		}
	}

	.circle {
		aspect-ratio: 1/1;
		gap: 5px;
		display: flex;
		flex: 1 1 100%;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 30px;
		border-radius: 999px;
		.title-lg {
			font-size: 60px;
		}
		@include breakpoint('tablet') {
			display: flex;
			width: 100%;
			width: 200px;
			height: 200px;
			justify-content: center;
		}
	}

	.content {
		margin: 20px 0 0 0;
	}

	.title-lg {
		text-align: center;
		@include breakpoint('tablet') {
			font-size: 60px;
		}
	}
</style>
