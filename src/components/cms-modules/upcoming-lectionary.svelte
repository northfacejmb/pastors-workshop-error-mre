<script lang="ts">
	import { page } from '$app/stores';
	import Image from '$components/reusable-components/image.svelte';
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

	// Get the current date
	const currentDate = new Date();

	// Extract year, month, and day from the current date
	const year = currentDate.getFullYear();
	const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
	const day = String(currentDate.getDate()).padStart(2, '0');

	// Create the today variable in the format "YYYY-MM-DD"
	const today = `${year}-${month}-${day}`;

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
			content_type: 'lectionary',
			is_startpage: 0,
			per_page: blok.number_of_upcoming,
			filter_query: {
				lectionary_date: { gt_date: today }
			},
			sort_by: 'content.lectionary_date:asc',
			resolve_links: 'url',
			excluding_fields:
				'key_illustration,key_quote,other_illustrations,quote,other_illustration,disucssion_questions,new_illustration,new_quote,supplementary_scripture',
			resolve_relations: relations
		};

		let response = await $page.data.storyblokApi.get('cdn/stories', query);
		indexArray = response.data.stories.map((story) => processStory(story));
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
			const parts = story.full_slug.split('/');
			const color =
				configData && configData.lectionary_colors && configData.lectionary_colors.length
					? configData.lectionary_colors.filter((color) =>
							color?.lectionary_seasons.includes(story.content.lectionary_season)
					  )[0]?.color
					: 'black';
			story.content.color = color;
			const lectionaryCycle = parts[1];
			const lectionaryYear = parts[2];
			story.content.lectionaryCycle = lectionaryCycle;

			const image = configData.lectionary_images.find(
				(image) =>
					image?.lectionary_seasons.includes(story.content.lectionary_season) &&
					image.lectionary_year === lectionaryYear
			)?.image;
			// console.log('lectionary image', image);
			if (image) {
				story.content.image = image;
			} else {
				story.content.image = configData[story.content.component + '_default_image'];
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
				{#if blok.include_image}
					<div class="item_image">
						<!-- {JSON.stringify(item.content)} -->
						{#if item.content.image}
							<div class="image-wrapper">
								<Image image={item.content.image} fallback={fallbackImg()} sizes="400px" />
							</div>
						{/if}
					</div>
				{/if}
				<div class="column">
					<h3 class="title-md">
						<span class="date"
							>{DateTime.fromFormat(
								item.content.lectionary_date,
								'yyyy-MM-dd HH:mm'
							).toLocaleString(DateTime.DATE_MED)}
							|
						</span>
						<a href="/{item.full_slug}" class="link" style="color:{item.content.color}">
							{item.name}
							{#if item.content && item.content.scripture_highlight && item.content[item.content.scripture_highlight]}
								{#each item.content[item.content.scripture_highlight] as ref}
									<span class="scripture-ref">
										{ref.book.name}
										{#if ref.chapter}{ref.chapter}{#if ref.verse}:{ref.verse}{/if}{/if}
									</span>
								{/each}
							{/if}
						</a>
						|
						<span class="cycle">
							{item.content.lectionaryCycle}
						</span>
					</h3>
					<div class="meta">
						{#if blok.include_author && item.content.author && item.content.author.name}
							<div class="label-value">
								<div class="text-label">Author</div>
								<div class="value">
									{item.content.author.name}
								</div>
							</div>
						{/if}

						<!-- {#if blok.include_date && item.first_published_at} -->
						<!-- <div class="label-value">
							<div class="text-label">Date</div>
							<div class="value">
								{DateTime.fromFormat(
									item.content.lectionary_date,
									'yyyy-MM-dd HH:mm'
								).toLocaleString(DateTime.DATE_FULL)}
							</div>
						</div> -->
						<!-- {/if} -->

						{#if blok.include_keywords && item.content?.keywords && item.content?.keywords.length}
							<div class="label-value">
								<div class="text-label">Keywords</div>
								<div class="value">
									{#each item.content.keywords as keyword, index}
										<a href="/{keyword.full_slug}" style="color:{item.content.color}"
											>{keyword.name}{#if index < item.content.keywords.length - 1}
												<span>,</span>
											{/if}</a
										>
									{/each}
								</div>
							</div>
						{/if}
						<!-- {#if item.content.bible_references && item.content?.bible_references.length}
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
