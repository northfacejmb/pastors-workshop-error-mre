<script lang="ts">
	import ButtonGroup from '$components/reusable-components/button-group.svelte';
	import Image from '$components/reusable-components/image.svelte';
	import { browser } from '$app/environment';
	import RichText from '$components/reusable-components/rich-text.svelte';
	import type { TestimonialsStoryblok } from '$src/types/storyblok';
	import { storyblokEditable } from '@storyblok/svelte';
	import { onMount } from 'svelte';
	export let blok: TestimonialsStoryblok;
	export let i: number;
	export let path;
	export let color;

	// console.log(blok);
	let interval: number = 0;
	const numItems = 3;
	let currentIndex = 0;
	let freeze = false;
	$: transitionWidth = 100 / numItems;
	$: slides = blok.testimonials ? [...blok.testimonials, ...blok.testimonials.slice(0, 3)] : [];
	$: hasImage = blok.image && (blok.image.filename || blok.image.urls);

	function next() {
		if (blok.testimonials && currentIndex === blok.testimonials.length) {
			freeze = true;
			currentIndex = 0;
			setTimeout(() => {
				freeze = false;
				next();
			}, 100);
		} else {
			currentIndex++;
		}
	}

	function prev() {
		if (blok.testimonials && currentIndex === 0) {
			freeze = true;
			currentIndex = blok.testimonials.length;
			setTimeout(() => {
				freeze = false;
				currentIndex--;
			}, 100);
		} else {
			currentIndex--;
		}
	}

	onMount(() => {
		startInterval();

		return () => clearInterval(interval);
	});

	function startInterval(): void {
		if (!browser) return;
		interval = window.setInterval(() => {
			next();
		}, 5000);
	}

	function stopInterval(): void {
		clearInterval(interval);
	}
</script>

