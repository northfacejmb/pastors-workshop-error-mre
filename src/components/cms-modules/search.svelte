<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { config } from '$src/stores/config.store.js';
	import type { SearchStoryblok } from '$src/types/storyblok';
	import { searchStats, fromSearch } from '$src/stores/titleStores.ts';
	import { typesenseInstantsearchAdapter } from '$src/utils/typesense.js';
	import instantsearch from 'instantsearch.js';
	import { browser } from '$app/environment';
	import {
		clearRefinements,
		configure,
		infiniteHits,
		refinementList,
		searchBox,
		sortBy,
		stats
	} from 'instantsearch.js/es/widgets';

	import { page } from '$app/stores';
	import Switch from '$components/reusable-components/switch.svelte';
	import { hydrated } from '$src/utils/lifecycles.js';
	import { connectCurrentRefinements } from 'instantsearch.js/es/connectors';
	import { DateTime } from 'luxon';
	import { onMount } from 'svelte';

	export let blok: SearchStoryblok;
	export let i: number;
	export let strictFilter: string = '';
	export let initialQuery: string = '';
	export let path;
	export let color;
	export let urlFilters;
  export let filterOnComponent: string[] = [ blok?.content_types ] || [];


  // console.log({urlFilters})
  // console.log({strictFilter})

const max_facet_values = blok.max_facet_results || $config.max_facet_values || 250 ; // sets how many keywords and bible-referecnes will show on the page. 

//   $:if(urlFilters?.keyword){
//   initialQuery = capitalizeFirstLetters(urlFilters.keyword)
// }else if(urlFilters?.bibleRef){
//   initialQuery=capitalizeFirstLetters(urlFilters.bibleRef)
// }
let initialStrictFilterKeywords: any = [];
let initialStrictFilterBible: any = [];
let strictFilterKeywords: any = [];
let strictFilterBible: any = [];
let resourceTypes: string[] = filterOnComponent ;
let shouldShowFacets: boolean = false;

const hasUrlFilters = urlFilters?.keyword || urlFilters?.bibleRef;
$: if(strictFilterKeywords.length && blok.include_summary_of_keywords !== false){ shouldShowFacets = true };

