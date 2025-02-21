<script lang="ts">
	import Image from '$components/reusable-components/image.svelte';
	import RichText from '$components/reusable-components/rich-text.svelte';
	import { config } from '$src/stores/config.store.js';
	import type { ContentStoryblok } from '$src/types/storyblok';
	import { DateTime } from 'luxon';

	let configData: any = {};
	config.subscribe((c) => {
		configData = c;
	});

	export let blok: ContentStoryblok;
	export let i: number;
	export let path: string;
	export let color: string;
	export let isInRichText: boolean;

	// console.log('blok', blok, 'that blok');

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
	// this gets the correct fallback image for each piece of content based on it's keywords etc.
	const content = blok.content
		.filter((hit) => typeof hit === 'object' && hit !== null)
		.map((hit) => {
			let keywordsImgArray = [];
			if (hit?.content?.keywords) {
				hit.content.keywords.forEach((keyword) => {
					if (keyword.content && keyword.content.image) {
						keywordsImgArray.push(keyword.content.image);
					}
				});
			}
			if (hit?.content?.component === 'lectionary') {
				const image = configData.lectionary_images.find(
					(image) =>
						image?.lectionary_seasons.includes(hit.content.lectionary_season) &&
						image.lectionary_year === hit.content.lectionary_year
				)?.image;

				if (image) {
					hit.content.image = image;
				}
			} else if (hit?.content?.image) {
				hit.content.image = hit.content.image;
			} else if (keywordsImgArray.length && keywordsImgArray[0]) {
				hit.content.image = keywordsImgArray[0];
			} else {
				hit.content.image = configData[hit?.content?.component + '_default_image'];
			}

			return {
				...hit
			};
		});

	// $: copyrightFallbackImage = () => {
	// 	let imageUrl = '';
	// 	if (
	// 		configData['bible_copyright_default_image'] &&
	// 		configData['bible_copyright_default_image'].filename
	// 	) {
	// 		imageUrl = configData['bible_copyright_default_image'].filename;
	// 	} else if (
	// 		configData['bible_copyright_default_image'] &&
	// 		configData['bible_copyright_default_image'].urls &&
	// 		configData['bible_copyright_default_image'].urls.raw
	// 	) {
	// 		imageUrl = configData['bible_copyright_default_image'].urls.raw;
	// 	}
	// 	return imageUrl;
	// };
</script>

<div class="main-wrapper">
	<div class="max-width wrapper" style={`${isInRichText ? 'padding: 0px' : ''}`}>
		{#if blok.title && blok.title != ''}<h2 class="title-md" style="color: {color}">
				{blok.title}
			</h2>{/if}
		{#each content as item}
			<div class="row">
				{#if item.content.component === 'bible_copyright'}
					{#if blok.include_image}
						<div class="image-wrapper">
							<Image image={item.content.image} fallback={fallbackImg()} sizes="400px" loading="lazy"/>
						</div>
					{/if}
					<div class="column">
						<h3 class="title-md">
							<a href="/{item.full_slug}" style="color: {color}"> {item.content.display_title}</a>
						</h3>
						<div class="meta" />
						{#if item.content.attribution}
							<RichText content={item.content.attribution} />
						{/if}
						<div class="link">
							{#if item.content.publisher && item.content.link}
								<a href="/{item.content.link}">{item.content.publisher}</a>
							{:else if item.content.publisher}
								{item.content.publisher}
							{/if}
						</div>
					</div>
				{:else}
					{#if blok.include_image}
						<div class="image-wrapper">
							{#if item.content.image}
								<Image image={item.content.image} fallback={fallbackImg()} sizes="400px"  loading="lazy" />
							{/if}
						</div>
					{/if}
					<div class="column">
						<h3 class="title-md">
							<a href="/{item.full_slug}" style="color: {color}">{item.name}</a>
						</h3>
						<div class="meta">
							{#if blok.include_date && item.first_published_at}
								<div class="label-value">
									<div class="text-label">
										{item.content.component === 'lectionary' && item.content.lectionary_date
											? 'Lectionary Date'
											: 'Date Added'}
									</div>
									<div class="value">
										{#if item.content.component === 'lectionary' && item.content.lectionary_date}
											{DateTime.fromFormat(
												item.content.lectionary_date,
												'yyyy-MM-dd HH:mm'
											).toLocaleString(DateTime.DATE_FULL)}
										{:else}{DateTime.fromISO(item.first_published_at).toLocaleString(
												DateTime.DATE_FULL
											)}{/if}
									</div>
								</div>
							{/if}

							{#if blok.include_author && item.content?.author}
								{#if Array.isArray(item.content.author)}
									{#each item.content.author as author}
										<div class="label-value">
											<div class="text-label">Author</div>
											<div class="value">
												<a href="/{author.full_slug}" style="color: {color}">
													{author.name}
												</a>
											</div>
										</div>
									{/each}
								{:else}
									<div class="label-value">
										<div class="text-label">Author</div>
										<div class="value">
											<a href="/{item.content.author.full_slug}" style="color: {color}">
												{item.content.author.name}
											</a>
										</div>
									</div>
								{/if}
							{/if}

							{#if blok.include_scripture && item.content.bible_references && item.content?.bible_references.length}
								<div class="label-value">
									<div class="text-label">Scripture</div>
									<div class="value">
										{#each item.content.bible_references as bibleref, index}
											<a
												href="/{bibleref.book.full_slug}?stories%5Bquery%5D={bibleref.book
													.name}%20{bibleref.chapter}%3A{bibleref.verse}"
												style="color: {color}"
												>{bibleref.book.name}
												{#if bibleref.chapter}{bibleref.chapter}{#if bibleref.verse}:{bibleref.verse}{/if}{/if}
											</a>{#if index !== item.content.bible_references.length - 1}<span
													>,
												</span>{/if}
										{/each}
									</div>
								</div>
							{/if}

							{#if blok.include_keywords && item.content?.keywords && item.content?.keywords.length}
								<div class="label-value">
									<div class="text-label">Keywords</div>
									<div class="value">
										{#each item.content.keywords as keyword, index}
											<a href="/{keyword.full_slug}" style="color: {color}">{keyword.name}</a
											>{#if index !== item.content.keywords.length - 1}<span>, </span>{/if}
										{/each}
									</div>
								</div>
							{/if}
						</div>
						{#if blok.include_description && item.content.description}
							{item.content.description}
						{/if}
						{#if blok.show_full_content && item.content}
							<RichText content={item.content.content} />
						{/if}
					</div>
				{/if}
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
		max-width: 300px;
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