{#key blok}
	<div
		class="block-testimonials"
		use:storyblokEditable={blok}
		style:background-color={blok.background_color}
		style:color={blok.text_color}
		style:padding-top={blok.spacing}
		style:padding-bottom={blok.spacing}
	>
		{#if hasImage}
			<div class="image">
				<Image image={blok.image} />
				<div class="overlay" style:background-color={blok.background_color} />
			</div>
		{/if}
		<div class="wrapper">
			{#if blok.title}
				<div class="max-width">
					<h2 class="title-lg" style:color={blok.title_color}>{blok.title}</h2>
				</div>
			{/if}

			{#if blok.testimonials && blok.testimonials.length}
				<div class="slider hide-tablet" on:mouseenter={stopInterval} on:mouseleave={startInterval}>
					<!-- <button on:click={() => prev()}>Previous</button>
					<button on:click={() => next()}>Next</button> -->

					<div
						class="slider-content"
						class:freeze
						style="transform: translateX(-{currentIndex * transitionWidth}%)"
					>
						{#each slides as testimonial, i}
							{#if testimonial && testimonial.content}
								<div
									class="testimonial"
									style:color={blok.testimonial_text_color}
									style:flex="0 0 {transitionWidth}%"
								>
									<div class="inner-wrapper" style:background-color={blok.testimonial_color}>
										<div class="info">
											{#if testimonial.content && testimonial.content.image && testimonial.content.image.filename}
												<img
													style:border-color={blok.testimonial_color}
													src={testimonial.content.image.filename}
													alt={testimonial.content.image.alt}
												/>
											{/if}
											<div class="section">
												{#if testimonial.name}
													<h3 style:color={blok.testimonial_title_color} class="meta-info">
														{testimonial.name}
													</h3>
												{/if}
												{#if testimonial.content.organization}
													<h4 style:color={blok.testimonial_title_color} class="meta-info">
														{#if testimonial.content.title}
															{testimonial.content.title},
														{/if}
														{testimonial.content.organization}
													</h4>
												{/if}
												{#if testimonial.content.location}
													<h4 style:color={blok.testimonial_title_color} class="meta-info">
														{testimonial.content.location}
													</h4>
												{/if}
											</div>
										</div>
										{#if testimonial.content.testimonial}
											<RichText content={testimonial.content.testimonial} />
										{/if}
									</div>
								</div>
							{/if}
						{/each}
					</div>

					<div class="max-width">
						<div class="slider-nav">
							{#each blok.testimonials as testimonial, i}
								<button
									class:active={i === currentIndex}
									on:click={() => {
										currentIndex = i - 1;
										next();
									}}
								/>
							{/each}
						</div>
					</div>
				</div>

				<div class="slides show-tablet max-width">
					{#each blok.testimonials as testimonial, i}
						{#if testimonial && testimonial.content}
							<div class="slide" style:background-color={blok.testimonial_color}>
								<div class="info">
									{#if testimonial.content.image && testimonial.content.image.filename}
										<img
											style:border-color={blok.testimonial_color}
											src={testimonial.content.image.filename}
											alt={testimonial.content.image.alt}
										/>
									{/if}
									<div class="section">
										{#if testimonial.name}
											<h3 style:color={blok.testimonial_title_color} class="meta-info">
												{testimonial.name}
											</h3>
										{/if}
										{#if testimonial.content.organization}
											<h4 style:color={blok.testimonial_title_color} class="meta-info">
												{#if testimonial.content.title}
													{testimonial.content.title},
												{/if}
												{testimonial.content.organization}
											</h4>
										{/if}
										{#if testimonial.content.location}
											<h4 style:color={blok.testimonial_title_color} class="meta-info">
												{testimonial.content.location}
											</h4>
										{/if}
									</div>
								</div>
								{#if testimonial.content.testimonial}
									<RichText content={testimonial.content.testimonial} />
								{/if}
							</div>
						{/if}
					{/each}
				</div>
			{/if}

			{#if blok.testimonials && blok.testimonials.length}
				<div class="testimonials">
					{#each blok.testimonials as testimonial, i}
						<div class="testimonial-wrap" />
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
	.slider {
		position: relative;
		max-width: 100%;
		overflow: hidden;
		mask-image: linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%);
	}

	.slider-content {
		display: flex;
		transition: transform 0.6s ease;
		&.freeze {
			transition: none;
		}
	}

	.block-testimonials {
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
		gap: 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.testimonial {
		padding: 40px 10px 0;

		.inner-wrapper {
			height: 100%;
			padding: 30px;
			border-radius: 12px;
		}

		.title-lg {
			font-size: 60px;
		}
		@include breakpoint('tablet') {
			width: 100%;
		}
	}

	.content {
		margin: 20px 0 0 0;
	}

	.info {
		gap: 20px;
		display: flex;
		margin-bottom: 35px;

		img {
			object-fit: cover;
			position: relative;
			top: -70px;
			width: 150px;
			height: 150px;
			flex: 0 0 auto;
			margin: 0 0 -80px;
			border: 3px solid var(--c-white);
			border-radius: 999px;
			@include breakpoint(phone) {
				top: 0px;
				margin: 0px;
			}
		}

		.section {
			flex: 1 1 100%;
			&.border {
				flex: 0 0 auto;
				padding-right: 20px;
				border-right: 1px solid var(--c-orange);
			}
		}

		.meta-info {
			font-family: var(--font-body);
			font-size: 17px;
			line-height: 20px;
			&:first-child {
				margin: 0 0 4px 0;
				font-size: 20px;
				font-weight: bold;
			}
		}
	}

	.slider-nav {
		gap: 10px;
		display: flex;
		justify-content: center;
		margin: 20px 0 0 0;
		button {
			display: block;
			width: 20px;
			height: 20px;
			border-radius: 999px;
			background-color: var(--c-white);
			transition: background-color 0.3s ease;
			&.active {
				background-color: var(--c-orange);
				pointer-events: none;
			}
		}
	}

	.title-lg {
		text-align: center;
		@include breakpoint('tablet') {
			font-size: 60px;
		}
	}

	.slides {
		gap: 45px;
		display: flex;
		flex-direction: column;
		margin-top: 45px;

		.slide {
			padding: 30px;
			border-radius: 12px;
		}
	}
</style>