let keywordFilter: string = '';
let bibleRefFilter: string = '';


	let showFilters = false; // for tablet sizes
	let filterAnd = {
		component: true,
		author: true,
		illustration_categories: false,
		top_level_categories: false,
		keywords: false,
		liturgy_categories: false,
		bible_references: false,
		year_added: true
	};

	let ranInitialSearch = false;

	let browserIsMobile = false;

	$: if (browser && window.innerWidth < 500) {
		browserIsMobile = true;
	}

	// Function to initialize filterAnd from URL parameters
	function initializeFilterFromURL() {
		if (!browser) return;
		const params = new URLSearchParams(window.location.search);

		Object.keys(filterAnd).forEach((key) => {
			const paramValue = params.get(`filterAnd[${key}]`);
			if (paramValue !== null) {
				filterAnd[key] = paramValue === 'true'; // Convert to boolean
			}
		});
	}

	// Initialize filterAnd on component load
	if (typeof window !== 'undefined') {
		initializeFilterFromURL();
	}

	$: {
		const handlePopState = () => {
			if (!browser) return;

			window.location.reload(); // Ensure the page reloads on back navigation
		};

		if (browser) window.addEventListener('popstate', handlePopState);

		filterAnd = filterAnd; // svelte reactivity
		showFullContent = showFullContent; // svelte reactivity

		if (typeof window !== 'undefined' && document.querySelector('#results')) {
			updateURLWithFilter();
			loadSearch();
		}
	}
  // should we collect relaed keywords? or not

  let shouldGetFilterKeywords =  hasUrlFilters || strictFilterKeywords.length === 0;

  
	function updateURLWithFilter() {
		if (!browser) return;

		const params = new URLSearchParams(window.location.search);

		// Remove existing filterAnd params
		Object.keys(filterAnd).forEach((key) => {
			params.delete(`filterAnd[${key}]`);
		});

		// Add new filterAnd params only if they are true
		Object.entries(filterAnd).forEach(([key, value]) => {
			if (value) {
				params.set(`filterAnd[${key}]`, value);
			}
		});

		// Update the URL
		const newUrl = browser ? `${window.location.pathname}?${params.toString()}` : '';
		if (browser) window.history.replaceState({}, '', newUrl);
	}
	let filterToggles = {
		type: false,
		author: false,
		illustration_categories: true,
		top_level_categories: true,
		keywords: true,
		liturgy_categories: true,
		bible_references: true,
		year_added: false
	};

	let search;
	const hitImgWidth = 200;
	const hitImgHeight = 200;

	let displayImages = true
	let displayMeta = true 
  let showFullContent = false;

	let statsHits = 0;


	let keywordsContext;
	// $: console.log(keywordsContext);

	let configData: any = {};
	config.subscribe((c) => {
		configData = c;
	});

	const today = DateTime.local();

	// Create the render function
	const createDataAttribtues = (refinement) =>
		Object.keys(refinement)
			.map((key) => `data-${key}="${refinement[key]}"`)
			.join(' ');

	const renderListItem = (item) => {
		const labelArr = item.label.split('.');
		const label = labelArr[1]
			? labelArr[1]?.replaceAll('_', ' ')
			: labelArr[0]?.replaceAll('_', ' ');
		return `
      ${item.refinements
				.map(
					(refinement) => `
          <li class="filter-item">
            <button ${createDataAttribtues(refinement)}>
              <div class="text">
                <div class="type">${label}</div>
                <div class="label">${refinement.label}</div>
              </div>
              <div class="x"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13 13L7.00002 7.00002M7.00002 7.00002L1 1M7.00002 7.00002L13 1M7.00002 7.00002L1 13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
</div>
            </button>
          </li>`
				)
				.join('')}
    `;
	};

  function capitalizeFirstLetters(str) {
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
	const renderCurrentRefinements = (renderOptions, isFirstRender) => {
		const { items, refine, widgetParams } = renderOptions;
		keywordsContext = items.find((item) => item.attribute === 'content.keywords.name');

		if (keywordsContext) {
			// Extract the labels from the refinements
			const labels = keywordsContext.refinements.map((keyword) => keyword.label);
			keywordsContext = labels;
		}
		widgetParams.container.innerHTML = `
    <ul class="applied-filter-list">
      ${items.map(renderListItem).join('')}
    </ul>
  `;

		[...widgetParams.container.querySelectorAll('button')].forEach((element) => {
			element.addEventListener('click', (event) => {
				const item = Object.keys(event.currentTarget.dataset).reduce(
					(acc, key) => ({
						...acc,
						[key]: event.currentTarget.dataset[key]
					}),
					{}
				);

				refine(item);
			});
		});
	};

	// Create the custom widget
	const customCurrentRefinements = connectCurrentRefinements(renderCurrentRefinements);

	function loadSearch() {
		const additionalTypesenseAdapterParams = {
			highlight_affix_num_tokens: configData.highlight_affix_num_tokens // sets max length of snippet results.
		};
		// console.log(additionalTypesenseAdapterParams.highlight_affix_num_tokens);
		const searchClient = typesenseInstantsearchAdapter(
			additionalTypesenseAdapterParams
		).searchClient;
		search = instantsearch({
			indexName: 'stories',
			searchClient,
			routing: true,
			future: {
				preserveSharedStateOnUnmount: true
			},
      facet_query_num_typos: 0,
			initialUiState: {
				stories: {
					// query: initialQuery
          query: ""

				}
			}
		});
		search.on('render', () => {
			const searchState = search.helper.state;
			// console.log('SEARCH STATE', searchState);
			replaceState('', `?${searchState}`);
			ranInitialSearch
				? updateURLWithFilter()
				: setTimeout(() => {
						ranInitialSearch = true;
				  }, 200);
		});
		let filterStr: string;
		if (strictFilter) {
			filterStr = strictFilter;
		} else if (path === 'bible/') {
			filterStr = 'content.bible_references.hasBibleRef:=true';
		} else {
			filterStr =
				blok?.content_types && blok.content_types.length
					? blok.content_types
							.map((type) => {
								return `content.component:${type}`;
							})
							.join(' || ')
					: '';
		}
		if (urlFilters?.keyword) {
			keywordFilter = `content.keywords.name:=\`${urlFilters.keyword}\``; // It is imperitive to uer escaped backticks here, this tells typesense to escape special characters like (this)
			filterStr = filterStr ? `(${filterStr}) && ${keywordFilter}` : keywordFilter;
		}
		if (urlFilters?.bibleRef) {
			bibleRefFilter = `content.bible_references.bibleRefBookChapter:=\`${urlFilters.bibleRef}\``;   // It is imperitive to uer escaped backticks here, this tells typesense to escape special characters like (this)
			filterStr = filterStr ? `(${filterStr}) && ${bibleRefFilter}` : bibleRefFilter;
		}

		filterStr = filterStr; // for reactivity
		// console.log('blok', blok);
		if (blok.only_recent && blok.only_recent != '0') {
			const date = new Date();
			date.setDate(date.getDate() - blok.only_recent);
			const int64Date = date.getTime();
			filterStr += `&& first_published_at_int64:>${int64Date}`;
		}

		const widgets: any[] = [
			configure({
				hitsPerPage: blok.number_results || 30,
				filters: filterStr,
				enablePersonalization: false
			}),
			infiniteHits({
				container: '#results',
				templates: {
					item(hit: any) {
						// console.log(hit);
						let cats = hit.content[`${hit._highlightResult?.content.component}_categories`]
							?.map((cat: any) => cat.name?.value)
							.join(', ');

						// console.log(cats);

						let keywordsNameArray: any[] = [];
						let keywordsImgArray: any[] = [];
						let hitImg: string = '';
						let hitImgAlt: string = '';
						let isNewContent =
							today.diff(DateTime.fromISO(hit.first_published_at), 'days').days <= 30;

						hit._highlightResult.content?.keywords?.map((keyword: any) => {
							// console.log(keyword);
							if (keyword?.content?.image) {
								keywordsImgArray.push(keyword.content.image);
							}
							if (
								keyword &&
								keyword.name &&
								keyword.name.value &&
								keywordsNameArray.length < 10
							//	&&  $page.url.pathname.split('/').pop() !== keyword.slug.value // this would prevent the current keyword from showing on page
							) {
								keywordsNameArray.push(
									`<li><a href="/${keyword.full_slug.value}">${keyword.name.value}</a></li>`
								);
							}
						});
						//get image
						if (
							hit.content.component === 'lectionary' ||
							hit.content.component === 'scripture_guide'
						) {
							if (hit.content.component === 'scripture_guide') {
								if (hit.content.bible_references[0].book.content?.image?.filename) {
									hitImg =
										hit.content.bible_references[0].book.content.image.filename +
										`/m/${hitImgWidth}x${hitImgHeight}/smart`;
									hitImgAlt = hit.content.bible_references[0].book.content.image.alt || '';
								} else if (hit.content.bible_references[0]?.book?.content?.image?.urls?.raw) {
									hitImg =
										hit.content.bible_references[0].book.content.image.urls.raw +
										`&q=100&auto=compress&fit=crop&w=${hitImgWidth}&h=${hitImgHeight}`;
									hitImgAlt =
										hit.content.bible_references[0].book.content.image.alt_description || '';
								}
							} else if (hit.content.component === 'lectionary') {
								let image = null;
								if (
									configData &&
									configData.lectionary_images &&
									configData.lectionary_images.length &&
									hit.content.lectionary_year
								) {
									const foundImage = configData.lectionary_images.find(
										(image) =>
											image?.lectionary_seasons?.includes(hit.content.lectionary_season) &&
											image.lectionary_year === hit.content.lectionary_year
									);
									// console.log('Found image:', foundImage);
									image = foundImage?.image || null;
								}

								if (!image && configData && configData.lectionary_default_image) {
									image =
										typeof configData.lectionary_default_image === 'object'
											? configData.lectionary_default_image
											: { filename: configData.lectionary_default_image };
								}
								if (image?.filename) {
									hitImg = image?.filename + `/m/${hitImgWidth}x${hitImgHeight}/smart`;
									hitImgAlt = image?.alt || '';
								} else if (image?.urls) {
									hitImgAlt = image?.alt_description || '';
									hitImg = image.urls.raw + `&q=100&auto=compress&fit=crop&w=${hitImgWidth}&h=${hitImgHeight}`;
								}
							}
						} else if (hit.content.image?.urls) {
							// else content unsplash
							hitImg = hit.content.image.urls.raw + `&q=100&auto=compress&fit=crop&w=${hitImgWidth}&h=${hitImgHeight}`;
							hitImgAlt = hit.content.image.alt_description || '';
						} else if (hit.content.image?.filename) {
							//default content featured image
							hitImg = hit.content.image?.filename + `/m/${hitImgWidth}x${hitImgHeight}/smart`;
							hitImgAlt = hit.content.image?.alt || '';
						} else if (keywordsImgArray.length && keywordsImgArray[0]) {
							const img = keywordsImgArray[0];
							// console.log('img', img);
							if (img.urls) {
								// else keyword unsplash
								hitImg = img.urls.raw.value + `&q=100&w=${hitImgWidth}&h=${hitImgHeight}`;
								hitImgAlt = img.alt_description.value || '';
								// console.log('hitImgRaw', hitImg);
							} else if (img.filename) {
								//default keyword featured image
								hitImg = img.filename.value + `/m/${hitImgWidth}x${hitImgHeight}/smart`;
								hitImgAlt = img?.alt || '';
							}
						} else {
							// else site_settings contenttype default image
							hitImg =
								configData[hit.content.component + '_default_image'].filename +
								`/m/${hitImgWidth}x${hitImgHeight}/smart`;
						}

						let bibleReferences = Array.isArray(hit._highlightResult?.content?.bible_references)
							? hit._highlightResult.content.bible_references
									.map((reference: any) => {
										// Case 1: If both verse and bibleRefBookChapter are available, format as 'Book Chapter:Verse'
										if (reference.verse?.value && reference.bibleRefBookChapter?.value) {
											return `${
												reference.bibleRefBookChapter.value
											}:${reference.verse.value.replace(/-/g, '&#8209;')}`;
										}
										// Case 2: If only bibleRefBookChapter is available, use its value
										else if (reference.bibleRefBookChapter?.value) {
											return reference.bibleRefBookChapter.value;
										}
										// Case 3: If bibleRefBookChapter is missing but book name is available, use book name's value
										else if (
											reference.book?.name?.value &&
											reference.book?.name?.value !== undefined
										) {
											return reference.book.name.value;
										}
										// Case 4: Fallback or default case if none of the above conditions are met
										else {
											return 'Unknown Reference';
										}
									})
									.filter((value, index, self) => {
										return self.indexOf(value) === index; // Remove duplicates
									})
									.join(', ')
							: null;

						const hitContent = decodeHtml(
							showFullContent &&
								'quote,illustration,liturgy'.includes(
									hit._highlightResult?.content?.component?.value
								)
								? '<p><i>Open resource to view citations and formatting</i></p>' +
										hit._highlightResult?.content.content_plain.value
								: showFullContent 
                ? 
                createSnippet(
										hit._highlightResult?.content.content_plain.value,
										1000
								  ) + `<p><i>Open resource to view citations and formatting</i></p>`
                : createSnippet(
										hit._highlightResult?.content.content_plain.value,
										parseInt(configData.default_snippet_character_length) || 200
								  )
						);

						const hitTypeCategory = hit?._highlightResult?.content?.component?.value
							? `${hit?._highlightResult?.content?.component.value}_categories`
							: null;

				let hitResult = `
              <div style="max-width: ${hitImgWidth}px" class="col image" aria-hidden="true"><a href="/${
							hit.full_slug
						}" tabindex="-1"><img src="${hitImg}" alt="${hitImgAlt}" loading="lazy"></a></div>
              <div class="col">
              <h2 class="title-sm">${
								hit.content.component === 'quote' ? '' : hit.content.component.replace('_', ' ')
							}</h2>`;
						hitResult +=
							isNewContent ||
							hit.content.component === 'blog' ||
							hit.content.component === 'lectionary'
								? `${
										hit.content.component === 'blog'
											? `<div class="text-label"  >` +
											  DateTime.fromISO(hit.first_published_at).toLocaleString(DateTime.DATE_MED)
											: hit.content.component === 'lectionary'
											? `<div class="text-label" >` +
											  DateTime.fromFormat(
													hit.content.lectionary_date,
													'yyyy-MM-dd HH:mm'
											  ).toLocaleString(DateTime.DATE_FULL)
											: `<div class="text-label" style="color: var(--c-teal)" >` + 'NEW'
								  }</div>`
								: '';
						hitResult += `<h2 class="title-md"><a href="/${hit.full_slug}">${
							hit.content.component === 'quote'
								? 'Quote'
								: decodeHtml(hit._highlightResult?.name.value || hit.name)
						}</a></h2>
						 <div class="meta">`;

						cats
							? (hitResult += `<div class="label-value meta-col">
                <div class="text-label">Categories</div>
                <div class="value">
                ${cats}
                </div>`)
							: '';
						hit._highlightResult.content.author &&
						hit._highlightResult.content.author.length &&
						hit._highlightResult.content.author[0]?.name?.value
							? (hitResult += `
                <div class="label-value ">
                  <div class="text-label">Author</div>
                  <div class="value">
                    ${hit._highlightResult.content.author
											.map((author) => {
												return `<a href="/${author.full_slug?.value}">${author.name?.value}</a>`;
											})
											.join(', ')}
                  </div>
                </div>
              `)
							: '';

						// hitResult += `<div class="label-value meta-col">
						//     <div class="text-label">Year Added</div>
						//     <div class="value">${hit.year_added}</div>
						//     </div>`;

						keywordsNameArray.length > 0
							? (hitResult += `<div class="label-value meta-col meta-col">
                <div class="text-label">Keywords</div>
                <ul class="value">${keywordsNameArray.join('')}</ul> 
                </div>`)
							: '';
						bibleReferences
							? (hitResult += `<div class="label-value meta-col meta-col">
                <div class="text-label">Scripture</div>
                <div class="value">${bibleReferences}</div>
                </div>`)
							: '';
						if (
							hitTypeCategory &&
							hit?._highlightResult?.content &&
							hit?._highlightResult?.content[hitTypeCategory] &&
							hit?._highlightResult?.content[hitTypeCategory] !== undefined &&
							hit?._highlightResult?.content[hitTypeCategory].length > 0 &&
							hit?._highlightResult?.content[hitTypeCategory][0]?.name?.value &&
							hit?._highlightResult?.content[hitTypeCategory][0]?.full_slug?.value
						) {
							hitResult += `<div class="label-value meta-col">
                <div class="text-label">${hit.content.component.replace('_', ' ')} Categories</div>
              <div class="value">${hit._highlightResult.content[hitTypeCategory]

								.filter((cat) => cat.full_slug?.value && cat.name?.value) // Filter out cats without full_slug or name
								.map((cat) => `<a href="/${cat.full_slug.value}">${cat.name.value}</a>`)
								.join(', ')}</div>
              </div>`;
						}
						hitResult += `</input></div><div>${hitContent}</div>`;
						return hitResult;
					}
				},
				cssClasses: {
					root: 'results-wrapper',
					list: 'results-list',
					item: 'filter-item',
					loadMore: 'filter-load-btn'
				}
			})
		];

		if (blok.sort) {
			widgets.push(
				sortBy({
					container: '#sort',
					items: [
						{ label: 'Relevancy', value: 'stories' },
						{ label: 'Newest first', value: 'stories/sort/first_published_at_int64:desc' },
						{ label: 'Oldest First', value: 'stories/sort/first_published_at_int64:asc' }
					]
				})
			);
		}

			widgets.push(
				stats({
					container: '#stats',
					templates: {
						text(data, { html }) {
							statsHits = data.nbHits;
              // console.log({resourceTypes})
              // console.log({keywordsContext})
              // console.log({statsHits})
							searchStats.set({
								hits: statsHits,
								query: keywordsContext,
								contentTypes: resourceTypes
							});
							let count = '';
							let resultText = data.hasManyResults
								? 'Results'
								: data.hasOneResult
								? 'Result'
								: 'No Results';

							if (data.hasManyResults) {
								count += `${data.nbHits.toLocaleString()}`;
							} else if (data.hasOneResult) {
								count += `1`;
							}

              if (blok.results_meta) {return html`<span>${count}</span> ${resultText} in ${data.processingTimeMS}ms`} else{
                return ""
              }
						}
					}
				})
			);
		
		if (blok.sidebar) {
			if (blok.text_search) {
      
				widgets.push(
					searchBox({
						container: '#searchbox',
						showSubmit: true,
						showReset: true,
						placeholder: 'Text content search...',
						autofocus: true,
						cssClasses: {
							input: 'text-search'
						}
					})
				);
			}

			widgets.push(
				customCurrentRefinements({
					container: document.querySelector('#currentRefinements') || null
				})
			);

			if (blok.filters && blok.filters.length > 0) {
				widgets.push(
					clearRefinements({
						container: '#clearFilters',
						templates: {
							resetLabel: 'Clear Filters'
						}
					})
				);
				blok.filters.forEach((filter) => {
					let attribute = `content.${filter}.name`;
					let searchable = true;
					let operator: 'or' | 'and' | undefined = !filterAnd[filter] ? 'and' : 'or';
					//console.log(attribute, 'filterAnd[filter]', filterAnd[filter]);
					//console.log(attribute, 'operator', operator);
					let limit = 5;
					let sortBy: any[] = ['count:desc', 'name:desc'];
					switch (filter) {
						case 'lectionary_seasons':
							attribute = 'content.lectionary_season';
							searchable = false;
							limit = 20;
							break;
						case 'lectionary_day':
							attribute = 'content.lectionary_day';
							searchable = false;
							limit = 20;
							break;
						case 'lectionary_year':
							attribute = 'content.lectionary_year';
							searchable = false;
							limit = 20;
							break;
						case 'lectionary_cycles':
							attribute = 'content.lectionary_cycle';
							searchable = false;
							limit = 20;
							break;
						case 'component':
							attribute = 'content.component';
							searchable = false;
							limit = 20;
							break;
						case 'illustration_categories':
							searchable = false;
							break;
						case 'top_level_categories':
							break;
						case 'keywords':
							limit =
								!$page.url.pathname.includes('/on/') &&
								// !$page.url.pathname.includes('/bible/') &&
								(blok.include_summary_of_keywords ||
									(!keywordFilter &&
										!$page.url.pathname.includes('keyword') &&
										strictFilter)) &&
								filter === 'keywords'
									? max_facet_values
									: 20;
							sortBy = blok.include_summary_of_keywords
								? ['name:desc']
								: ['count:desc', 'name:asc'];
							break;
						case 'liturgy_categories':
							searchable = false;
							break;
						case 'bible_references':
							attribute = blok.bible_ref_verse
								? 'content.bible_references.bibleRefBookChapterVerses'
								: 'content.bible_references.bibleRefBookChapter';
							limit = max_facet_values;
							sortBy = [
								'content.bible_references.book.name:asc',
								'content.bible_references.book.chapter:asc',
								'content.bible_references.book.verse:asc'
							];
							break;
						case 'year_added':
							attribute = 'year_added';
							searchable = false;
							limit = 10;
							sortBy = ['name:desc'];
							break;
					}
					widgets.push(
						refinementList({
							container: `#${filter}_filter`,
							attribute,
							limit,
							sortBy,
							operator,
							showMore: true,
							showMoreLimit: 500,
							searchable,
							searchablePlaceholder: `Search`,
							cssClasses: {
								list: 'filter-list',
								item: 'filter-item',
								label: 'filter-label',
								checkbox: 'filter-item-checkbox',
								count: 'filter-item-count'
							},
							transformItems(items) {
                //capture keywords
								if (
									// !$page.url.pathname.includes('/on/') &&
									// !$page.url.pathname.includes('/from/') &&
									// !$page.url.pathname.includes('/bible/') &&
									// (blok.include_summary_of_keywords ||
									// 	(!keywordFilter &&
											!$page.url.pathname.includes('keyword') &&
									// 		strictFilter)) &&
									filter === 'keywords'
								) {
                  // console.log("we are collecting keywords")
									if (shouldGetFilterKeywords) {
                    initialStrictFilterKeywords = items.map((item) => ({
                      label: item.label,
                      count: item.count
                    }));
                    strictFilterKeywords = [...initialStrictFilterKeywords];
                  }
								}
                //capture Bible references
								if (
									!keywordFilter &&
									!$page.url.pathname.includes('/on/') &&
									!$page.url.pathname.includes('/from/') &&
									// !$page.url.pathname.includes('bible') &&
									(blok.include_summary_of_bible_ref || strictFilter) &&
									filter === 'bible_references'
								) {
                  if (initialStrictFilterBible.length === 0) {
                    initialStrictFilterBible = items.map((item) => ({
                      label: item.label,
                      count: item.count
                    }));
                    strictFilterBible = [...initialStrictFilterBible];
                  }}
                  //capture resource types
                  if(filter === "component"){
                    resourceTypes = items.map(item => capitalizeFirstLetters(item.label.replace("_"," ")))
                  }
                  

								return items.map((item) => {
									return {
										...item,
										label: item.label
											.replaceAll('_', ' ')
											.replaceAll(' and ', ' & ')
											.replaceAll('series', 'Summer Series'),
										highlighted: item.highlighted
											? item.highlighted
													.replaceAll('_', ' ')
													.replaceAll(' and ', ' & ')
													.replaceAll('series', 'Summer Series')
											: ''
									};
								});
							}
						})
					);
				});
			}
		}

		search.addWidgets(widgets);
		search.use(analyticsMiddleware);
		search.start();
	}

	onMount(() => {
    if (browser) {
      
      const storedShowFullContent = localStorage.getItem("showFullContent");
      const storedDisplayMeta = localStorage.getItem("displayMeta");
      const storedDisplayImages = localStorage.getItem("displayImages");

      showFullContent = (storedShowFullContent === 'true' && $page.data.hasActiveSubscription) || false;
      displayMeta = storedDisplayMeta === null ? !browserIsMobile && !$page.data.hasActiveSubscription : storedDisplayMeta === 'true'; // don't show meta for non logged in users by default
      displayImages = storedDisplayImages === null ? !browserIsMobile : storedDisplayImages === 'true';
  }
		if (hydrated) {
			loadSearch();
			// console.log('window.location', window.location);
			fromSearch.set(true);
		}  
	});

  $: if (browser && $page.data.hasActiveSubscription !== undefined) {
  showFullContent = showFullContent && $page.data.hasActiveSubscription;
}
const handleShowMetaChange = (label,value) => {
  localStorage.setItem(label, value.toString());
}

	function decodeHtml(html: any) {
		var txt = document.createElement('textarea');
		txt.innerHTML = html;
		return txt.value;
	}

	function createSnippet(content: string, maxLength: number): string {
		if (typeof content !== 'string') {
			console.error('Content is not a string:', content);
			return '';
		}
		if (content.length <= maxLength) {
			return content;
		}
		let end = content.lastIndexOf(' ', maxLength);
		let snippet = content.substring(0, end);
		return snippet + '…';
	}

	const analyticsMiddleware = () => {
		let timeoutId; // Store the timeout ID

		return {
			onStateChange({ uiState }) {
				// Clear any existing timeout
				clearTimeout(timeoutId);

				// Set a new timeout
				timeoutId = setTimeout(() => {
					// Ensure gtag function is available before calling
					if (browser && typeof window.gtag === 'function') {
						// console.log('gtag is defined, sending event...');
						// Google Analytics V4
						window.gtag('event', 'page_view', {
							page_location: window.location.pathname + window.location.search
						});
					} else {
						console.warn('Google Analytics gtag function is not defined');
					}

					// Google Tag Manager (GTM)
					// Ensure `dataLayer` is defined before pushing data
					if (
						browser &&
						window.dataLayer &&
						uiState !== undefined &&
						uiState &&
						uiState['stories']
					) {
						window.dataLayer.push({
							event: 'search',
							'Search Query': uiState['stories']?.query || '',
							Resource: uiState['stories']?.refinementList['content?.component']?.join(',') ?? '',
							Category:
								uiState['stories']?.refinementList['content.top_level_categories.name']?.join(
									','
								) ?? '',
							Illustration_category:
								uiState['stories']?.refinementList['content.illustration_categories.name']?.join(
									','
								) ?? '',
							Liturgy_category:
								uiState['stories']?.refinementList['content.liturgy_categories.name']?.join(',') ??
								'',
							Author: uiState['stories']?.refinementList['content.author.name']?.join(',') ?? '',
							Bible_Chapter:
								uiState['stories']?.refinementList[
									'content.bible_references.bibleRefBookChapter'
								]?.join(',') ?? '',
							Keyword: uiState['stories']?.refinementList['content.keywords.name']?.join(',') ?? ''
						});
					} else {
						console.warn('dataLayer is not defined');
					}
				}, 3000); // 3000 milliseconds (3 seconds) delay
			},
			subscribe() {},
			unsubscribe() {}
		};
	};
</script>

<!-- <svelte:head>
	<title>Search Results: {statsHits} {contextMeta}</title>
	<meta name="description" content="Found {statsHits} {contextMeta} in our search." />
</svelte:head> -->

<!-- <Analytics {search} /> -->

{#if (strictFilterKeywords.length || strictFilterBible.length) && (blok.include_summary_of_keywords !== false ||  blok.include_summary_of_bible_ref !== false )}<div class="browse-wrapper"> 
  {#if strictFilterKeywords.length && blok.include_summary_of_keywords !== false}
		<div class="max-width browse">
			<div class="title-md" >Browse by Topic</div>
			<ul class="keyword-list">
        {#each strictFilterKeywords.sort((a, b) => a.label.localeCompare(b.label)) as keyword}
        {@const baseUrl = hasUrlFilters ? $page.url.pathname.split("/").slice(0, -2).join("/") : $page.url.pathname}
          <li>
            <a data-sveltekit-preload-data="off" href={`${baseUrl}/on/${encodeURIComponent(keyword.label.replaceAll(" ","-").toLowerCase())}`}>
                {keyword.label} <span class="count">({keyword.count})</span>
            </a>
          </li>
        {/each}
          </ul>
		</div>

  {/if}     
  {#if strictFilterBible.length && blok.include_summary_of_bible_ref !== false}
		<div class="max-width browse">
			<div class="title-md">Browse by Bible Reference</div>
			<ul class="keyword-list">
        {#each strictFilterBible.slice().sort((a, b) => a.label.localeCompare(b.label)) as bible}
        <li>
        <a data-sveltekit-preload-data="off"  href={`${$page.url.pathname}/from/${bible.label.replaceAll(" ","-").toLowerCase()}`}>
            {bible.label} <span class="count">({bible.count})</span>
        </a></li>
        {/each}
			</ul>
		</div>
  {/if}
  </div>
{/if}

<div class="p-search fade-in">
	<div class="content-wrapper max-width">
		{#if blok.sidebar}
			<aside class="search-sidebar">
				<div class="show-filters-btn-wrapper">
					<button class="show-filters-btn" on:click={() => (showFilters = !showFilters)}>
						{#if showFilters}Hide Filters{:else}Show Filters{/if}
					</button>
				</div>
				<div class="filter-section">
					<div id="searchbox" />
					<div class="filter-controls">
						<div class="header">
							<div class="title-md">Applied Filters</div>
							<div id="clearFilters" />
						</div>
						<div id="currentRefinements" />
					</div>
				</div>
				<div class="filters" class:hidden={!showFilters}>
					{#each blok.filters as filter}
						<div class="filter-section">
							<div class="title-wrap">
								<div class="label">
									{filter.replaceAll('_', ' ').replaceAll('component', 'Resource Type')}
								</div>
								{#if filterToggles[filter]}
									<Switch name={filter} bind:value={filterAnd[filter]} />
								{/if}
							</div>
							<div class="filter" id="{filter}_filter" />
						</div>
					{/each}
				</div>
			</aside>
		{/if}
		<div class="content">
			<div class="controls">
				<div id="stats" />
				<div class="display" />
				<div class="display-wrapper">
					<div class="label">Display</div>
					<label>
						<input
							class="filter-item-checkbox"
							type="checkbox"
							bind:checked={displayImages}
              on:change={() => handleShowMetaChange("displayImages", displayImages)}
							aria-label="Toggle image display"
						/>
						Images
					</label>
					<label>
						<input
							class="filter-item-checkbox"
							type="checkbox"
							bind:checked={displayMeta}
              on:change={() => handleShowMetaChange("displayMeta", displayMeta)}
							aria-label="Toggle meta display"
						/>
						Meta Data
					</label>
					{#if $page.data.hasActiveSubscription}
						<label>
							<input
								class="filter-item-checkbox"
								type="checkbox"
								bind:checked={showFullContent}
                on:change={() => handleShowMetaChange("showFullContent", showFullContent)}
								aria-label="Toggle full content display"
							/>
							Full Content
						</label>
					{/if}
				</div>
				<div class="sort-wrapper">
					<div class="label">Sorted By</div>
					<div id="sort" />
				</div>
			</div>
			<div
				id="results"
        class:display-images={displayImages}
				class:hide-meta={!displayMeta}
			/>
		</div>
	</div>
</div>

<style lang="scss">
	.p-search {
		display: flex;
		position: relative;
		width: 100%;
		background-color: var(--c-gray-light);

		.content-wrapper {
			display: flex;
			position: relative;
			width: 100%;

			> .content {
				width: 100%;
				padding: 60px;
				background-color: var(--c-tan-light);
				@include breakpoint('tablet') {
					padding: 30px;
				}
			}

			@include breakpoint('tablet') {
				display: block;
				flex-direction: column;
				.content-wrapper {
					display: block;
				}
			}
		}
	}

	.col {
		display: flex;
		flex: 1;
		flex-direction: column;
	}

	.controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 0 0 20px 0;

		h3 {
			position: relative;
			top: 2px;
		}
		@include breakpoint('tablet') {
			gap: 20px;
			flex-direction: column;
			margin-bottom: 35px;
		}
	}

	.search-sidebar {
		flex: 0 0 330px;
		padding: 60px 30px;
		background-color: var(--c-cream);
	}

	#results {
		flex: 1;
	}

	.sort-wrapper {
		gap: 10px;
		display: flex;
		align-items: center;
	}

	.filter-section {
		margin: 0 0 20px;
		padding: 0 0 20px;
		border-bottom: 1px solid var(--c-tan-light);

		.title-wrap {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 5px;
		}
	}

	.filter {
		text-transform: capitalize;
	}

	.display-wrapper {
		gap: 15px;
		display: flex;
		align-items: center;
		label {
			gap: 5px;
			display: flex;
			align-items: center;
		}
	}
	@include breakpoint('tablet') {
		.search-sidebar {
			transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
		}
		.col.image img {
			max-width: 100px;
		}

		.filters.hidden {
			opacity: 0;
			visibility: hidden;
			width: 0;
			height: 0;
			flex-basis: 0%;
			// transform: translatey(200%);
			padding: 0px;
		}

		.show-filters-btn {
			display: block;
			margin: 20px auto;
			padding: 10px 20px;
			color: white;
			font-size: 16px;
			text-align: center;
			text-decoration: none;
			border: none;
			background-color: var(--c-orange);
			cursor: pointer;
		}
	}
	.show-filters-btn-wrapper {
		display: none;
	}

	@include breakpoint('tablet') {
		.show-filters-btn-wrapper {
			display: block;
		}

		.show-filters-btn {
			display: block;
			margin: 20px auto;
			padding: 10px 20px;
			color: white;
			font-size: 16px;
			text-align: center;
			text-decoration: none;
			border: none;
			background-color: var(--c-orange);
			cursor: pointer;
		}
	}
	.label {
		font-family: 'Bebas', sans-serif;
		line-height: 1;
		font-weight: normal;
	}
	.browse-wrapper {
		padding: 35px 35px 60px 35px;
		display: flex;
		flex-direction: column;
		gap: 20px;
		.browse {
			display: flex;
			flex-direction: column;
			gap: 10px;
		}

		.keyword-list {
			display: inline-flex;
			flex-wrap: wrap;
			column-gap: 20px;
      row-gap: 0px;
			& a {
				font-size: 16px;
				.count {
					font-size: 12px;
					color: var(--c-tan-dark);
				}
				&:hover {
					color: white;
					background-color: var(--c-orange) !important;
					margin: -4px;
					padding: 4px;
					border-radius: 4px;

					.count {
						color: white; // This ensures the count turns white on hover
					}
				}
			}
		}
	}
</style>
