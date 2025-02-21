<script lang="ts">
	import { onMount } from 'svelte';

	export let imgStyle: string = 'circle';
	export let imageObject: AssetStoryblok;
	export let darkBackgroundStyles: boolean;
	let mounted = false;
	onMount(() => {
		mounted = true;
	});
</script>

<div class="{imgStyle} " class:darkBackgroundStyles>
	{#if imgStyle === 'circle'}
		<img
			src={`${imageObject.filename}/m/500x0/smart`}
			srcset={`${imageObject.filename}/m/500x0/smart 500w, ${imageObject.filename}/m/1000x0/smart 2x`}
			alt={imageObject.alt}
			loading="lazy"
		/>
	{:else}
		<div class="shape-wrapper">
			<svg class="svg-clip" viewBox="0 0 474 544" aria-hidden="true">
				<defs>
					<clipPath id="clip-shape" clipPathUnits="objectBoundingBox">
						<path
							transform="scale(0.0021097 0.0018383)"
							d="M2.41914 44.0398C-0.808966 21.9639 15.0203 2 35.7521 2H438.664C459.396 2 472.225 21.9639 471.997 44.0398L403.38 513.288C400.794 530.973 386.656 542 370.047 542H104.369C87.7613 542 73.6223 530.973 71.0362 513.288L2.41914 44.0398Z"
						/>
					</clipPath>
				</defs>
				<path
					class="border"
					d="M2.41914 44.0398C-0.808966 21.9639 15.0203 2 35.7521 2H438.664C459.396 2 472.225 21.9639 471.997 44.0398L403.38 513.288C400.794 530.973 386.656 542 370.047 542H104.369C87.7613 542 73.6223 530.973 71.0362 513.288L2.41914 44.0398Z"
				/>
			</svg>

			<div class="image-wrapper">
				<img
					class="cropped-image"
					src="{imageObject.filename}/m/1000x0/smart"
					class:animate={mounted}
					alt={imageObject.alt}
				/>
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.trapezoid {
		display: flex;
		width: 100%;
		height: 100%;
		justify-content: center;
	}
	.shape-wrapper {
		position: relative;
		width: 472px;
		height: 542px;
		@include breakpoint(tablet) {
			width: 100%;
			max-width: 400px;
			height: auto;
		}
	}
	.svg-clip {
		fill: transparent;
		position: relative;
		z-index: 2;
		pointer-events: none;
		.border {
			stroke: var(--c-white);
			stroke-width: 1.5px;
		}
	}
	.image-wrapper {
		position: absolute;
		z-index: 1;
		inset: 0;
		overflow: hidden;
		clip-path: url('#clip-shape');
	}

	.cropped-image {
		transform-origin: center;
		border: none;
		&.animate {
			animation: scaleImg 2s ease normal forwards;
		}
	}
	.circle {
		img,
		svg {
			aspect-ratio: 1/1;
			// margin-inline: auto;
			position: relative;
			top: 22px;
			width: 100%;
			max-width: 400px;
			border: 1px solid var(--c-white);
			border-radius: 50%;
			@include breakpoint(tablet) {
				top: 0;
			}
		}
	}
	.darkBackgroundStyles {
		img {
			border: 1px solid var(--c-navy);
		}
		.border {
			stroke: var(--c-navy);
		}
	}

	@keyframes scaleImg {
		0% {
			transform: scale(1);
		}
		100% {
			transform: scale(1.3);
		}
	}
</style>
