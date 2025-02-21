<script lang="ts">
	import { page } from '$app/stores';
	import ButtonLink from '$components/reusable-components/button-link.svelte';
	import Image from '$components/reusable-components/image.svelte';
	import RichText from '$components/reusable-components/rich-text.svelte';
	import { config } from '$src/stores/config.store.js';
	import type { LectionaryIndexStoryblok } from '$src/types/storyblok';
	import { GetUrl } from '$src/utils/general';
	import { storyblokEditable } from '@storyblok/svelte';
	import { DateTime } from 'luxon';
	import { onMount } from 'svelte';

	import Links from '$components/cms-modules/links.svelte';

	export let blok: LectionaryIndexStoryblok;
	export let i: number;
	export let path: string;

	let lectionaries: any = [];
	let lectionaryPages: any = [];
	let seasonsArray: any = [];
	$: otherContent = blok.other_content || [];

	let configData: any = {};
	config.subscribe((c) => {
		configData = c;
	});

	console.warn($page);

	onMount(async () => {
		await lectionaryQuery();
		await lectionaryPageQuery();
	});

	const lectionaryQuery = async () => {
		const filter_query =
			blok.lectionary_season && blok.lectionary_season.length
				? {
						lectionary_season: {
							in: Array.isArray(blok.lectionary_season)
								? blok.lectionary_season.join(',')
								: blok.lectionary_season
						}
				  }
				: null;

		let query = {
			version: 'published',
			starts_with: `lectionary/${
				blok.lectionary_cycle ? blok.lectionary_cycle + '/' + blok.lectionary_year || ' ' : ''
			}`,
			is_startpage: false,
			filter_query,
			sort_by: 'content.lectionary_date:asc',
			content_type: 'lectionary',
			per_page: 100,
			page: page,
			resolve_links: 'url',
			excluding_slugs: path,
			resolve_relations: ['bible_reference.book'],
			excluding_fields:
				'content,key_illustration,key_quote,other_illustrations,quote,other_illustration,disucssion_questions,new_illustration,new_quote,supplementary_scripture,auto_related_content,call_to_worship,citations,curated_related_content,opening_prayer,other_liturgy,other_quotes,prayer_of_invocation,sidebar_custom_content,add_find_liturgy'
		};

		let response = await $page.data.storyblokApi.get('cdn/stories', query);
		lectionaries = response.data.stories;

		const seasons = lectionaries.reduce((result, lectionary) => {
			const season = lectionary.content.lectionary_season;
			if (season) {
				if (!result[season]) {
					const color =
						configData && configData.lectionary_colors && configData.lectionary_colors.length
							? configData.lectionary_colors.filter((color) =>
									color?.lectionary_seasons.includes(season)
							  )[0]?.color
							: null;
					let image =
						configData && configData.lectionary_images && configData.lectionary_images.length
							? configData.lectionary_images.find(
									(image) =>
										image?.lectionary_seasons.includes(season) &&
										image.lectionary_year === blok.lectionary_year &&
										image.lectionary_cycle === blok.lectionary_cycle
							  )?.image
							: null;
					image = image
						? image
						: configData &&
						  configData.lectionary_images &&
						  configData.lectionary_images.length &&
						  blok.lectionary_year &&
						  blok.lectionary_cycle
						? configData.lectionary_images.find(
								(image) =>
									image?.lectionary_seasons.includes(blok.lectionary_season) &&
									image.lectionary_year === blok.lectionary_year &&
									image.lectionary_cycle === blok.lectionary_cycle
						  )?.image
						: null;
					image = image
						? image
						: (image =
								configData && configData.lectionary_images && configData.lectionary_images.length
									? configData.lectionary_images.find(
											(image) =>
												image?.lectionary_seasons.includes(season) &&
												image.lectionary_year === blok.lectionary_year &&
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

					result[season] = {
						name: season,
						color,
						image,
						lectionaries: []
					};
				}
				result[season].lectionaries.push(lectionary);
			}
			return result;
		}, {});

		seasonsArray = Object.values(seasons);
		// console.log(seasonsArray);
	};

	const lectionaryPageQuery = async () => {
		let query = {
			version: 'published',
			starts_with: `lectionary`,
			content_type: 'page',
			per_page: 20,
			page: 1,
			resolve_links: 'url',
			excluding_slugs: path,
			excluding_fields:
				'content,key_illustration,key_quote,other_illustrations,quote,other_illustration,disucssion_questions,new_illustration,new_quote,supplementary_scripture,auto_related_content,call_to_worship,citations,curated_related_content,opening_prayer,other_liturgy,other_quotes,prayer_of_invocation,sidebar_custom_content,add_find_liturgy'
		};

		let response = await $page.data.storyblokApi.get('cdn/stories', query);
		lectionaryPages = response.data.stories.filter((page) => page.slug !== 'lectionary');
		lectionaryPages.sort((a, b) => {
			const numA = parseInt(a.name.split(/20/)[1]);
			const numB = parseInt(b.name.split(/20/)[1]);
			return numA - numB;
		});
		// console.log(lectionaryPages);
	};
</script>

<div
	class="main-wrapper"
	use:storyblokEditable={blok}
	style:padding-top={blok.spacing}
	style:padding-bottom={blok.spacing}
>
	<div class="max-width wrapper">
		<div class="section">
			{#if blok.show_cycle}
				<h2 class="title-md">{blok.lectionary_cycle}</h2>
			{/if}
			{#each seasonsArray as season}
				<div class="row">
					{#if blok.show_season_image}
						<div class="season_image">
							<Image image={season.image} sizes="600px" />
						</div>
					{/if}
					<div class="sub-section">
						{#if blok.include_season_titles}
							<h3 class="title-md season-title" style="background-color:{season.color}">
								{season.name.replaceAll('_', ' ')}
							</h3>
						{/if}
						<ul>
							{#each season.lectionaries as lectionary}
								<li>
									<div class:grid={!blok.hide_date && lectionary.content.lectionary_date}>
										{#if !blok.hide_date && lectionary.content.lectionary_date}
											<span class="date"
												>{DateTime.fromFormat(
													lectionary.content.lectionary_date,
													'yyyy-MM-dd HH:mm'
												).toLocaleString(DateTime.DATE_MED)}
											</span>
										{/if}
										<a href="/{lectionary.full_slug}" class="link" style="color:{season.color}">
											{lectionary.name}
											{#if lectionary.content && lectionary.content.scripture_highlight && lectionary.content[lectionary.content.scripture_highlight]}
												{#each lectionary.content[lectionary.content.scripture_highlight] as item}
													<span class="scripture-ref">
														{item.book.name}
														{#if item.chapter}{item.chapter}{#if item.verse}:{item.verse}{/if}{/if}
													</span>
												{/each}
											{/if}
										</a>
									</div>
								</li>
							{/each}
						</ul>
					</div>
					<div class="bg" style="background-color:{season.color}" />
				</div>
			{/each}
		</div>
		{#if blok.show_sidebar}
			<aside
				style:background-color={blok.sidebar_background_color}
				style:color={blok.sidebar_text_color}
				class="sidebar"
			>
				{#if blok.show_other_cycles}
					<div class="links">
						<h3 class="title-md">All Lectionary Guides</h3>
						<ul class="links-list">
							{#each lectionaryPages as link}
								<a
									href="/{link.full_slug}"
									class="sidebar-link"
									class:active={$page.url.pathname.slice(1).concat('/') === link.full_slug}
								>
									<span>{link.name || 'Label'}</span>
								</a>
							{/each}
						</ul>
					</div>
				{/if}
				{#each otherContent as item}
					{#if item.component === 'image'}
						<div class="image-wrap">
							<Image image={item.image} sizes="600px" />
						</div>
					{/if}
					{#if item.component === 'link'}
						<a href={GetUrl(item.link)} class="link">
							<span>{item.title || 'Label'}</span>
						</a>
					{/if}
					{#if item.component === 'links'}
						<Links blok={item} />
					{/if}
					{#if item.component === 'button'}
						<ButtonLink
							label={item.label}
							link={GetUrl(item.link)}
							btnStyle={item.style}
							btnColor={item.color}
						/>
					{/if}
					{#if item.component === 'text'}
						<RichText content={item.content} />
					{/if}
					{#if item.component === 'divider'}
						<div class="divider" />
					{/if}
				{/each}
			</aside>
		{/if}
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

		@include breakpoint('tablet') {
			gap: 40px;
			flex-direction: column;
		}
	}

	.sidebar {
		gap: 30px;
		display: flex;
		width: 300px;
		flex: 0 0 300px;
		flex-direction: column;
		overflow: hidden;
		padding: 30px;
		border-radius: 8px;
		background-color: var(--c-cream);

		.image-wrap {
			width: 100%;
			height: auto;
			overflow: hidden;
			border-radius: 8px;
		}
		@include breakpoint('tablet') {
			flex: 1 1 auto;
			margin: 0 -35px;

			.week-nav {
				display: none;
			}
		}
	}

	.link {
		grid-column: 100px 1fr;
		// color: var(--c-orange-dark);
		font-size: 20px;
	}

	.date {
		color: var(--c-tan-dark);
		font-family: var(--font-display);
		font-size: 20px;
	}

	.section {
		gap: 35px;
		display: flex;
		width: 100%;
		flex: 1 1 100%;
		flex-direction: column;
	}
	.season_image {
		width: 200px;
		height: 200px;
		flex: 0 0 auto;
		overflow: hidden;
		border-radius: 5px;
		img {
			object-fit: cover !important;
		}
		@media only screen and (max-width: 1100px) {
			flex: 1 1 auto;
		}
		@include breakpoint('tablet') {
			width: 100%;
			height: auto;
		}
	}
	.row {
		gap: 20px;
		display: flex;
		position: relative;
		width: 100%;
		flex: 1 1 100%;
		flex-direction: row;
		padding: 20px;
		@include breakpoint('tablet') {
			gap: 40px;
			flex-direction: column;
		}
	}

	.bg {
		display: block;
		opacity: 0.1;
		position: absolute;
		z-index: 0;
		inset: 0;
		border-radius: 8px;
		background-color: var(--c-tan-dark);
	}

	.sub-section {
		gap: 4px;
		display: flex;
		position: relative;
		z-index: 2;
		width: 100%;
		flex: 1 1 100%;
		flex-direction: column;

		> ul {
			margin: 0 0 0 10px;
			padding: 0 0 0 20px;

			> li {
				color: var(--c-tan-dark);
				list-style: disc;

				.grid {
					grid-template-columns: 94px 1fr;
					display: grid;

					// @include breakpoint('tablet') {
					// 	grid-template-columns: 1fr;
					// 	grid-template-rows: auto auto;
					// }

					a {
						gap: 0;
						display: flex;
						@include breakpoint(phone) {
							display: inline-block;
						}
						.scripture-ref {
							text-wrap: nowrap;
							&::before {
								content: ',';
								display: inline-block;
								padding-right: 5px;
							}
						}
					}

					@media only screen and (max-width: 1200px) {
						grid-template-columns: 1fr;
						grid-template-rows: auto auto;
					}
				}
			}
		}
	}

	.divider {
		width: 100%;
		height: 1px;
		background-color: var(--c-tan-light);
	}

	.season {
		display: block;
		width: 100%;
		height: 1px;
		margin: 5px 0;
	}

	.season-title {
		padding: 8px 12px 7px;
		color: var(--c-white);
		border-radius: 5px;
	}
</style>
