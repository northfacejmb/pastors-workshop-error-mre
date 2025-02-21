<script lang="ts">
	import Icon from './icon.svelte';

	export let ruleNumber: number;

	const socialItems = [
		{
			network: 'facebook'
		},
		{
			network: 'twitter'
		},
		{
			network: 'linkedin'
		},
		{
			network: 'email'
		}
	];

	function getShareUrl(network: string, rule_no: number) {
		if (network === 'facebook') {
			return `https://www.facebook.com/sharer/sharer.php?u=www.rule29.com/rules/rule-${rule_no}`;
		}
		if (network === 'twitter') {
			return `https://twitter.com/intent/tweet?url=www.rule29.com/rules/rule-${rule_no}`;
		}
		if (network === 'linkedin') {
			return `https://www.linkedin.com/shareArticle?mini=true&url=www.rule29.com/rules/rule-${rule_no}`;
		}
		if (network === 'email') {
			return `mailto:?subject=Rule 29 - Rule ${rule_no}&body=www.rule29.com/rules/rule-${rule_no}`;
		}
	}
</script>

<div class="rule-share">
	<p class="share-title">Share this Rule</p>
	<nav class="social-nav">
		<ul class="social-nav-list">
			{#each socialItems as item, i}
				<li class="social-nav-item">
					<a
						class="social-nav-link"
						href={getShareUrl(item.network, ruleNumber)}
						aria-label={item.network}
						target="_blank"
						><div class="s-icon"><Icon name={item.network} width="20" /></div>
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</div>

<style lang="scss">
	.rule-share {
		gap: 40px;
		display: flex;
		align-items: center;
		@include breakpoint(tablet) {
			gap: 20px;
		}
		@include breakpoint(phone) {
			flex-wrap: wrap;
			justify-content: center;
		}
	}
	.share-title {
		font-size: 1.125rem;
		font-weight: bold;
	}
	.social-nav {
		.social-nav-list {
			gap: 10px;
			display: flex;
			width: 100%;
			flex-wrap: wrap;
			justify-content: flex-start;
			@include breakpoint(tablet) {
				gap: 20px;
			}
		}

		.social-nav-link {
			display: flex;
			position: relative;
			z-index: 1;
			width: 38px;
			height: 38px;
			align-items: center;
			justify-content: center;
			color: var(--c-white);
			background-color: none;
			&::after {
				content: '';
				position: absolute;
				z-index: -1;
				bottom: 0;
				width: 100%;
				height: 4px;
				background-color: var(--c-yellow);
				transition: width 150ms ease-in-out;
				transition: height 150ms ease-in-out;
			}
			&:hover,
			&:focus {
				color: var(--c-black);
				border-color: transparent;
				background-color: var(--c-teal);
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
	}
</style>
