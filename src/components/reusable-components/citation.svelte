<script lang="ts">
	import RichText from '$components/reusable-components/rich-text.svelte';
	import type { CitationStoryblok } from '$src/types/storyblok';
	import { GetUrl } from '$src/utils/general';
	import { storyblokEditable } from '@storyblok/svelte';

	export let citation: CitationStoryblok | null = null;
	export let color: string;
	export let scale: number = 1;

 function hasRichtextContent(richtext: ISbRichtext | null | undefined): boolean {
		if (!richtext || !Array.isArray(richtext.content)) {
			return false;
		}
		if (richtext.content.length > 0) return true;

		if (richtext.content[0].type === 'bullet_list' || richtext.content[0].type === 'ordered_list')
			return true;

		// Check if there's at least one non-empty text node
		return richtext.content.some(
			(node) =>
				node.type === 'paragraph' &&
				node.content &&
				node.content.some(
					(contentNode) => contentNode.type === 'text' && contentNode.text.trim() !== ''
				)
		);
	}
</script>
{#if citation}
	<div class="citation" use:storyblokEditable={citation} style:color style={`--scale: ${scale}`}>
		{#if hasRichtextContent(citation.published_work) && citation.link && GetUrl(citation.link) !== undefined}
			<a href={GetUrl(citation.link)} target="_blank">
				<RichText removeColor content={citation.published_work} />
			</a>
		{:else if hasRichtextContent(citation.published_work)}
			<RichText removeColor content={citation.published_work} />
		{/if}

		{#if citation.copyright}
			<span class="copyright">Copyright {citation.copyright}</span>
		{/if}
		{#if citation.translation}
			{#if citation.translation.name}
				<div class="translation">
					<span>
						Bible Translation: <a target="_blank" href="/{citation.translation.full_slug}"
							>{citation.translation.name}</a
						>
					</span>
					{#if citation.translation.content && citation.translation.content.display_title}
						<span>{citation.translation.content.display_title}</span>
					{/if}
					{#if citation.translation.content && citation.translation.content.publisher}
						<span>{citation.translation.content.publisher}</span>
					{/if}
					{#if citation.translation.content && citation.translation.content.attribution}
						<span class="attribution"
							><RichText removeColor content={citation.translation.content.attribution} /></span
						>
					{/if}
				</div>
			{:else}
				{#each citation.translation as translation}
					<div class="translation">
						<span>
							Bible Translation: <a target="_blank" href="/{translation.full_slug}"
								>{translation.name}</a
							>
						</span>
						{#if translation.content && translation.content.display_title}
							<span>{translation.content.display_title}</span>
						{/if}
						{#if translation.content && translation.content.publisher}
							<span>{translation.content.publisher}</span>
						{/if}
						{#if translation.content && translation.content.attribution}
							<span class="attribution"
								><RichText removeColor content={translation.content.attribution} /></span
							>
						{/if}
					</div>
				{/each}
			{/if}
		{/if}
	</div>
{/if}

<style lang="scss">
	.citation {
		margin: 0 0 2px 10px;
		padding: 0 0 0 15px;
		font-size: calc(18px * var(--scale));
		line-height: calc(24px * var(--scale));
		border-left: calc(6px * var(--scale)) solid var(--c-tan-light);

		span {
			font-size: calc(16px * var(--scale));
			line-height: calc(24px * var(--scale));
			&.attribution {
				font-size: calc(12px * var(--scale));
				line-height: calc(18px * var(--scale));
			}
		}
	}
</style>
