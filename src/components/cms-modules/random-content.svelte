<script lang="ts">
	import { page } from '$app/stores';
	import Image from '$components/reusable-components/image.svelte';
	import RichText from '$components/reusable-components/rich-text.svelte';
	import { config } from '$src/stores/config.store.js';
	import type { ContentStoryblok } from '$src/types/storyblok';
	import relations from '$src/utils/relations';
	import { DateTime } from 'luxon';
	import { onMount } from 'svelte';

	let configData: any = {};
	config.subscribe((c) => {
		configData = c;
	});

	export let blok: ContentStoryblok;
	export let i: number;
	export let path: string;

	let cv: number;

	// console.log(path);
	let indexArray: any = [];

	$: fallbackImg = () => {
		//fallback image for entire content-list
		let imageUrl = '';
		let keywordsImgArray: any[] = [];
		if (blok.keywords) {
			// console.log(blok.keywords);
			blok.keywords.map((keyword: any) => {
				if (keyword?.content?.image && keyword?.content?.image?.urls?.raw) {
					keywordsImgArray.push(keyword.content.image.urls.raw);
				} else if (keyword?.content?.image && keyword?.content?.image?.filename) {
					keywordsImgArray.push(keyword.content.image.filename);
				}
			});
			if (keywordsImgArray.length && keywordsImgArray[0]) {
				imageUrl = keywordsImgArray[0];
			} else {
				imageUrl = configData[blok.component + '_default_image']
					? configData[blok.component + '_default_image'].filename
					: configData['global_default_image'].filename;
			}
		} else if (path === 'copyright/') {
			imageUrl = configData['bible_copyright_default_image'].filename;
		} else {
			imageUrl = configData['global_default_image'].filename;
		}
		// console.log('imageUrl', imageUrl);
		return imageUrl;
	};

	// console.log('blok', blok),
	onMount(async () => {
		await storyblokQuery();
	});

	const storyblokQuery = async () => {
		let query = {
			cv,
			version: 'published',
			content_type: blok.content_type || "liturgy",
			is_startpage: 0,
			per_page: 1,
			resolve_links: 'url',
			excluding_fields:
				'key_illustration,key_quote,other_illustrations,quote,other_illustration,disucssion_questions,new_illustration,new_quote,supplementary_scripture',
			resolve_relations: relations
		};

		let firstResponse = await $page.data.storyblokApi.get('cdn/stories', {
			...query,
			per_page: 1,
			page: 1
		});
		cv = firstResponse.data.cv;
		query.cv = cv;
		let totalItems = firstResponse.total;

		// Generate a random page number
		let randomPage = Math.floor(Math.random() * totalItems) + 1;

		// Retrieve the random item using pagination
		let itemResponse = await $page.data.storyblokApi.get('cdn/stories', {
			...query,
			page: randomPage
		});

		indexArray = itemResponse.data.stories.map(processStory);
	};

	const processStory = (story) => {
		let keywordsImgArray = [];

		if (story.content.keywords) {
			story.content.keywords.forEach((keyword) => {
				if (keyword.content && keyword.content.image) {
					keywordsImgArray.push(keyword.content.image);
				}
			});
		}

		if (story.content.component === 'lectionary') {
			const image = configData.lectionary_images.find(
				(image) =>
					image?.lectionary_seasons.includes(story.content.lectionary_season) &&
					image.lectionary_year === story.content.lectionary_year
			)?.image;

			if (image) {
				story.content.image = image;
			}
		} else if (story.content.image) {
			story.content.image = story.content.image;
		} else if (keywordsImgArray.length && keywordsImgArray[0]) {
			story.content.image = keywordsImgArray[0];
		} else {
			story.content.image = configData[story.content.component + '_default_image'];
		}
		return { ...story };
	};
</script>

<div class="main-wrapper">
	<div class="max-width wrapper">
		{#if blok.title && blok.title != ''}<h2 class="title-md">
				{blok.title}
			</h2>{/if}
		{#each indexArray as item}
			<div class="row">
				<!-- {#if blok.include_image} -->
				<div class="item_image">
					<!-- {JSON.stringify(item.content)} -->
					{#if item.content.image}
						<div class="image-wrapper">
							<Image image={item.content.image} fallback={fallbackImg()} sizes={["600px","400px"]} />
						</div>
					{/if}
				</div>
				<!-- {/if} -->
				<div class="column">
					<h3 class="title-md">
						<a href="/{item.full_slug}">
							{#if item.content.display_title && item.content.display_title != ''}{item.content
									.display_title}{:else}{item.name}
							{/if}
						</a>
					</h3>
					<div class="meta">
						{#if item.content.author && item.content.author.name}
							<div class="label-value">
								<div class="text-label">Author</div>
								<div class="value">
									{item.content.author.name}
								</div>
							</div>
						{/if}

						<!-- {#if blok.include_date && item.first_published_at} -->
						<div class="label-value">
							<div class="text-label">Added</div>
							<div class="value">
								{DateTime.fromISO(item.first_published_at).toLocaleString(DateTime.DATE_FULL)}
							</div>
						</div>
						<!-- {/if} -->
						<!-- {#if item.content?.keywords && item.content?.keywords.length}
							<div class="label-value">
								<div class="text-label">Keywords</div>
								<div class="value">
									{#each item.content.keywords as keyword, index}
										<a href="/{keyword.full_slug}"
											>{keyword.name}{#if index < item.content.keywords.length - 1}
												<span>,</span>
											{/if}</a
										>
									{/each}
								</div>
							</div>
						{/if}
						{#if item.content.bible_references && item.content?.bible_references.length}
							<div class="label-value">
								<div class="text-label">Scripture</div>
								<div class="value">
									{#each item.content.bible_references as bibleref}
										<span>
											<a
												href="/{bibleref.book.full_slug}?stories%5Bquery%5D={bibleref.book
													.name}%20{bibleref.chapter}%3A%20{bibleref.verse}"
												>{bibleref.book.name}
												{#if bibleref.chapter}{bibleref.chapter}{#if bibleref.verse}:{bibleref.verse}{/if}{/if}
											</a>
										</span>
									{/each}
								</div>
							</div>
						{/if} -->
					</div>
					<!-- {#if blok.include_content && (item.content.attribution || item.content.content)} -->
					<RichText content={item.content.content} />
					<div class="link">
						{#if item.content.publisher && item.content.link}
							<a href="/{item.content.link}">{item.content.publisher}</a>
						{:else if item.content.publisher}
							{item.content.publisher}
						{/if}
					</div>
					<!-- {/if} -->
				</div>
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	.wrapper {
		gap: 30px;
		display: flex;
		flex-direction: column;
		margin-top: 60px;
		margin-bottom: 60px;
		padding: 0 30px;
		@include breakpoint('tablet') {
			padding: 0;
		}
	}

	.meta {
		padding: 0;

		@include breakpoint('tablet') {
			flex-direction: column;
		}
	}

	.image-wrapper {
		overflow: hidden;
		border-radius: 5px;
	}

	.row {
		gap: 30px;
		display: flex;
		align-items: center;
		.column {
			flex: 1 1 100%;
		}

		@include breakpoint('tablet') {
			flex-direction: column;

			.column {
				padding: 0 30px;
			}

			.image-wrapper {
				width: 100%;
				border-radius: 0;
			}
		}
	}
</style>
