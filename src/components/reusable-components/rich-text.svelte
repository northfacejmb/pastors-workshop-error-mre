<script lang="ts">
	import ContentList from '$components/cms-modules/content-list.svelte';
	import IFrame from '$components/cms-modules/iframe.svelte';
	import Posts from '$components/cms-modules/posts.svelte';
	import TextSidebar from '$components/cms-modules/text-sidebar.svelte';
	import ButtonLink from '$components/reusable-components/button-link.svelte';
	import Citation from '$components/reusable-components/citation.svelte';
	import Columns from '$components/reusable-components/columns.svelte';
	import Image from '$components/reusable-components/image.svelte';
	import type { CitationStoryblok } from '$src/types/storyblok';
	import { GetUrl } from '$src/utils/general';
	import { createSnippet } from '$src/utils/makeSnippet';
	import type { ISbRichtext } from '@storyblok/svelte';
	import { renderRichText } from '@storyblok/svelte';

	export let content: ISbRichtext | string;
	export let centered: boolean = false;
	export let quote: boolean = false;
	export let removeColor: boolean = false;
	export let margin: string = '0 0 0 0';
	export let snippetLength: number | null = null;
	export let isBlog: boolean = false;

	let divElement: any;
	const componentMapping = {
		columns: Columns,
		posts: Posts,
		button: ButtonLink,
		content_list: ContentList,
		citation: Citation,
		text_sidebar: TextSidebar,
		iframe_embed: IFrame,
		image: Image
	};

	const extractProps = {
		iframe_embed: (data) => ({
			blok: data
		}),
		columns: (data) => ({
			blok: data
		}),
		text_sidebar: (data) => ({
			blok: data
		}),
		citation: (data) => ({
			citation: data as CitationStoryblok
		}),
		content_list: (data) => ({
			blok: data,
			isInRichText: true
		}),
		posts: (data) => ({ posts: data }),
		button: (data) => ({
			label: data.label,
			link: data.link.anchor ? '#' + data.link.anchor : GetUrl(data.link),
			btnStyle: data.style,
			btnColor: data.color
		}),
		image: (data) => ({
			image: data.image,
			size: data.size
		})
	};

	function processRichTextContent(content, isTopLevel = true, lastHeading = 1) {
		if (!content || !Array.isArray(content.content)) {
			return content;
		}

		let firstHeadingLevel = 0;
		let headingAdjustment = 0;

		return {
			...content,
			content: content.content.map((node) => {
				if (node.type === 'image') {
					return {
						type: 'blok',
						attrs: {
							body: [
								{
									component: 'image',
									image: {
										filename: node.attrs.src,
										alt_description: node.attrs.alt || ''
									},
									size: [node.attrs.width || '100%', node.attrs.height || 'auto']
								}
							]
						}
					};
				} else if (node.type === 'heading') {
					const originalHeadingLevel = node.attrs.level;
					if (!node.content || !Array.isArray(node.content)) {
						node.content = [];
					}

					// Ensure `marks` exists on each child node
					node.content.forEach((child) => {
						if (!child.marks) {
							child.marks = [];
						}

						// Add the styled class to the marks array
						child.marks.push({
							type: 'styled',
							attrs: { class: `h${originalHeadingLevel}` }
						});
					});

					if (isTopLevel) {
						if (firstHeadingLevel === 0) {
							firstHeadingLevel = node.attrs.level;
							headingAdjustment = 2 - firstHeadingLevel;
							node.attrs.level = node.attrs.level + headingAdjustment;
						} else {
							// Adjust the heading level, ensuring it's not more than one level lower than the last heading
							node.attrs.level = Math.max(
								2,
								Math.min(lastHeading + 1, node.attrs.level + headingAdjustment)
							);
						}
						lastHeading = node.attrs.level;
					}
				}

				if (node.content) {
					return processRichTextContent(node, false, lastHeading);
				}
				return node;
			})
		};
	}
	$: processedContent = processRichTextContent(content);

	$: resolvedContent = () => {
		if (typeof content === 'string') return content;
		try {
			const renderedContent = renderRichText(processedContent);
			return snippetLength ? createSnippet(renderedContent, snippetLength) : renderedContent;
		} catch (e) {
			return content;
		}
	};

	$: strippedContent =
		resolvedContent() === '<p>placeholder</p>'
			? ''
			: (quote || removeColor) && typeof resolvedContent() === 'string' && resolvedContent().length
			? resolvedContent().replaceAll(/color:rgb\(\d{1,3}, \d{1,3}, \d{1,3}\)/g, '')
			: typeof resolvedContent() === 'string'
			? resolvedContent().replaceAll('_—_', '—')
			: resolvedContent();

	$: {
		if (divElement) {
			const els = divElement.querySelectorAll('.richtext-imported-component');

			if (els.length) {
				els.forEach((el: any) => {
					const component = el.dataset.component;
					const data = JSON.parse(decodeURIComponent(el.dataset.blok));
					let Component = componentMapping[component] || Image; // Add Image as a fallback
					let props = extractProps[component] ? extractProps[component](data) : data;

					if (Component && props) {
						new Component({
							target: el,
							props
						});

						// Apply inline-block display to dynamically added components
						el.style['align-self'] = centered ? 'center' : 'flex-start';
						el.style['width'] = '100%';
					}
				});
			}
		}
	}

	export function hasRichtextContent(richtext: ISbRichtext | null | undefined): boolean {
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

<div class="rich-text" class:centered class:quote style="margin: {margin}" bind:this={divElement}>
	{#if content && hasRichtextContent(content)}
		{#if quote}
			<blockquote>
				{@html strippedContent}
			</blockquote>
		{:else}
			{@html strippedContent}
		{/if}
	{:else}
		{content}
	{/if}
</div>

<style lang="scss">
	.rich-text {
		display: flex;
		justify-content: center;
		&.quote {
			color: var(--c-white) !important;

			blockquote {
				position: relative;
				padding: 0;
				border: none;
			}
		}
	}
	.centered {
		justify-self: center;
		text-align: center;
	}
	.richtext-imported-component {
		width: 100%;
	}
</style>
