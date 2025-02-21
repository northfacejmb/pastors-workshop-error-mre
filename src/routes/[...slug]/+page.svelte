<script lang="ts" use:enhanced>
	import relations from '$src/utils/relations';
	import { StoryblokComponent, useStoryblokBridge } from '@storyblok/svelte';
	import { onMount } from 'svelte';
	//@ts-expect-error
	import type { Story } from '@storyblok/svelte';
	

  
	// import { goto } from '$app/navigation'; // see Handle old URL format // below
	export let data: Story['data'] = { story: {} } as Story['data'];

	$: ({ initialSearchData, urlFilters } = data);

	onMount(() => {
		// useStoryblokBridge(data.story.id, (newStory) => (data.story = newStory), {
		// 	resolveRelations: relations
		// });
  })
	
</script>

<svelte:head>
	<title>{"title"}</title>
	
</svelte:head>
<!-- {#if data.story && !loading} seems not to need loading state here -->
{#if data.story}
			<StoryblokComponent
				blok={data.story.content}
				name={data.story?.name}
				slug={data.story.slug}
				path={data.story.full_slug}
				first_published_at={data.story.first_published_at}
				{urlFilters}
				{initialSearchData}
				paywall={false}
			/>
{/if}

<style lang="scss">
	.paywalled {
		.unauthorized-content {
			padding: 0 30px;
			background-color: var(--c-gray-dark);
			@include breakpoint('tablet') {
				padding: 10px 30px 30px 30px;
			}
		}
		.button-wrapper {
			// min-height: calc(100vh - 749px);
			// min-height: 300px;
			padding: 60px 0;
			.buttons {
				gap: 15px;
				display: flex;
				flex-direction: column;
			}
		}
	}
	.notice {
		/* Center alignment */
		display: flex;

		/* Take full height of the view */
		height: 50px;
		align-items: center; /* Vertical centering */
		justify-content: center; /* Horizontal centering */
		padding: 1em; /* Space around the text */
		color: #333333; /* Text color */
		font-size: 1.2em; /* Adjust as needed */
		// border-radius: 4px; /* Rounded corners, optional */

		/* Background and text styling */
		background-color: #f77272; /* Light red background */
		&.warning {
			background-color: #ffb122;
		}
    &.tall{
      height: 100px;
    }
	}
</style>

