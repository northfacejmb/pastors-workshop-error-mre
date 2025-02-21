<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';
	import type { SocialButtonStoryblok } from '$src/types/storyblok';
	import { GetUrl } from '$src/utils/general';
	import Icon from '$components/reusable-components/icon.svelte';

	interface BasicSocialLink {
		network: string;
		link: string;
	}

	export let socialBtn: SocialButtonStoryblok | undefined = undefined;
	export let color = '#000';
	export let hoverColor = '#fff';
</script>

{#key socialBtn}
	{#if socialBtn && socialBtn.link}
		<a
			href={GetUrl(socialBtn.link)}
			class="social-nav-link"
			aria-label={socialBtn.network}
			target="_blank"
			style={`--link-color: ${color}; --hover-color: ${hoverColor};`}
			><div class="s-icon">
				<Icon name={socialBtn.network} width="20" />
			</div></a
		>
	{/if}
{/key}

<style lang="scss">
	.social-nav-link {
		display: flex;
		position: relative;
		z-index: 1;
		width: 38px;
		height: 38px;
		align-items: center;
		justify-content: center;
		color: var(--c-black);
		background-color: none;
		&::after {
			content: '';
			position: absolute;
			z-index: -1;
			bottom: 0;
			width: 100%;
			height: 4px;
			background-color: var(--link-color);
			transition: width 150ms ease-in-out;
			transition: height 150ms ease-in-out;
		}
		&:hover,
		&:focus {
			color: var(--hover-color);
			border-color: transparent;

			&::after {
				width: 100%;
				height: 100%;
			}
		}
		.s-icon {
			height: 20px;
			flex-basis: 0 0 auto;
		}
	}
</style>
