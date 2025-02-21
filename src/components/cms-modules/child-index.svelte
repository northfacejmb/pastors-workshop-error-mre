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
	let displayClass: any = 'item-list';

	export let blok: ContentStoryblok;
	export let i: number;
	export let path: string;
	export let color: string = '';

	// console.log('path', path);

	let indexArray: any = [];
	let groupedItems: any = {};

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
		displayClass = blok.display == 'list' ? 'item-list' : 'item-grid';
		indexArray = await storyblokQuery();
		groupedItems = groupBySeriesSubSection(indexArray);
	});
	// Group items by their series_sub_section
	const groupBySeriesSubSection = (items) => {
		if (!items || !items.length) {
			return {};
		}
		return items.reduce((groups, item) => {
			const groupKey =
				item.content && item.content.series_sub_section
					? item.content.series_sub_section.split(':')[0]
					: 'Others in Series';

			if (!groups[groupKey]) {
				groups[groupKey] = [];
			}
			groups[groupKey].push(item);

			return groups;
		}, {});
	};

	const storyblokQuery = async () => {
		try {
			let storyPage = 1;
			const resultsLimit =
				blok.results_limit && blok.results_limit > 0 && blok.results_limit < 100
					? blok.results_limit
					: 100;

			let query: any = {
				version: 'published',
			  is_startpage: 0,
				per_page: resultsLimit,
				sort_by: blok.sort_order || 'name:asc',
				page: storyPage,
				resolve_links: 'url',
				excluding_slugs: path,
				excluding_fields:
					'key_illustration,key_quote,other_illustrations,quote,other_illustration,disucssion_questions,new_illustration,new_quote,supplementary_scripture',
				resolve_relations: relations
			};
      let searchWholeSite = blok.whole_site;
			
			if (blok.category || blok.keywords) {
        searchWholeSite = true
				query.filter_query = {};

				if (blok.category) {
					query['filter_query[top_level_categories][in]'] = blok.category.join(',');
				}
				if (blok.keywords) {
					query['filter_query[keywords][all_in_array]'] = blok.keywords.join(',');
				}
			}
      if(blok.content_type){
         searchWholeSite = true
          delete query.is_startpage; // cat-liturgy can be start pages and we want to include them
          query['filter_query[component][in]'] = blok.content_type.join(',');
        }
      query.starts_with = blok.starts_with ||  ( searchWholeSite ? '' : path ); 

			const firstResponse = await $page.data.storyblokApi.get('cdn/stories', query);
			const totalItems = blok.results_limit ? blok.results_limit : firstResponse.total;
			const totalPages = Math.ceil(totalItems / resultsLimit);

			let indexArray = firstResponse.data.stories.map(processStory);
			if (resultsLimit >= 100) {
				for (storyPage = 2; storyPage <= totalPages; storyPage++) {
					query.cv = firstResponse.data.cv;
					query.page = storyPage;
					const response = await $page.data.storyblokApi.get('cdn/stories', query);
					indexArray = indexArray.concat(response.data.stories.map(processStory));
				}
			}
			return indexArray;
		} catch (error) {
			console.log('An error occurred:', error);
		}
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

<div class="main-wrapper column">
	<div class="wrapper max-width">
		{#if blok.title && blok.title !== ''}
			<h2 class="title-md">
				{blok.title}
			</h2>{/if}
		<div class="list-grid {displayClass} {blok.heading_size}-gap">
			{#each Object.keys(groupedItems) as section}
				{#if !blok.hide_sub_section_titles}<div class="rich-text"><h3>{section}</h3></div>{/if}
				{#each groupedItems[section] as item}
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
							<h3 class="title-md {blok.heading_size}-text">
								<a href="/{item.full_slug}" style="color: {color}">
									{#if item.content.display_title && item.content.display_title != ''}{item.content
											.display_title}{:else}{item.name.replace('Psalm', 'Psalms')}
									{/if}
								</a>
							</h3>
							{#if blok.include_meta}
								<div class="meta">
									{#if blok.include_date && item.first_published_at}
										<div class="label-value">
											<div class="text-label">Added</div>
											<div class="value">
												{DateTime.fromISO(item.first_published_at).toLocaleString(
													DateTime.DATE_FULL
												)}
											</div>
										</div>
									{/if}
									{#if blok.include_keywords && item.content?.keywords && item.content?.keywords.length}
										<div class="label-value">
											<div class="text-label">Keywords</div>
											<div class="value">
												{#each item.content.keywords as keyword}
													<a href="/{keyword.full_slug}" style="color: {color}">{keyword.name}</a
													><span>, </span>
												{/each}
											</div>
										</div>
									{/if}
									{#if blok.include_scripture && item.content.bible_references && item.content?.bible_references.length}
										<div class="label-value">
											<div class="text-label">Scripture</div>
											<div class="value">
												{#each item.content.bible_references as bibleref}
													<a
														href="/{bibleref.book.full_slug}?stories%5Bquery%5D={bibleref.book
															.name}%20{bibleref.chapter}%3A%20{bibleref.verse}"
														style="color: {color}"
														>{bibleref.book.name}
														{#if bibleref.chapter}{bibleref.chapter}{#if bibleref.verse}:{bibleref.verse}{/if}{/if}
													</a>
												{/each}
											</div>
										</div>
									{/if}
								</div>
							{/if}
							{#if blok.include_description && item.content.description}
								{item.content.description}
							{/if}
							{#if blok.include_content && (item.content.attribution || item.content.content)}
								{#if item.content.attribution}
									<RichText content={item.content.attribution} />
								{:else}
									<RichText content={item.content.content} />
								{/if}
								<div class="link">
									{#if item.content.publisher && item.content.link}
										<a href="/{item.content.link}" style="color: {color}"
											>{item.content.publisher}</a
										>
									{:else if item.content.publisher}
										{item.content.publisher}
									{/if}
								</div>
							{/if}
						</div>
					</div>
				{/each}
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
	.main-wrapper {
		padding: 35px;
		@include breakpoint('tablet') {
			padding: 35px;
		}
	}
	.wrapper {
		gap: 30px;
		// margin-top: 60px;
		// margin-bottom: 60px;
		// margin-left: 35px;
		// padding: 0 30px;
	}
	.title-size-sm-gap {
		gap: 20px;
	}
	.list-grid {
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 30px;
		display: grid;
		margin-top: 30px;
		// margin-bottom: 60px;
		padding: 0;
	}

	.title-size-sm-text {
		font-size: 20px;
	}

	.item-list {
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
		align-items: flex-start;
	}

	.meta {
		padding: 0;

		@include breakpoint('tablet') {
			flex-direction: column;
		}
	}

	.image-wrapper {
		max-width: 300px;
		overflow: hidden;
		border-radius: 5px;
	}

	h2,
	h3,
	h4,
	h5,
	h6 {
		color: var(--series-color) !important;
	}

	.row {
		gap: 30px;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		.column {
			flex: 1 1 100%;
		}

		@include breakpoint('tablet') {
			flex-direction: column;

			.column {
				padding: 0 0px;
			}

			.image-wrapper {
				width: 100%;
				border-radius: 0;
			}
		}
	}
</style>
