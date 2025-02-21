<script lang="ts">
	import Button from '../reusable-components/button.svelte';
	import { enhance } from '$app/forms';
	import { storyblokEditable } from '@storyblok/svelte';
	import type { SignUpFormStoryblok } from '$src/types/storyblok.d.ts';
	import { fade } from 'svelte/transition';

	export let blok: SignUpFormStoryblok;
	export let darkBackgroundStyles: boolean;
	export let isInView: boolean;
	export let animate: boolean;

	let email = '';
	let fullname = '';

	let textResult: null | string = null;
</script>

{#key blok}
	<div
		use:storyblokEditable={blok}
		class="max-width wrapper"
		class:darkBackgroundStyles
		class:animate-slide-up={animate}
		class:inview={isInView}
	>
		{#if blok.title}
			<h2 class="title-md title">{blok.title}</h2>
		{/if}
		{#if !textResult}
			<form
				class=""
				action="/api?/mailchimp"
				method="POST"
				use:enhance={({ form, data, action, cancel, submitter }) => {
					return async ({ result, update }) => {
						// console.log(result, update);
						if (result.status === 200) {
							textResult = blok.success_message;
						} else {
							// @ts-ignore
							textResult = result.error.message;
						}
					};
				}}
			>
				<label for="fullName"
					>Name<input
						type="text"
						bind:value={fullname}
						id="fullname"
						name="FULLNAME"
						required
						autocomplete="name"
						placeholder="First & Last Name"
					/></label
				>
				<label for="email"
					>Email<input
						autocomplete="email"
						bind:value={email}
						type="email"
						id="EMAIL"
						name="EMAIL"
						placeholder="Email"
						required
					/></label
				>
				<div style="position: absolute; left: -5000px;" aria-hidden="true">
					<input type="text" name="b_576f1e8a787fbc7c89d1e0071_e1538d9e18" tabindex="-1" value="" />
				</div>

				<button type="submit" id="subscribe" class:darkBackgroundStyles on:click={() => {}}
					>{blok.button_label}</button
				>
			</form>
		{:else}
			<div
				class="message header-sm"
				transition:fade
				class:error={textResult !== blok.success_message}
			>
				{textResult}
			</div>
		{/if}
	</div>
	<div class="divider" aria-hidden="true" />
{/key}

<style lang="scss">
	.wrapper {
		gap: clamp(20px, 4vw, 70px);
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		color: var(--c-navy);
		&.darkBackgroundStyles {
			color: var(--c-white);
		}
		@include breakpoint('tablet') {
			flex-direction: column;
			align-items: unset;
		}
	}
	.title {
		max-width: 380px;
		flex: 0 1 65%;
		@include breakpoint('tablet') {
			// text-align: center;
		}
	}
	form {
		gap: 20px;
		display: flex;
		flex: 1 1 30%;
		align-items: flex-end;

		@include breakpoint('tablet') {
			flex-direction: column;
			align-items: flex-start;
		}
	}
	label {
		display: inline-block;
		min-width: 185px;
		flex: 1 1 34%;
		font-size: 16px;
		font-weight: 600;
		@include breakpoint('tablet') {
			width: 100%;
			flex: 0 0 auto;
		}
	}
	input {
		display: block;
		width: 100%;
		height: 48px;
		margin-top: 10px;
		padding: 12px;
		font-size: 16px;
		font-weight: normal;
		border: 1px solid var(--c-gray);
		border-radius: 8px;

		&:focus {
			outline: 2px solid var(--c-teal);
		}
	}
	// .message {
	// 	position: absolute;
	// 	right: 0;
	// 	bottom: 60px;
	// 	color: var(--c-navy);
	// 	@include breakpoint('tablet') {
	// 		right: auto;
	// 		bottom: 10px;
	// 		left: 150px;
	// 	}
	// }

	.message {
		place-content: center;
		display: grid;
		min-height: 5em;
		flex: 1 1 30%;
	}

	.error {
		color: var(--c-red);
	}
	.divider {
		position: absolute;
		right: 0;
		// width: 100%;
		bottom: 0;
		left: 0;
		height: 10px;
		background-color: var(--c-red);
	}
	button {
		width: max-content;
		padding: 10px 30px;
		color: var(--c-white);
		font-weight: 600;
		text-decoration: none;
		border: 2px solid var(--c-red);
		border-radius: 100px;
		background-color: var(--c-red);
		cursor: pointer;
		transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out;

		&:hover,
		&:focus {
			color: var(--c-red);
			text-decoration: none;
			background: transparent;
		}
		&.darkBackgroundStyles {
			color: var(--c-navy);
			border-color: var(--c-red);
			background-color: var(--c-red);
			&:hover,
			&:focus {
				color: var(--c-red);
				background-color: transparent;
			}
		}
	}
</style>
