<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';
	import type { HeroInteriorStoryblok } from '$src/types/storyblok';
	import RichText from '$components/reusable-components/rich-text.svelte';
	import Image from '$components/reusable-components/image.svelte';
	export let posts: any[];
</script>

{#key posts}
	<div class="posts">
		{#if posts && typeof posts === 'array' && posts.length > 0}
			{#each posts as post}
				<div class="post">
					<div class="image">
						<Image
							image={post.content.image}
							loading="lazy"
							sizes="(max-width: 900px) 100vw, 33vw"
						/>
					</div>
					<div class="content">
						<div class="max-width wrapper">
							<div class="title-wrap">
								{#if post.content.component}
									<p class="prefix">{post.content.component}</p>
								{/if}
								<h3 class="title-md">{post.name}</h3>
								{#if post.content.description}
									<p>{post.content.description}</p>
								{/if}
							</div>
						</div>
						<div class="meta">
							<div class="label-value">
								<div class="text-label">Categories</div>
								<div class="value">Test</div>
							</div>
							<div class="label-value">
								<div class="text-label">{post.component} Categories</div>
								<div class="value">Test</div>
							</div>
							<div class="label-value">
								<div class="text-label">Author</div>
								<div class="value">Test</div>
							</div>
							<div class="label-value">
								<div class="text-label">Keywords</div>
								<div class="value">Test</div>
							</div>
							<div class="label-value">
								<div class="text-label">Scripture</div>
								<div class="value">Test</div>
							</div>
							<div class="label-value">
								<div class="text-label">Year Added</div>
								<div class="value">Test</div>
							</div>
						</div>
						<div class="description">
							{post.description}
						</div>
						<!-- <RichText content={post.content.content} /> -->
					</div>
				</div>
			{/each}
		{/if}
	</div>
{/key}

<style lang="scss">
	.posts {
		gap: 20px;
		display: flex;
		flex-direction: column;
	}

	.post {
		gap: 35px;
		display: flex;
		padding: 35px;
		color: var(--c-black);
		border-radius: 8px;
		background-color: var(--c-white);

		.image {
			aspect-ratio: 1/1;
			width: 200px;
			height: 200px;
			flex: 0 0 auto;
			overflow: hidden;
			border-radius: 8px;
		}
	}
</style>
