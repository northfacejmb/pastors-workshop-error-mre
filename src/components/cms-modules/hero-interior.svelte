<script lang="ts">
  import Image from '$components/reusable-components/image.svelte';
  import RichText from '$components/reusable-components/rich-text.svelte';
  import type { HeroInteriorStoryblok } from '$src/types/storyblok';
  import { storyblokEditable } from '@storyblok/svelte';
  import ButtonGroup from '$components/reusable-components/button-group.svelte';

  export let blok: HeroInteriorStoryblok;
  export let color: string = '';
  export const i: number = 0;
  export const path: string = '';
  export let urlFilters: any = {};
  
  export let headingTag: string = 'h1';
  export let buttons = [];

  const keyword = urlFilters.keyword;
  const bibleRef = urlFilters.bibleRef;

  $: baseTitle = blok.title;
  $: titleContent = keyword ? `${baseTitle} on ${keyword}` : baseTitle;
</script>

{#key blok}
  <div
    class="main-wrapper"
    use:storyblokEditable={blok}
    style:padding-top={blok.spacing}
    style:padding-bottom={blok.spacing}
  >
    <div class="image">
      <Image image={blok.image} />
    </div>

    <div class="max-width wrapper">
      <div class="title-wrap">
        {#if blok.prefix}
          <p class="prefix">{blok.prefix}</p>
        {/if}
        <h1 class="title-lg" style:color>
          {titleContent}
          {#if bibleRef}
          from
            <span class="bible-ref whitespace-nowrap block mt-2"> {bibleRef}</span>
          {/if}
        </h1>

        {#if !keyword && !bibleRef}
          {#if typeof blok.description === 'object'}
            <RichText content={blok.description} />
          {:else if blok.description}
            {blok.description}
          {/if}
        {/if}
      </div>
      {#if buttons && buttons.length}
        <div class="button-wrap">
          <ButtonGroup {buttons} />
        </div>
      {/if}
    </div>
  </div>
{/key}

<style lang="scss">
	.main-wrapper {
		display: flex;
		position: relative;
		min-height: 300px;
		align-items: center;
		overflow: hidden;
		padding: 0 35px;

		@include breakpoint('tablet') {
			padding: 35px;
		}
	}
	.button-wrap {
		padding: 30px 0;
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
		justify-content: center;
		color: var(--c-white);
	}

	.prefix {
		margin: 0 0 4px 0;
		color: var(--c-cream);
		font-family: var(--font-display);
		font-size: 20px;
	}

	.title-lg {
		transform: translateX(-2px);
		color: var(--c-orange);
		@include breakpoint('tablet') {
			font-size: 65px;
		}
	}
  .block {
  display: block;
}

.whitespace-nowrap {
  white-space: nowrap;
}
.bible-ref {
  @include breakpoint(phone){
    font-size: .7em;}
}

.mt-2 {
  margin-top: 0.5rem;
}
</style>
