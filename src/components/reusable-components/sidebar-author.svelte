<script lang="ts">
	import Image from '$components/reusable-components/image.svelte';
	import RichText from '$components/reusable-components/rich-text.svelte';
	import type { AuthorStoryblok } from '$src/types/storyblok';
	export let show: boolean;
	export let author: AuthorStoryblok | AuthorStoryblok[] | string | undefined;
	export let color: string;

	$: authorArray = Array.isArray(author) ? author : [author];
</script>

{#if show && authorArray.length}
	<div class="author">
		<h3 class="title-sm">Author{authorArray.length > 1 ? 's' : ''}</h3>
		{#each authorArray as authorItem}
			{#if typeof authorItem !== 'string'}
				<h3 class="title-md" style:color>
					{authorItem.name}
				</h3>
				{#if authorItem.content && authorItem.content.title}
					<p class="author-title">{authorItem.content.title}</p>
				{/if}
				{#if authorItem.content}
					<div class="author-content">
						{#if authorItem.content.image && authorItem.content.image.filename}
							<div class="author-image">
								<Image image={authorItem.content.image} sizes="600px" width="100%" height="100%" />
							</div>
						{/if}
						{#if authorItem.content.bio}
							{#if typeof authorItem.content.bio === 'object'}
								<RichText content={authorItem.content.bio} />
							{:else}
								<p>{authorItem.content.bio}</p>
							{/if}
						{/if}
						<a class="author-link" href={`/${authorItem.full_slug}`}>
							Read More By {authorItem.name}
						</a>
					</div>
				{/if}
			{/if}
		{/each}
	</div>
{/if}

<style lang="scss">
	.author-content {
		gap: 10px;
		display: flex;
		flex-direction: column;
		margin: 10px 0 20px;
	}
</style>
