<script lang="ts">
	import { page } from '$app/stores';
	import Citations from '$components/reusable-components/citations.svelte';
	import Image from '$components/reusable-components/image.svelte';
	import Meta from '$components/reusable-components/meta.svelte';
	import RichText from '$components/reusable-components/rich-text.svelte';
	import SidebarAuthor from '$components/reusable-components/sidebar-author.svelte';
	import { config } from '$src/stores/config.store.js';


	import { storyblokEditable } from '@storyblok/svelte';
	import { DateTime } from 'luxon';
	import pluralize from 'pluralize';
	import { onMount } from 'svelte';
	import type { LectionaryStoryblok } from '../../types/storyblok';
	import { primaryScripture } from '$src/stores/titleStores.ts';

	export let blok: LectionaryStoryblok;
	export let name: string;
	export let slug: string;
	export let path: string;
	export let first_published_at: string;
	export let snippet: boolean;

	let snippetLength;
	let image: {};
	// console.log('Lectionary:', blok);

	let configData: any = {};
	config.subscribe((c) => {
		configData = c;
	});
	$: if (snippet) snippetLength = parseInt(configData.default_snippet_character_length) + 500;

	$: typesense = $page.data.typesense;
console.log(blok)
	const seasonColor =
		blok.lectionary_season &&
		configData &&
		configData.lectionary_colors &&
		configData.lectionary_colors.length
			? configData?.lectionary_colors.filter((color) =>
					color?.lectionary_seasons.includes(blok.lectionary_season)
			  )[0].color
			: null;
	const urlParts = $page.url.pathname.split('/');
	const lectionaryCycle = urlParts[2];
	const lectionaryYear = urlParts[3];

	let concurrentLectionaries: { last: any; next: any } = { next: {}, last: {} };
	let seasonLectionaries: any = [];
	let relatedContent: any = {};
	let lectionaryPages: any = [];
	let othersFromSeason: any = [];
	let isFirstInCycle: boolean = false;
	let isLastInCycle: boolean = false;

	const lectionaryNextCyclesSchedule: any = {
		//this year: next year
		'year-a': 'year-b',
		'year-b': 'year-c',
		'year-c': 'year-a'
	};
	const lectionaryLastCyclesSchedule: any = {
		//this year: previous year
		'year-a': 'year-c',
		'year-b': 'year-a',
		'year-c': 'year-b'
	};

	$: allScripture = [
		...(blok.old_testament || []),
		...(blok.psalm || []),
		...(blok.new_testament || []),
		...(blok.gospel || []),
		...(blok.supplementary_scripture || [])
	];
  $: localPrimaryScripture = blok[blok.scripture_highlight || 'old_testament']
	$: {
    primaryScripture.set(blok[blok.scripture_highlight || 'old_testament'])
  }
	onMount(async () => {
		isFirstInCycle = blok.first_or_last === 'first';
		isLastInCycle = blok.first_or_last === 'last';

		let yearFromPath: string | null = null;
		let cycleFromPath: string | null = null;

		if (path) {
			const yearMatch = path.match(/\d{4}-\d{4}/);
			if (yearMatch) {
				yearFromPath = yearMatch[0];
			}

			const cycleMatch = path.match(/\/(year-[abcd])\//); // Correct regex
			if (cycleMatch) {
				cycleFromPath = cycleMatch[1];
			}
		}

		image =
			configData &&
			configData.lectionary_images &&
			configData.lectionary_images.length &&
			yearFromPath &&
			cycleFromPath
				? configData.lectionary_images.find(
						(image) =>
							image?.lectionary_seasons.includes(blok.lectionary_season) &&
							image.lectionary_year === yearFromPath &&
							image.lectionary_cycle === cycleFromPath
				  )?.image
				: null;
		image = image
			? image
			: (image =
					configData &&
					configData.lectionary_images &&
					configData.lectionary_images.length &&
					yearFromPath
						? configData.lectionary_images.find(
								(image) =>
									image?.lectionary_seasons.includes(blok.lectionary_season) &&
									image.lectionary_year === yearFromPath &&
									(!image.lectionary_cycle || image.lectionary_cycle === undefined)
						  )?.image
						: null);
		image = image
			? image
			: configData &&
			  configData.lectionary_default_image &&
			  typeof configData.lectionary_default_image === 'object'
			? configData.lectionary_default_image
			: null;

		relatedContent = await getRelatedContent();
		seasonLectionaries = await getSeasonLectionaries();
		concurrentLectionaries = await getConcurrentLectionaries();
		lectionaryPages = await getLectionaryPages();
		othersFromSeason = await getOthersFromSeason();
	});

	const getRelatedContent = async () => {
		const q = blok?.keywords?.length
			? '*'
			: blok.bible_references && blok.bible_references.length
			? blok.bible_references
					.map((ref: any) => `${ref.book.name} ${ref.chapter}:${ref.verse}`)
					.join(',')
			: name.replace(new RegExp(blok.component.replace('_', ' '), 'i'), '');

		const res = await typesense
			.collections('stories')
			.documents()
			.search({
				q,
				query_by: 'content.keywords.name,content.top_level_categories.name,content.content_plain',
				include_fields: 'name, full_slug',
				group_by: 'content.component',
				group_limit: 3,
				filter_by: `content.keywords.name:=[\`${blok.keywords
					?.map((keyword: any) => keyword.name ? keyword.name.replace(/[^a-zA-Z0-9-_\s]/g, '') : '')
					.join('`,`')}\`] &&full_slug:!=${path + slug} && name:!=${name.replace(
					/[^a-zA-Z0-9-_\s]/g,
					''
				)}`
			});
		return res.grouped_hits.reduce((obj: any, item: any) => {
			obj[item.group_key[0]] = item.hits;
			return obj;
		}, {});
	};
	const getSeasonLectionaries = async () => {
		const query = {
			version: 'published',
			starts_with: `lectionary/${lectionaryCycle}/${lectionaryYear}`,
			is_startpage: false,
			filter_query: {
				lectionary_season: { in: blok.lectionary_season }
			},
			sort_by: 'content.lectionary_date:asc',
			content_type: 'lectionary',
			per_page: 60,
			page: page,
			resolve_links: 'url',
			excluding_fields:
				'content,key_illustration,key_quote,other_illustrations,quote,other_illustration,disucssion_questions,new_illustration,new_quote,supplementary_scripture,auto_related_content,call_to_worship,citations,curated_related_content,opening_prayer,other_liturgy,other_quotes,prayer_of_invocation,sidebar_custom_content,add_find_liturgy,keywords, description,bible_references,image,author,scripture_reference,description'
		};
		const res = await $page.data.storyblokApi.get('cdn/stories', query);

		// console.log(res.data.stories);
		return res.data.stories;
	};
const testIt = (i, log) => {
console.log("Index:",i, log);
return ""
}
	const getConcurrentLectionaries = async () => {
		const nextQuery = {
			version: 'published',
			starts_with: `lectionary/${
				isLastInCycle ? lectionaryNextCyclesSchedule[lectionaryCycle] : lectionaryCycle
			}`,
			is_startpage: false,
			filter_query: {
				lectionary_date: { gt_date: blok.lectionary_date }
			},
			sort_by: 'content.lectionary_date:asc',
			content_type: 'lectionary',
			per_page: 1,
			page: page,
			resolve_links: 'url',
			excluding_fields:
				'content,key_illustration,key_quote,other_illustrations,quote,other_illustration,disucssion_questions,new_illustration,new_quote,supplementary_scripture,auto_related_content,call_to_worship,citations,curated_related_content,opening_prayer,other_liturgy,other_quotes,prayer_of_invocation,sidebar_custom_content,add_find_liturgy,keywords, description,bible_references,lectionary_season,image,author,scripture_reference,description'
		};

		const lastQuery = {
			version: 'published',
			starts_with: `lectionary/${
				isFirstInCycle ? lectionaryLastCyclesSchedule[lectionaryCycle] : lectionaryCycle
			}`,
			is_startpage: false,
			filter_query: {
				lectionary_date: { lt_date: blok.lectionary_date }
			},
			sort_by: 'content.lectionary_date:desc',
			content_type: 'lectionary',
			per_page: 1,
			page: page,
			resolve_links: 'url',
			excluding_fields:
				'content,key_illustration,key_quote,other_illustrations,quote,other_illustration,disucssion_questions,new_illustration,new_quote,supplementary_scripture,auto_related_content,call_to_worship,citations,curated_related_content,opening_prayer,other_liturgy,other_quotes,prayer_of_invocation,sidebar_custom_content,add_find_liturgy,keywords, description,bible_references,lectionary_season,image,author,scripture_reference,description'
		};

		const last = await $page.data.storyblokApi.get('cdn/stories', lastQuery);
		const next = await $page.data.storyblokApi.get('cdn/stories', nextQuery);
		const obj = { last: last.data.stories[0], next: next.data.stories[0] };

		// console.log(obj);
		return obj;
	};

	const getLectionaryPages = async () => {
		let query = {
			version: 'published',
			starts_with: `lectionary`,
			content_type: 'page',
			per_page: 20,
			page: 1,
			resolve_links: 'url',
			excluding_fields:
				'content,key_illustration,key_quote,other_illustrations,quote,other_illustration,disucssion_questions,new_illustration,new_quote,supplementary_scripture,auto_related_content,call_to_worship,citations,curated_related_content,opening_prayer,other_liturgy,other_quotes,prayer_of_invocation,sidebar_custom_content,add_find_liturgy'
		};

		let response = await $page.data.storyblokApi.get('cdn/stories', query);
		let data = response.data.stories.filter((page) => page.slug !== 'lectionary');
		data.sort((a, b) => {
			const numA = parseInt(a.name.split(/20/)[1]);
			const numB = parseInt(b.name.split(/20/)[1]);
			return numA - numB;
		});
		return data;
	};

	const getOthersFromSeason = async () => {
		const query = {
			version: 'published',
			starts_with: `lectionary`,
			is_startpage: false,
			filter_query: {
				lectionary_season: { in: blok.lectionary_season }
			},
			sort_by: 'content.lectionary_date:asc',
			content_type: 'lectionary',
			per_page: 60,
			page: page,
			resolve_links: 'url',
			excluding_fields:
				'content,key_illustration,key_quote,other_illustrations,quote,other_illustration,disucssion_questions,new_illustration,new_quote,supplementary_scripture,auto_related_content,call_to_worship,citations,curated_related_content,opening_prayer,other_liturgy,other_quotes,prayer_of_invocation,sidebar_custom_content,add_find_liturgy,keywords, description,bible_references,image,author,scripture_reference,description'
		};
		const res = await $page.data.storyblokApi.get('cdn/stories', query);

		//console.log('Others from season', res.data.stories);
		return res.data.stories;
	};

	// console.log('blok', blok);
</script>

{#key blok}
	<main use:storyblokEditable={blok} class="single" style={`--series-color: ${seasonColor};`}>
		<div class="title-bar" style="border-color:{seasonColor}">
			<div class="image">
				<Image {image} />
			</div>

			<div class="max-width wrapper">
				<div class="title-wrap">
					<p class="title-md guide" style="color:{seasonColor}">Lectionary Guide</p>
					<div class="border-wrap" style="border-color:{seasonColor}">
						{#if blok.lectionary_date}
							<p class="title-md">
								{DateTime.fromFormat(blok.lectionary_date, 'yyyy-MM-dd HH:mm').toLocaleString(
									DateTime.DATE_FULL
								)}
								<!-- {#if blok.lectionary_day}
									<span>- {blok.lectionary_day.replaceAll('_', ' ')}</span>
								{/if} -->
							</p>
						{/if}
						<h1 class="title-lg">
							{name}
							{#if !blok.hide_key_scripture_heading && localPrimaryScripture && localPrimaryScripture.length}
								<span class="divider" />
								<span class="scripture-title">
									{#each localPrimaryScripture as item}
										<span>
											{item.book.name}
											{#if item.chapter}{item.chapter}{#if item.verse}:{item.verse}{/if}{/if}
										</span>
									{/each}
								</span>
							{/if}
						</h1>

						<p class="title-md scripture-readings">
							{#if blok.old_testament && blok.old_testament.length}
								<div class="scripture-block">
									{#each blok.old_testament as item}
										<span>
											{item.book.name}
											{#if item.chapter}{item.chapter}{#if item.verse}:{item.verse}{/if}{/if}
										</span>
									{/each}
								</div>
							{/if}
							{#if blok.psalm && blok.psalm.length}
								<div class="scripture-block">
									{#each blok.psalm as item}
										<span>
											{item.book.name}
											{#if item.chapter}{item.chapter}{#if item.verse}:{item.verse}{/if}{/if}
										</span>
									{/each}
								</div>
							{/if}
							{#if blok.new_testament && blok.new_testament.length}
								<div class="scripture-block">
									{#each blok.new_testament as item}
										<span>
											{item.book.name}
											{#if item.chapter}{item.chapter}{#if item.verse}:{item.verse}{/if}{/if}
										</span>
									{/each}
								</div>
							{/if}
							{#if blok.gospel && blok.gospel.length}
								<div class="scripture-block">
									{#each blok.gospel as item}
										<span>
											{item.book.name}
											{#if item.chapter}{item.chapter}{#if item.verse}:{item.verse}{/if}{/if}
										</span>
									{/each}
								</div>
							{/if}
						</p>
					</div>

					{#if blok.lectionary_season}
						<div class="title-md season" style="background-color:{seasonColor}">
							{#if blok.component}
								<div class="type">{blok.component}:</div>
							{/if}
							<div>
								Season of {blok.lectionary_season.replaceAll('_', ' ')}, Year {$page.url
									.toString()
									.split('year-')[1]
									.charAt(0)}
							</div>
						</div>
					{/if}
					<!-- {#if blok.description}
						<p class="title-description">{blok.description}</p>
					{/if} -->
				</div>
			</div>
		</div>

		<div class="content-padding">
			<div class="content-wrapper max-width">
				<div class="content">
					<div class="meta" style="border-color:{seasonColor}">
						<Meta items={blok.author} label="Author" color={seasonColor} />
						<Meta items={blok.keywords} label="Keywords" color={seasonColor} />
						<Meta items={allScripture} label="Scripture" color={seasonColor}>
							<div slot="itemSlot" let:item>
								<a
									href="/{item.book.full_slug}?stories%5Bquery%5D={item.book
										.name}%20{item.chapter}%3A{item.verse}"
									style="color:{seasonColor}"
									class="scripture"
									>{item.book.name}
									{#if item.chapter}{item.chapter}{#if item.verse}:{item.verse}{/if}{/if}
								</a>
							</div>
						</Meta>
						<Meta
							items={[
								{ name: DateTime.fromISO(first_published_at).toLocaleString(DateTime.DATE_MED) }
							]}
							label="Date Added"
						>
							<div slot="itemSlot" let:item>
								{item.name}
							</div>
						</Meta>
					</div>
					<section id="commentary">
						<RichText content={blok.content} {snippetLength} />

						{#if blok.commentary_content && blok.commentary_title}
							<h2 class="section-title">{blok.commentary_title || 'Commentary'}</h2>
							<RichText content={blok.commentary_content} {snippetLength} />
						{/if}
					</section>
					{#if blok?.include_discussion_questions}
						<section id="discussion-questions">
							<h3 class="section-title">Discussion Questions</h3>
							<RichText content={blok.discussion_questions} {snippetLength} />
						</section>
					{/if}
						{#if (blok.quotes && blok.quotes.length) || (blok.illustrations && blok.illustrations.length)}
							<section id="sermon">
								<h3 class="section-title">Sermon Resources</h3>
								{#if blok.quotes && blok.quotes.length}
									<h4 class="subsection-title">Key {pluralize('Quote', blok.quotes.length)}</h4>
									<ul class="list quotes">
										{#each blok.quotes as quote}
											{#if quote.content}
												<li class="item quote">
													<a class="view-link" href="/{quote.full_slug}">View</a>
													<RichText removeColor content={quote.content.content} {snippetLength} />
													<div class="inline-author">
														{quote.content.author ? quote.content.author.name : 'Unknown'}
														<span class="emphasis">{quote.content.author_emphasis || ''}</span>
													</div>

													{#if quote.content.citations}
														<Citations
															citations={quote.content.citations}
															color="#000000"
															scale={0.7}
														/>
													{/if}
												</li>
											{/if}
										{/each}
									</ul>
								{/if}
								{#if blok.illustrations && blok.illustrations.length}
									<h4 class="subsection-title">
										Key {pluralize('Illustration', blok.illustrations.length)}
									</h4>
									<ul class="list illustrations">
										{#each blok.illustrations as illustration}
											{#if illustration.content}
												<li class="item illustration">
													<a class="view-link" href="/{illustration.full_slug}">View</a>
													<h5 class="single-content-title">{illustration.name}</h5>
													<RichText
														removeColor
														content={illustration.content.content}
														{snippetLength}
													/>
													<div class="inline-author">
														{illustration.content.author
															? illustration.content.author.name
															: 'Unknown'}
														<span class="emphasis"
															>{illustration.content.author_emphasis || ''}</span
														>
													</div>

													{#if illustration.content.citations}
														<Citations
															citations={illustration.content.citations}
															color="#000000"
															scale={0.7}
														/>
													{/if}
												</li>
											{/if}
										{/each}
									</ul>
								{/if}
							</section>
						{/if}

						{#if blok.prayers && blok.prayers.length}
							<section id="liturgy">
								<h3 class="section-title">Liturgical Resources</h3>
								<!-- <pre>{JSON.stringify(blok.prayers, null, 2)}</pre> -->
								{#each blok.prayers as prayerSection}
									{#if prayerSection.prayers && prayerSection.prayers.length}
										<h4 class="subsection-title">
											{prayerSection.title}
										</h4>
										<ul class="list prayers">
											{#each prayerSection.prayers as prayer}
												<!-- <pre>{JSON.stringify(prayer, null, 2)}</pre> -->
												{#if prayer.content}
													<li class="item prayer">
														{#if prayer.content.show_title}
															<!-- <div class="prayer-title">{prayer.name}</div> -->
															<h5 class="single-content-title">{prayer.name}</h5>
														{/if}
														<a class="view-link" href="/{prayer.full_slug}">View</a>
														<RichText
															removeColor
															content={prayer.content.content}
															{snippetLength}
														/>
														{#if prayer.content.author && prayer.content.author.name}
															<div class="inline-author">
																{prayer.content.author ? prayer.content.author.name : 'Unknown'}
																<span class="emphasis">{prayer.author_emphasis || ''}</span>
															</div>
														{/if}
														{#if prayer.content.citations}
															<div class="citation-wrapper">
																<Citations citations={prayer.content.citations} color="#000000" />
															</div>
														{/if}
													</li>
												{/if}
											{/each}
										</ul>
									{/if}
								{/each}
							</section>
						{/if}
			
					{#if !blok.hide_week_nav}
						<div class="week-nav week-nav-footer">
							{#if concurrentLectionaries.last && concurrentLectionaries.last?.full_slug}
								<a href="/{concurrentLectionaries.last.full_slug}" class="button">Prev Week</a>
							{/if}
							<div class="connector" />
							<a href="./" class="button">View Entire Year</a>
							<div class="connector" />
							{#if concurrentLectionaries.next && concurrentLectionaries.next?.full_slug}
								<a href="/{concurrentLectionaries.next.full_slug}" class="button">Next Week</a>
							{/if}
						</div>
					{/if}
				</div>

				<aside class="sidebar lectionary-sidebar {snippetLength ? 'scrollable' : ''}">
					{#if !blok.hide_week_nav}
						<div class="week-nav">
							{#if concurrentLectionaries.last && concurrentLectionaries.last?.full_slug}
								<a href="/{concurrentLectionaries.last.full_slug}" class="button">Prev Week</a>
							{/if}
							<div class="connector" />
							{#if concurrentLectionaries.next && concurrentLectionaries.next?.full_slug}
								<a href="/{concurrentLectionaries.next.full_slug}" class="button">Next Week</a>
							{/if}
						</div>
					{/if}
					{#if !blok.hide_season_nav}
						<div class="links">
							{#if blok.lectionary_season}
								<h3 class="title-md">{blok.lectionary_season.replaceAll('_', ' ')} Guides</h3>
							{/if}
							<ul class="links-list">
								{#each seasonLectionaries as link}
									<li class="single-sidebar-link">
										<a
											href="/{link.full_slug}"
											class="link"
											class:active={`/${link.full_slug}` === $page.url.pathname}
										>
											<span>{link.name}</span>
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
					{#if blok.curated_related_content && blok.curated_related_content.length}
						{#each blok.curated_related_content as content}
							<div class="link-section">
								<h3 class="title-md">
									Related {content.label}
								</h3>
								<div class="sidebar-global-wrapper">
									<ul class="single-sidebar-link-list">
										{#if content.links && content.links.length}
											{#each content.links as link, i}
												<li class="single-sidebar-link">
													<a href="/{link.full_slug}" class="link">
														{#if link.content[link?.content?.scripture_highlight]}
                            {testIt(i, link)}
                            {testIt(i, link.content[link.content.scripture_highlight][0])}
															<span
																>{link.content[link.content.scripture_highlight][0].book.name}
																{link.content[link.content.scripture_highlight][0].chapter}:{link
																	.content[link.content.scripture_highlight][0].verse}</span
															>
														{:else}
															<span>{link.name}</span>
														{/if}
													</a>
												</li>
											{/each}
										{/if}
									</ul>
								</div>
							</div>
						{/each}
					{/if}
					{#if blok && blok.sidebar_custom_content && blok.sidebar_custom_content.content}
						<RichText content={blok.sidebar_custom_content} {snippetLength} />
					{/if}
					{#if !blok.hide_lectionary_years}
						<div class="links">
							<h3 class="title-md">Lectionary Cycles</h3>
							<ul class="links-list">
								{#each lectionaryPages as link}
									<li class="single-sidebar-link">
										<a
											href="/{link.full_slug}"
											class="link"
											class:active={`/${link.full_slug}` === $page.url.pathname}
										>
											<span>{link.name}</span>
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
					{#if !blok.hide_other_cycles}
						<div class="links">
							<h3 class="title-md">
								{blok.lectionary_season?.replaceAll('_', ' ')} Guides from Other Cycles
							</h3>
							<ul class="links-list">
								{#each othersFromSeason as link}
									<li class="single-sidebar-link">
										<a
											href="/{link.full_slug}"
											class="link"
											class:active={`/${link.full_slug}` === $page.url.pathname}
										>
											<span>{link.name}</span>
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
					{#if !blok.hide_auto}
						{#each blok.auto_related_content || ['illustration', 'quote', 'liturgy', 'blog', 'lectionary', 'scripture_guide'] as contentKey}
							{#if relatedContent && relatedContent[contentKey] && relatedContent[contentKey].length}
								<div class="link-section">
									<h3 class="title-md">
										{#if contentKey === 'liturgy'}
											Related {contentKey.replaceAll('_', ' ')}
										{:else if contentKey === 'lectionary'}
											Related {contentKey.replaceAll('_', ' ')} Guides
										{:else}
											Related {pluralize(contentKey)}
										{/if}
									</h3>
									<div class="sidebar-global-wrapper">
										<ul class="single-sidebar-link-list">
											{#each relatedContent[contentKey] as link}
												<li class="single-sidebar-link">
													<a href="/{link.document.full_slug}" class="link">
														<span>{link.document.name}</span>
													</a>
												</li>
											{/each}
										</ul>
									</div>
								</div>
							{/if}
						{/each}
					{/if}

					<SidebarAuthor show={blok.show_author} author={blok.author} color={seasonColor} />
				</aside>
			</div>
		</div>
	</main>
{/key}

<style lang="scss">
	.inline-author {
		margin: 10px 0 0 0;
		font-size: 18px;
		// font-weight: bold;
		font-style: italic;
	}
	.citation-wrapper {
		margin-top: 8px;
	}
	.view-link {
		position: absolute;
		right: 10px;
		bottom: 10px;
		transform: scale(0.1);
		padding: 5px 15px;
		color: var(--c-white);
		border-radius: 3px;
		background-color: var(--c-orange);
		transition: transform 150ms ease;

		&:hover {
			background-color: var(--c-tan-dark);
		}
	}

	.list {
		gap: 20px;
		display: flex;
		position: relative;
		flex-direction: column;
		margin-bottom: 25px;
		.item {
			position: relative;
			&:hover,
			&:focus {
				.view-link {
					transform: scale(1);
				}
			}
		}
	}

	.illustration,
	.prayer {
		padding: 0 0 20px 0;
		border-bottom: 1px dashed var(--c-tan-light);

		&:last-child {
			border-bottom: none;
		}
	}
	.quote {
		padding: 20px;
		border-radius: 3px;
		background-color: var(--c-cream);
	}
	.section-title {
		margin: 0 0 20px;
		font-size: 55px;
		border-bottom: 1px solid var(--c-tan-light);
	}

	.subsection-title {
		margin: 0 0 8px;
		font-size: 28px;
	}
	.single-content-title {
		margin-block-start: 1em;
		margin-block-end: 1em;
		margin-inline-start: 0px;
		margin-inline-end: 0px;
		display: block;
		font-size: 1.17em;
	}
	.guide {
		font-size: 38px;
	}

	.scripture-readings {
		--gap: 14px;
		gap: var(--gap);
		display: flex;
		align-items: center;
		margin-top: 6px;
		.scripture-block {
			gap: var(--gap);
			display: flex;
			align-items: center;
			&::after {
				content: '';
				display: inline-block;
				width: 2px;
				height: 24px;
				transform: translateY(-1px);
				background-color: var(--series-color);
			}

			&:last-child {
				&::after {
					display: none;
				}
			}
		}
	}
	.week-nav {
		gap: 20px;
		display: flex;
		align-items: center;
		a {
			flex: 0 0 auto;
			font-family: var(--font-display);
			font-size: 20px;
		}
		.connector {
			width: 100%;
			height: 1px;
			flex: 1 1 auto;
			background-color: var(--c-tan-light);
		}
	}

	.week-nav-footer {
		margin-top: 50px;
	}

	h2,
	h3,
	h4,
	h5,
	h6 {
		color: var(--series-color) !important;
	}

	.single {
		position: relative;
	}
	.title-bar {
		display: flex;
		position: relative;
		align-items: center;
		overflow: hidden;
		padding: 100px 35px;
		border-bottom: 10px solid var(--c-black);

		.title-description {
			max-width: 33%;
			@include breakpoint('tablet') {
				max-width: 100%;
			}
		}

		.border-wrap {
			position: relative;
			left: 2px;
			// max-width: 66%;
			transform: translateX(-2px);
			margin: 10px 0;
			padding: 10px 0 0 14px;
			border-left: 10px solid var(--c-white);
		}

		.title-lg {
			padding: 10px 0 0 0;

			.divider {
				display: inline-block;
				width: 10px;
				height: 56px;
				margin: 0 10px;
				background-color: var(--series-color);
			}
		}

		.season {
			width: auto;
			margin: 10px 0;
			padding: 17px 26px 15px;
			color: var(--c-white);
			border-radius: 3px;
		}
	}

	.image {
		position: absolute;
		inset: 0;

		&::after {
			content: '';
			position: absolute;
			inset: 0;
			background: linear-gradient(
				to right,
				rgba(0, 0, 0, 0.8),
				rgba(0, 0, 0, 0.6),
				rgba(0, 0, 0, 0)
			);
		}
	}

	.title-wrap {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		color: var(--c-white);
	}

	.type {
		margin: 0 0 4px 0;
		color: var(--c-cream);
		font-family: var(--font-display);
		font-size: 20px;
	}

	section {
		margin-bottom: 50px;
	}
	.content-padding {
		padding: 0 35px;
	}
	.content-wrapper {
		gap: 60px;
		display: flex;

		.content {
			min-width: 0;
			flex: 1 1 100%;
			padding: 0 0 25px;
		}
		.sidebar {
			gap: 35px;
			display: flex;
			flex: 0 0 300px;
			flex-direction: column;
			overflow: hidden;
			padding: 35px;
			background-color: var(--c-cream);
			&.scrollable {
				max-height: 450px;
				overflow: hidden;
				overflow-y: auto;
			}
			@include breakpoint('tablet') {
				flex: 1 1 auto;
				margin: 0 -35px;

				.week-nav {
					display: none;
				}
			}
		}
		@include breakpoint('tablet') {
			flex-direction: column;
		}
	}

	.meta {
		margin-top: 35px;
		line-height: 18px;

		@include breakpoint('tablet') {
			flex-direction: column;
		}
	}

	.single-sidebar-link-wrapper {
		color: var(--c-tan);
	}

	.single-sidebar-link-list {
		// color: var(--c-tan);
    display: inline-flex;
    flex-direction: column;
    gap: 10px;
	}

	.single-sidebar-link {
		// white-space: nowrap;
		overflow: hidden;
		padding: 2px 0;
    line-height: 22px;
		text-overflow: ellipsis;

		a {
			&.active {
				color: var(--c-gray-light);
				pointer-events: none;
			}
		}
	}

	// .single-sidebar-link::before {
	// 	content: '- ';
	// 	display: inline-block;
	// 	padding: 0 4px 0 0;
	// }
	.prayer-title {
		padding-bottom: 10px;
		font-weight: bold;
	}
</style>
