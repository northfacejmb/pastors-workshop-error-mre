<script lang="ts">
	import ButtonLink from '$components/reusable-components/button-link.svelte';
	import type { ButtonStoryblok } from '$src/types/storyblok';
	import { GetUrl } from '$src/utils/general';
	export let buttons: ButtonStoryblok[];
	export let centered: boolean = false;
	export let darkBackgroundStyles: boolean = false;

	export let btnColor = 'orange';
	export let btnStyle = 'solid';

	// console.log(btnStyle);
</script>

{#key buttons}
	<div class="button-group {btnStyle}" class:centered>
		{#each buttons as button}
			{#if typeof button.link != 'string' && button.link.anchor}
				<ButtonLink
					label={button.label}
					link={'#' + button.link.anchor}
					btnStyle={button.style || btnStyle}
					btnColor={button.color || btnColor}
				/>
			{:else if !button.link}
				<ButtonLink
					label="Button Label"
					link={'#'}
					btnStyle={button.style || btnStyle}
					btnColor={button.color || btnColor}
				/>
			{:else}
				<ButtonLink
					label={button.label}
					link={GetUrl(button.link)}
					btnStyle={button.style || btnStyle}
					btnColor={button.color || btnColor}
				/>
			{/if}
		{/each}
	</div>
{/key}

<style lang="scss">
	.button-group {
		gap: 15px;
		display: flex;
		width: var(--width, 100%);
		height: auto;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-start;
		@include breakpoint('tablet') {
			flex-wrap: wrap;
		}
	}
	.centered {
		justify-content: center;
	}
	.footer {
		gap: 12px;
		flex-direction: column;
		align-items: flex-start;
	}
</style>
