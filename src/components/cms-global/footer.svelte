<script lang="ts">
	import Icon from '$components/reusable-components/icon.svelte';
	import type { ConfigStoryblok } from '$src/types/storyblok';
	import { GetUrl } from '$src/utils/general';

	export let footer: ConfigStoryblok;

	const currentYear = new Date().getFullYear();

	const replaceYear = (str: string) => {
		return str.replace(/\[currentYear\]/g, currentYear.toString());
	};

	// console.log(footer);
</script>

<footer>
	<div class="footer max-width">
		<div class="footer-main">
			<div class="footer-menus">
				{#if footer?.footer_menus && footer.footer_menus.length > 0}
					{#each footer.footer_menus as menu}
						<div class="footer-menu">
							<h2>{menu.menu_title}</h2>
							<ul>
								{#each menu.menu_links as item}
									<li>
										<!-- <pre>{JSON.stringify(item, 0, 2)}</pre> -->
										<a href={GetUrl(item.link_url)}>{item.title}</a>
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				{/if}
			</div>
			<div class="social-menu">
				<h2>Follow Us</h2>
				<div class="social-links">
					{#if footer.footer_social && footer.footer_social.length > 0}
						<ul aria-label="Social Media Links" class="social-links">
							{#each footer.footer_social as link}
								<li>
									<a
										href={GetUrl(link.link)}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={link.network}
									>
										<Icon name={link.network} width="20" />
										<span class="sr-only">{link.network}</span>
									</a>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
				<div class="cta-button">
					{#if footer.footer_cta && footer.footer_cta.length > 0}
						{#each footer.footer_cta as cta}
							<a href={GetUrl(cta.link_url)}>{cta.title}</a>
						{/each}
					{/if}
				</div>
			</div>
		</div>
		<div class="footer-copyright">
			<div class="legal-links">
				{#if footer.footer_legal && footer.footer_legal.length > 0}
					{#each footer.footer_legal as link}
						<a href={GetUrl(link.link_url)}>{link.title}</a>
					{/each}
				{/if}
			</div>
			<div class="copyright">
				<p>{replaceYear(footer.footer_copyright || '')}</p>
				<Icon name="cross-logo" width="20" />
			</div>
		</div>
	</div>
</footer>

<style lang="scss">
	footer {
		position: relative;
		width: 100%;
		padding: 0 35px;
		color: var(--c-white);
		background-color: var(--c-gray);
		a {
			color: var(--c-tan-light);
			font-size: 18px;
			cursor: pointer;
			&:hover,
			&:focus {
				color: var(--c-orange);
			}
		}
	}
	.footer {
		padding: 60px 0 30px;

		@include breakpoint(tablet) {
		}
	}

	.footer-main {
		gap: 60px;
		display: flex;
		width: 100%;
		justify-content: space-between;
		padding-bottom: 30px;
		border-bottom: 1px solid var(--c-gray-light);
		@include breakpoint(tablet) {
			flex-direction: column;
		}
	}
	.footer-menus {
		gap: 60px;
		grid-template-columns: repeat(auto-fit, minmax(120px, max-content));
		white-space: nowrap;
		display: grid;
		flex: 1;

		h2 {
			margin-bottom: 10px;
			color: var(--c-white);
			font-family: var(--font-display);
			text-transform: uppercase;
			cursor: default;
		}
		@include breakpoint(tablet) {
			grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		}
		@include breakpoint(phone) {
			gap: 40px;
			grid-template-columns: 1fr;
			justify-items: center;
			text-align: center;
		}
	}

	.social-menu {
		h2 {
			margin-bottom: 15px;
			color: var(--c-white);
			font-size: 18px;
			text-align: right;
			cursor: default;
			@include breakpoint(tablet) {
				text-align: center;
			}
		}
	}

	.social-links {
		gap: 13px;
		display: flex;
		justify-content: flex-end;
		@include breakpoint(tablet) {
			justify-content: center;
		}
	}

	.icon-link {
		place-items: center;
		aspect-ratio: 1;
		display: grid;
		width: 40px;
		height: 40px;
		margin-bottom: 20px;
		color: var(--c-orange);
		text-decoration: none;
		border-radius: 50%;
		background-color: var(--c-gray-dark);
		&:hover,
		&:focus {
			color: var(--c-white);
		}
	}

	.cta-button a {
		white-space: nowrap;
		display: block;
		width: 100%;
		height: max-content;
		padding: 10px 20px 8px;
		font-family: var(--font-display);
    color: var(--c-white);
		font-size: 30px;
		text-align: center;
		border-radius: 10px;
		background-color: var(--c-orange);
		transition: background-color 150ms ease-in-out, color 150ms ease-in-out;
		&:hover,
		&:focus {
			color: var(--c-orange);
			text-decoration: none;
			background-color: var(--c-gray-dark);
		}
		@include breakpoint(tablet) {
			width: fit-content;
			margin: 0 auto;
		}
	}

	.footer-copyright {
		gap: 30px;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		padding-top: 30px;
		.legal-links {
			gap: 15px;
			display: flex;
			flex-wrap: wrap;
			@include breakpoint(tablet) {
				justify-content: center;
			}
		}
		.copyright {
			gap: 10px;
			display: flex;
			align-items: center;
			color: var(--c-orange);
			p {
				color: var(--c-tan-light);
			}
		}
		@include breakpoint(tablet) {
			gap: 20px;
			align-content: center;
			flex-direction: column;
		}
	}
	.sr-only {
		white-space: nowrap; /* added line */
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		margin: -1px;
		padding: 0;
		border: 0;
		clip: rect(0, 0, 0, 0);
	}
</style>
