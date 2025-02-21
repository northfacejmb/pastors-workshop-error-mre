<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import ButtonLink from '$components/reusable-components/button-link.svelte';
	import Icon from '$components/reusable-components/icon.svelte';
	import { mobileMenuOpen } from '$src/stores/action.store.js';
	import type { ConfigStoryblok } from '$src/types/storyblok';
	import { GetUrl } from '$src/utils/general';

	let mobileMenuOpenIndex: number | null = null;

	export let header: ConfigStoryblok;
	export let authenticated: boolean = false;

	const toggleMobileMenu = () => {
		mobileMenuOpen.update((bol) => {
			return !bol;
		});
	};

	const openMobileMenuSub = (index: number) => {
		mobileMenuOpenIndex = index === mobileMenuOpenIndex ? null : index;
	};

	const onLinkClick = () => {
		console.log('Link Click');
		mobileMenuOpen.set(false);
	};

	beforeNavigate(() => onLinkClick());
</script>

{#key header}
	<header class="header-wrap">
		<div class="header max-width {$mobileMenuOpen ? 'open' : 'closed'}">
			<div class="top-wrap">
				<!-- LOGO -->
				<a href="/home" class="logo-link logo-wrapper" aria-label="Back to the home page">
					<Icon name="cross-logo" width="30" />
				</a>

				<!-- NAV MENU BTN -->
				{#if header.header_nav_menu}
					<button
						aria-label="Mobile Menu"
						class={`mobile-menu-btn show-tablet ${$mobileMenuOpen ? 'open' : 'closed'}`}
						on:click={toggleMobileMenu}
					>
						<div class="icon-wrapper">
							<div class="line top" />
							<div class="line middle" />
							<div class="line bottom" />
						</div>
					</button>
				{/if}
			</div>

			<nav class={`header-nav ${$mobileMenuOpen ? 'open' : 'closed'}`}>
				<button
					aria-label="Mobile Menu"
					class={`mobile-menu-btn inside-close show-tablet ${$mobileMenuOpen ? 'open' : 'closed'}`}
					on:click={toggleMobileMenu}
				>
					<div class="icon-wrapper">
						<div class="line top" />
						<div class="line middle" />
						<div class="line bottom" />
					</div>
				</button>
				{#if header.header_nav_menu}
					<ul class="header-nav-list">
						{#each header.header_nav_menu as item, i}
							{#if item.component === 'menu_item'}
								<li class="header-nav-item" on:click={onLinkClick} on:input={onLinkClick}>
									<ButtonLink
										label={item.label}
										link={GetUrl(item.link)}
										btnStyle={item.primary ? 'nav primary' : 'nav'}
									/>
								</li>
							{/if}

							{#if item.component === 'menu_item_parent'}
								<li class="header-nav-item-parent">
									<div
										class={`header-nav-link-wrapper ${
											i === mobileMenuOpenIndex ? 'open' : 'closed'
										}`}
									>
										{#if item.link && (item.link.url || item.link.id)}
											<a class="header-nav-link-parent" href={GetUrl(item.link)}>{item.label}</a>
										{:else}
											<button
												on:click={() => openMobileMenuSub(i)}
												aria-label="Mobile Sub Menu Toggle"
												class="header-nav-link-parent"
												>{item.label}
											</button>
										{/if}
										<button
											class={`hide-desktop mobile-menu-expand-btn ${
												i === mobileMenuOpenIndex ? 'open' : 'closed'
											}  show-tablet`}
											on:click={() => openMobileMenuSub(i)}
											aria-label="Mobile Sub Menu Toggle"
											><svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 13.536 9.402"
												class="icon"
											>
												<path
													id="Path_7"
													data-name="Path 7"
													d="M1540,1201.479l7.2,6-7.2,6"
													transform="translate(1214.248 -1539.36) rotate(90)"
													fill="none"
													stroke="#fff"
													stroke-width="2"
												/>
											</svg>
										</button>
									</div>

									<ul
										class={`header-nav-sub-list ${i === mobileMenuOpenIndex ? 'open' : 'closed'}`}
									>
										{#each item.sub_links as subItem}
											{#if subItem.link}
												<li class="header-nav-item-sub ">
													<a class="header-nav-link-sub" href={GetUrl(subItem.link)}
														>{subItem.label}</a
													>
												</li>
											{/if}
										{/each}
									</ul>
								</li>
							{/if}
						{/each}
					</ul>
				{/if}
				{#if header.header_nav_menu_2}
					<ul class="header-nav-list secondary">
						{#each header.header_nav_menu_2 as item, i}
							{#if item.component === 'menu_item'}
								<li class="header-nav-item" on:click={onLinkClick} on:input={onLinkClick}>
									<ButtonLink
										label={item.label}
										link={GetUrl(item.link)}
										btnStyle={item.primary ? 'gradient-cool nav-primary' : 'nav'}
									/>
								</li>
							{/if}

							{#if item.component === 'menu_item_parent'}
								<li class="header-nav-item-parent">
									<div
										class={`header-nav-link-wrapper ${
											i === mobileMenuOpenIndex ? 'open' : 'closed'
										}`}
									>
										{#if item.link && (item.link.url || item.link.id)}
											<a class="header-nav-link-parent" href={GetUrl(item.link)}>{item.label}</a>
										{:else}
											<button
												on:click={() => openMobileMenuSub(i)}
												aria-label="Mobile Sub Menu Toggle"
												class="header-nav-link-parent"
												>{item.label}
											</button>
										{/if}
										<button
											class={`hide-desktop mobile-menu-expand-btn ${
												i === mobileMenuOpenIndex ? 'open' : 'closed'
											}  show-tablet`}
											on:click={() => openMobileMenuSub(i)}
											aria-label="Mobile Sub Menu Toggle"
											><svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 13.536 9.402"
												class="icon"
											>
												<path
													id="Path_7"
													data-name="Path 7"
													d="M1540,1201.479l7.2,6-7.2,6"
													transform="translate(1214.248 -1539.36) rotate(90)"
													fill="none"
													stroke="#fff"
													stroke-width="2"
												/>
											</svg>
										</button>
									</div>

									<ul
										class={`header-nav-sub-list ${i === mobileMenuOpenIndex ? 'open' : 'closed'}`}
									>
										{#each item.sub_links as subItem}
											{#if subItem.link}
												<li class="header-nav-item-sub">
													<a class="header-nav-link-sub" href={GetUrl(subItem.link)}
														>{subItem.label}</a
													>
												</li>
											{/if}
										{/each}
									</ul>
								</li>
							{/if}
						{/each}
						{#if !authenticated}
							<li class="header-nav-item center">
								<a href="/pricing" class="btn button nav "><span>Pricing</span></a>
							</li>
						{/if}
							{#if authenticated}
              <li class="header-nav-item center">
								<a href="/account" class="btn button nav  center"><span>Account</span></a>
              </li>
							{:else}
              <li class="header-nav-item center">
                <a href="/login" class="btn login center"><span>Login</span></a>
              </li>
                <li class="header-nav-item center">
								<a href="/pricing?free-trial=true" class="btn orange center"><span>Free Trial</span></a>
              </li>
							{/if}
					</ul>
				{/if}
			</nav>
		</div>
	</header>
{/key}

<style lang="scss">
	.header-wrap {
		--header-bg: var(--c-gray);
		position: relative;
		z-index: 10;
		padding: 0 35px;
		background-color: var(--header-bg);

		@include breakpoint('tablet') {
			--bar-height: 78px;
			// position: sticky;
			top: 0;
		}
	}
	.header {
		gap: 10px;
		padding-block: 16px;
		display: flex;
		position: relative;
		z-index: 10;
		flex: 1 0 auto;
		align-items: center;
		justify-content: flex-start;
		color: var(--c-white);

		@include breakpoint('tablet') {
			--bar-height: 78px;
			top: 0;
			left: 0;
			width: 100%;
			max-width: 100dvw;

			&.open {
				.logo-link {
					opacity: 0;
					pointer-events: none;
				}

				.top-wrap {
					opacity: 0;
					pointer-events: none;
				}
			}
		}
	}
	.center {
		text-align: center;
	}
	.top-wrap {
		position: relative;
		@include breakpoint('tablet') {
			display: flex;
			z-index: 5;
			width: 100%;
			align-items: center;
			justify-content: space-between;
			padding: 0;
		}
	}
	.logo-link {
		display: block;
		position: relative;

		@media (pointer: fine) and (hover) {
			&:hover,
			&:focus {
				color: var(--c-white);
			}
		}
	}

	.header-nav {
		gap: 44px;
		display: flex;
		max-width: 100dvw;
		height: max-content;
		flex: 3;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;

		@include breakpoint('tablet') {
			display: block;
			opacity: 0;
			position: fixed;
			z-index: 3;
			inset: 0px 0px auto 0px;
			height: auto;
			flex: 0 0 auto;
			transform: translateY(-200px);
			transform-origin: top;
			padding: 40px 30px 40px 30px;
			background-color: var(--c-gray-dark);
			box-shadow: 0px 10px 30px #00000029;
			pointer-events: none;
			transition: height 250ms ease-in-out, transform ease-out 250ms, opacity 100ms ease-out,
				visibility 100ms;
			&.closed {
				visibility: hidden;
			}
			&.open {
				opacity: 1;
				width: 100%;
				height: max-content;
				transform: translateY(0);
				pointer-events: inherit;
			}
		}
	}
	.header-nav-list {
		gap: 10px;
		display: flex;
		// height: 100%;
		flex-direction: row;
		flex-wrap: nowrap;
		// align-items: center;

		font-size: 28px;
		&.secondary {
			font-size: 18px;
		}

		@include breakpoint('tablet') {
			gap: 0;
			height: unset;
			flex-direction: column;
			align-items: center;
			font-weight: normal;
		}
	}
	.header-nav-item {
		width: 100%;
    height: 50px;
    display: flex;
    align-items: center;
    // height: 100%;
	}
  .pd-5{
    padding: 5px;
  }

	.header-nav-item-parent {
		position: relative;
		z-index: 0;
		&::after {
			content: '';
			position: absolute;
			z-index: -1;
			top: 0;
			left: 0;
			width: 100%;
			height: 4px;
			background: var(--c-blue-400);
			transition: height 60ms ease-in-out;
		}

		// @media (min-width: 851px) {
		// 	transition: all 150ms ease-in-out;
		// 	@media (pointer: fine) and (hover) {
		// 		&:hover,
		// 		&:focus,
		// 		&:focus-within {
		// 			color: var(--c-black);
		// 			// border-color: var(--c-black);
		// 			// background-color: var(--c-blue-200);
		// 			.header-nav-sub-list {
		// 				opacity: 1;
		// 				visibility: visible;
		// 				transform: scaleY(100%);
		// 				// border-color: var(--c-teal);
		// 			}
		// 		}
		// 	}
		// }
		@include breakpoint('tablet') {
			display: flex;
			width: 100%;
			flex-direction: column;
			margin: 0;
		}
		@media (pointer: fine) and (hover) {
			@media (min-width: 851px) {
				&:hover,
				&:focus,
				&:focus-within {
					color: var(--c-white);
					text-decoration: none;
					outline: none;
					&::after {
						content: '';
						position: absolute;
						top: 0;
						left: 0;
						width: 100%;
						height: 100%;
						background: linear-gradient(180deg, var(--c-blue-400), #1965d0);
						@include breakpoint('tablet') {
							border-radius: 0px 0px 20px 20px;
							background: var(--c-blue-600);
						}
					}
				}
			}
			@include breakpoint('tablet') {
				&:hover,
				&:focus {
					color: var(--c-white);
					text-decoration: none;
					outline: none;
					&::after {
						content: '';
						position: absolute;
						top: 0;
						left: 0;
						width: 100%;
						height: 100%;
						border-radius: 0px 0px 20px 20px;
						background: var(--c-blue-600);
					}
				}
			}
		}
	}
	.header-nav-link-parent {
		gap: 10px;
		display: flex;
		z-index: 2;
		width: max-content;
		padding: 18px 36px;
		font-size: 18px;
		font-weight: bold;
		text-decoration: none;

		&:hover,
		&:focus {
			color: var(--c-white);
			cursor: pointer;
		}
		@media (max-width: 1500px) {
			padding: 16px 20px;
			font-size: 1.2rem;
		}
		@include breakpoint('tablet') {
			width: 100%;
			padding: 0;
			color: var(--c-white);
			font-size: 24px;
		}
	}
	.header-nav-link-wrapper {
		display: flex;
		z-index: 0;
		width: 100%;
		height: 100%;

		@include breakpoint('tablet') {
			width: 100%;
			align-items: center;
			justify-content: space-between;

			&.open {
				background-color: var(--c-blue-600);
				.header-nav-link,
				.mobile-menu-expand-btn {
					// color: var(--c-white);
					// text-decoration: none;
				}
			}

			&.closed {
				&:hover,
				&:focus {
					.icon {
						transform: translateY(6px);
					}
				}
				.header-nav-link,
				.mobile-menu-expand-btn {
					// color: var(--c-white) !important;
					// text-decoration: none;
				}
			}
		}
	}
	.header-nav-sub-list {
		opacity: 0;
		visibility: hidden;
		position: absolute;
		z-index: 1;
		top: 59px;
		left: 0px;
		transform: scaleY(50%);
		transform-origin: center top;
		overflow: hidden;
		color: var(--c-white);
		border-radius: 0px 0px 20px 20px;
		transition: opacity 50ms ease-in-out 70ms, transform 100ms ease-out 60ms;
		&:hover,
		&:focus,
		&:focus-within {
			opacity: 1;
			visibility: visible;
		}
		@include breakpoint('tablet') {
			display: hidden;
			opacity: 0;
			position: absolute;
			z-index: 1;
			top: 0;
			right: 0;
			left: 0;
			width: 100%;
			transform: translateY(-10%);
			transform-origin: top;
			padding: 0 0;
			border: none;
			border-radius: 0;
			border-radius: 0px 0px 20px 20px;

			// background-color: var(--c-navy);
			transition: transform ease-out 200ms, opacity 200ms ease-out;

			&.open {
				display: block;
				opacity: 1;
				visibility: visible;
				position: relative;
				transform: translateY(0);
				padding-bottom: 10px;
			}
		}
	}
	.header-nav-link-sub {
		gap: 10px;
		display: flex;
		position: relative;
		z-index: 1;
		width: 100%;
		align-items: center;
		padding: 12px 20px;
		font-size: 1rem;
		font-weight: normal;
		text-decoration: none;
		border-radius: 0;
		cursor: pointer;
		transition: border-color 0.2s ease-in-out, background-color 0.2s ease-in-out,
			color 0.2s ease-in-out;
		&::after {
			content: '';
			position: absolute;
			z-index: -1;
			top: 0;
			right: 0;
			left: 0;
			height: 0;
			background-color: transparent;
			transition: height 170ms ease-in-out;
		}
		&:hover,
		&:focus {
			color: var(--c-purple-600);
			cursor: pointer;
			&::after {
				height: 100%;
				background-color: var(--c-blue-200);
			}
		}
		@include breakpoint('tablet') {
			height: auto;
			padding: 7px 20px;
			color: var(--c-white);
			font-size: 1.125rem;
		}
	}
	.mobile-menu-expand-btn {
		display: flex;
		width: 100%;
		height: 100%;
		flex: 0 0 30%;
		align-items: center;
		justify-content: flex-end;
		padding: 15px;
		cursor: pointer;

		&:hover,
		&:focus {
			.icon {
				transform: translateY(8px);
			}
		}

		.icon {
			position: relative;
			width: 15px;
			height: 15px;
			transform: scaleY(100%);
			transition: transform 0.1s ease-in-out;
		}
		&.open {
			.icon {
				transform: scaleY(-100%);
			}
		}
		@include breakpoint('phone') {
			width: 100px;
		}
	}

	.mobile-menu-btn {
		display: flex;
		position: relative;
		height: 100%;
		flex: 0 0 auto;
		align-items: center;
		justify-content: flex-end;

		&.inside-close {
			position: absolute;
			z-index: 5;
			top: 20px;
			right: 36px;
			height: auto;
		}
		> .icon-wrapper {
			gap: 6px;
			display: flex;
			width: 36px;
			height: 36px;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			cursor: pointer;

			.line {
				width: 36px;
				height: 4px;
				transform-origin: center;
				background: var(--c-tan-light);
				transition: all 100ms ease-out;
			}
		}
		&.open {
			align-self: flex-end;
			// margin-top: 50px;
			.icon-wrapper {
				.line {
					background: var(--c-white);
					&.top {
						transform: translateY(10px) rotate(45deg);
					}
					&.middle {
						transform: scaleX(0);
					}

					&.bottom {
						transform: translateY(-10px) rotate(-45deg);
					}
				}
			}
		}
	}
  .login {
    align-self: center;
    justify-self: center;
    border-radius: 8px;
    padding: 5px 15px;
    color: var(--c-white);
    text-decoration: none;
    border: 1px solid var(--c-orange);
    transition: background-color 0.3s, color 0.3s;

    &:hover {
      background-color: var(--c-orange);
      color: var(--c-white);
    }
  }
  .orange {
    text-align: center;
    align-self: center;
    justify-self: center;
    padding: 5px 15px;
    background-color: var(--c-orange);
    border: 1px solid var(--c-orange);
    color: var(--c-white);
    text-decoration: none;
    border-radius: 8px;
    transition: background-color 0.3s, color 0.3s;

    &:hover {
      background-color: transparent;
      color: var(--c-orange);
      border: 1px solid var(--c-orange);
    }
  }
</style>
