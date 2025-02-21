<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$components/reusable-components/button-link.svelte';
  import { onMount } from 'svelte';
  import {fetchRedirectsAndNavigate} from '$src/utils/tempRedirects.ts'
  export let data;

 let loading = true ;
  onMount(async () => {
    const redirected = await fetchRedirectsAndNavigate(data.storyblokApi ,$page.url.pathname)

    loading = redirected
    
  })
  
</script>

<div class="wrapper">
	<div class="content max-width">
    {#if loading}<h1 class="title-lg">Page has moved...</h1>
    <p class="text-body">Working on redirecting you to the right page, stand by </p>{:else}
		<h1 class="title-lg">{$page.status} {$page.error?.message}</h1>
		<p class="text-body">Behold, a minor misstep! Even Paul took a few detours on his journeys.</p>
		<Button label="Find your way back" link="/home" />
    {/if}
	</div>
</div>

<style lang="scss">
	.wrapper {
		padding: 140px 35px;
		color: var(--c-navy);
		// background-color: var(--c-gray);
	}
	p {
		margin-bottom: 40px;
	}
	@include breakpoint(tablet) {
		.wrapper {
			padding: 40px;
			padding-bottom: 300px;
		}
	}
</style>
