<script lang="ts">
	import { page } from '$app/stores';
	import Image from '$components/reusable-components/image.svelte';
	import { config } from '$src/stores/config.store.js';
	import type { ContentStoryblok } from '$src/types/storyblok';
	import { onMount } from 'svelte';
	import { storyblokEditable } from '@storyblok/svelte';

	export let blok: ContentStoryblok;
	export let i: number;

	let scriptureGuides: any = [];
	let guideBooksArray: any = [];
	let guideBooks: any;

	let configData: any = {};
	config.subscribe((c) => {
		configData = c;
	});

	// console.log('blok', blok),
	onMount(async () => {
		await storyblokQuery();
	});

	const storyblokQuery = async () => {
		let storyPage = 1;
		let filter_query =
			blok.book && blok.book.length
				? {
						'bible_references.book': {
							in: Array.isArray(blok.book)
								? blok.book.length > 1
									? blok.book.join(',')
									: blok.book[0]
								: blok.book
						}
				  }
				: null;
		console.log('filterquery', filter_query);
		console.log('blok.book,', blok.book);
		let query = {
			version: 'published',
			is_startpage: 0,
			content_type: 'scripture_guide',
			filter_query,
			per_page: 100,
			page: storyPage,
			resolve_links: 'url',
			excluding_fields:
				'content,key_illustration,key_quote,other_illustrations,quote,other_illustration,disucssion_questions,new_illustration,new_quote,supplementary_scripture',
			resolve_relations: 'bible_reference.book'
		};

		let firstResponse = await $page.data.storyblokApi.get('cdn/stories', query);

		let totalItems = firstResponse.total;
		let totalPages = Math.ceil(totalItems / 100);
		scriptureGuides = firstResponse.data.stories;

		for (storyPage = 2; storyPage <= totalPages; storyPage++) {
			query.page = storyPage;
			const response = await $page.data.storyblokApi.get('cdn/stories', query);
			scriptureGuides = scriptureGuides.concat(response.data.stories);
		}
		// console.log(scriptureGuides[0]);
		guideBooks = scriptureGuides.reduce((result, guide) => {
			const book = guide.content?.bible_references[0]?.book?.name;
			const bookOrder = guide.content?.bible_references[0]?.book?.content.sort_order;
			const chapter = guide.content?.bible_references[0]?.chapter;
			const verses = guide.content?.bible_references[0]?.verses;
			const guideName = guide.name
				.replace('Scripture Guides, ', '')
				.replace('Scripture Guide, ', '')
				.replace('Scripture Guide', '')
				.replace('Scripture Guides', '')
				.trim();
			const image = guide.content?.bible_references[0]?.book?.content?.image;
			if (book) {
				if (!result[book]) {
					result[book] = {
						name: book,
						image,
						sort_order: bookOrder,
						scriptureGuides: []
					};
				}
				result[book].scriptureGuides.push({ ...guide, chapter, verses, guideName });
			}
			return result;
		}, {});

		// Convert the object to an array and sort by book sort_order
		guideBooksArray = Object.values(guideBooks).sort((a, b) => a.sort_order - b.sort_order);
		// console.log(guideBooksArray);
		// Sort the scriptureGuides within each book by chapter then verses
		guideBooksArray.forEach((book) => {
			book.scriptureGuides.sort((a, b) => {
				const chapterA = a.content.bible_references[0].chapter;
				const chapterB = b.content.bible_references[0].chapter;

				const verseA = a.content.bible_references[0].verse;
				const verseB = b.content.bible_references[0].verse;

				if (chapterA === chapterB) {
					// If chapters are the same, compare based on verse
					if (verseA === verseB) {
						// If verses are the same, compare based on name
						return a.name.localeCompare(b.name);
					}
					// Compare based on verse
					const [startVerseA] = verseA ? verseA.split('-') : ['0'];
					const [startVerseB] = verseB ? verseB.split('-') : ['0'];
					return parseInt(startVerseA) - parseInt(startVerseB);
				}

				// If chapters are different, compare based on chapter
				return chapterA - chapterB;
			});
		});

		console.log(guideBooksArray);
		// console.log('guideBooksArray', guideBooksArray[0]);
	};
</script>

<div class="main-wrapper" use:storyblokEditable={blok}>
	<div
		class="max-width wrapper"
		style:padding-top={blok.spacing}
		style:padding-bottom={blok.spacing}
	>
		{#if blok.title && blok.title != ''}<h2 class="title-md">
				{blok.title}
			</h2>
		{/if}
		{#each guideBooksArray as book}
			<div class="book">
				{#if blok.show_book_image}
					<div class="image">
						{#if book.image}
							<Image image={book.image} sizes="234px" size={['416px', '234px']} loading="lazy" />
						{/if}
					</div>
				{/if}

				<div class="column">
					{#if blok.include_book_title}
						<div style="color:{configData.scripture_guide_color}">
							<h3 class="title-md">{book.name === 'Psalm' ? 'Psalms' : book.name}</h3>
						</div>
					{/if}
					<div class="links">
						{#each book.scriptureGuides as guide}
							<a class="link" href="/{guide.full_slug}">{guide.guideName}</a>
						{/each}
					</div>
				</div>
			</div>
			<!-- <p>{lectionary.name}</p> Assuming 'name' is the property you want to display -->
		{/each}
	</div>
</div>

<style lang="scss">
	.main-wrapper {
		display: flex;
		position: relative;
		align-items: center;
		overflow: hidden;
		padding: 0 35px;
	}

	.wrapper {
		gap: 30px;
		display: flex;
		width: 100%;
		flex-direction: column;
	}

	.book {
		gap: 20px;
		display: flex;
		// min-height: 234px;

		.image {
			aspect-ratio: 1 / 1;
			object-fit: cover;
			width: 416px;
			height: 234px;
			flex: 0 0 auto;
			overflow: hidden;
			border-radius: 5px;
		}

		.column {
			width: 100%;
			display: flex;
			height: 100%;
			flex-direction: column;
		}

		@include breakpoint('tablet') {
			height: auto;
			flex-direction: column;
			.image {
				aspect-ratio: 1 / 1;
				width: 100%;
				flex: 1 1 auto;
			}
		}
	}

	.links {
		column-width: 250px; /* Minimum width for each column */
		column-gap: 20px; /* Space between columns */
		max-width: 100%; /* Ensure the container is responsive */
		box-sizing: border-box;

		.link {
			display: block; /* Make each link a block to ensure proper alignment */
			margin-bottom: 10px; /* Space between links */
			white-space: nowrap; /* Prevent text wrapping */
			overflow: hidden; /* Hide overflow if the text is too long */
			text-overflow: ellipsis;
			margin: -4px;
			padding: 4px;
		}
		& a {
			font-size: 20px;
			.count {
				font-size: 14px;
				color: var(--c-tan-dark);
			}
			&:hover {
				color: white;
				background-color: var(--c-orange) !important;

				border-radius: 4px;

				.count {
					color: white; // This ensures the count turns white on hover
				}
			}
		}
	}
</style>
