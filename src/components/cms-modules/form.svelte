<script lang="ts">
	import { enhance } from '$app/forms';
	import Image from '$components/reusable-components/image.svelte';
	import RichText from '$components/reusable-components/rich-text.svelte';
	import { config } from '$src/stores/config.store.js';
	import type { FormStoryblok } from '$src/types/storyblok';
	import { storyblokEditable } from '@storyblok/svelte';
	export let color;
	export let path;
	export let i;

	export let blok: FormStoryblok;

	let firstName = '';
	let lastName = '';
	let email = '';
	let message = '';
	let subscribe = true;
	let notificationEmails = $config.contact_email_notifications;

	let formResult: any = null;

	$: hasImage = blok.image && (blok.image.filename || blok.image.urls);
	$: formError =
		formResult && formResult.data.errors && formResult.data.errors.length
			? formResult.data.errors[0].title
			: null;
	// console.log(blok);

  const titleSize =
		blok.title && blok.title_size ? parseInt(blok.title_size.replace('px', '')) : 35;
</script>

{#key blok}
	<div
		class="main-wrapper"
		style:background-color={blok.background_color}
		use:storyblokEditable={blok}
		style:padding-top={blok.spacing}
		style:padding-bottom={blok.spacing}
	>
		<div class="max-width wrapper {blok.image_location}">
			<div class="content-blocks">
				<div class="column">
					{#if blok.title}
						<h2 class="title-md" style:color={blok.title_color} style="font-size:{titleSize}px">{blok.title}</h2>
					{/if}
					{#if !blok?.hide_divider}<div class="divider" style:background-color={blok.divider_color} />{/if}
					{#if blok.content && blok.content.type.length}
						<div style:color={blok.text_color}><RichText content={blok.content} /></div>
					{/if}
					<!-- {#if blok.buttons && blok.buttons.length}
							<div class="buttons">
								<ButtonGroup buttons={blok.buttons} />
							</div>
						{/if} -->

					{#if !formResult}
						<form
							action="/api/contact"
							method="POST"
							style:color={blok.text_color}
							use:enhance={() => {
								return async ({ result, update }) => {
									console.log('frontend result', result);

									formResult = result;
								};
							}}
						>
							<input type="hidden" name="form_type" value={blok.form_type} />
							<input type="hidden" name="notification_emails" value={notificationEmails} />
							<div class="field-wrapper">
								<label>
									First Name
									<input name="firstName" type="text" bind:value={firstName} required />
								</label>
								<label>
									Last Name
									<input name="lastName" type="text" bind:value={lastName} required />
								</label>
							</div>
							<label>
								Email
								<input name="email" type="email" bind:value={email} required />
							</label>
							{#if blok.form_type === 'contact'}
								<label>
									Message
									<textarea name="message" type="text" bind:value={message} />
								</label>
								<!-- <label style="display: flex; align-items: center;">
									<input
										name="subscribe"
										type="checkbox"
										bind:checked={subscribe}
										style="width: 1.5em; height: 1.5em; margin-right: 10px;"
									/>
									<span>May we subscribe you to our email list?</span>
								</label> -->
							{/if}
							<button class="btn button" type="submit">{blok.button_label}</button>
						</form>
					{:else}
						<div class="result" style:color={blok.text_color}>
							{#if formError}
								<div class="message error">
									<h2 class="title-md">Error</h2>
									<p>{formError}</p>
								</div>
							{:else}
								<div class="message">
									<h2 class="title-md">Success</h2>
									<RichText content={blok.confirmation_text} />
								</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
			{#if hasImage}
				<div class="image">
					<Image image={blok.image} sizes="(max-width: 900px) 100vw, 33vw" loading="lazy" />
				</div>
			{/if}
		</div>
	</div>
{/key}

<style lang="scss">
	form {
		gap: 10px;
		display: flex;
		width: 100%;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-start;
		.field-wrapper {
			gap: 30px;
			display: flex;
			width: 100%;
      flex-wrap: wrap;
		}
		label {
			width: 100%;
			// min-width: 300px;
      max-width: 500px;
			flex: 1 1 auto;
			input {
				display: block;
				width: 100%;
        // min-width: 300px;
        max-width: 500px;
			}
      
			textarea {
				display: block;
				width: 100%;
				max-width: 350px;
				padding: 10px;
				font-size: 1rem;
				border: 1px solid #cccccc;
				border-radius: 4px;
			}
			input[type='checkbox'] {
				width: 1.5em;
				height: 1.5em;
				margin-right: 10px;
			}
		}
		.btn {
			margin: 20px 0 0 0;
		}
	}
	.main-wrapper {
		display: flex;
		position: relative;
		align-items: center;
		overflow: hidden;
		padding: 0 35px;
    border-radius: 8px;
	}

	.wrapper {
		gap: 60px;
		display: flex;
		width: 100%;
		align-items: center;

		&.right {
			flex-direction: row-reverse;
		}

		@include breakpoint('tablet') {
			gap: 40px;
			flex-direction: column;
		}
	}

	.image {
		aspect-ratio: 1 / 1;
		width: 33%;
		flex: 0 0 auto;
		overflow: hidden;
		border-radius: 9999px;
		@include breakpoint('tablet') {
			width: 100%;
		}
	}

	.content-blocks {
		gap: 60px;
		display: flex;
		width: 100%;
		flex: 1 1 100%;
		@include breakpoint('tablet') {
			gap: 80px;
			flex-direction: column;
		}
	}

	.column {
		gap: 20px;
		display: flex;
		width: 100%;
		flex: 1 1 100%;
		flex-direction: column;
	}

	.divider {
		width: 100%;
		height: 1px;
	}
	.icon {
		width: 90px;
	}
</style>
