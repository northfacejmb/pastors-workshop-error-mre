<script lang="ts">
	import type {
		InputCheckboxesStoryblok,
		InputDateStoryblok,
		InputDropdownStoryblok,
		InputFileStoryblok,
		InputSubChoiceStoryblok,
		InputTextStoryblok
	} from '$src/types/storyblok';
	import Select from 'svelte-select';
	// import FieldSelect from './field-select.svelte';

	export let content:
		| InputCheckboxesStoryblok
		| InputDateStoryblok
		| InputDropdownStoryblok
		| InputFileStoryblok
		| InputSubChoiceStoryblok
		| InputTextStoryblok;
	export let margin: string = '0 0 0 0';
	export let value: string | number;
	export let type: TextFieldType = content.type;
	// console.log(content);
</script>

<div class="reuse-field" class:half={content.width === 'half'} style="margin: {margin}">
	<label for={content.id}>
		{content.label}
		{#if content.required === false}
			<span class="optional text-body">(optional)</span>
		{/if}
	</label>
	<!-- Text -->
	{#if content.component === 'input_text'}
		{#if content.size === 'single'}
			{#if content.format === 'text'}
				<input
					id={content.id}
					name={content.id}
					bind:value
					type="text"
					placeholder={content.hint}
					required={content.required}
				/>
			{:else if content.format === 'email'}
				<input
					id={content.id}
					name={content.id}
					bind:value
					type="email"
					placeholder={content.hint}
					required={content.required}
				/>
			{:else if content.format === 'phone'}
				<input
					id={content.id}
					name={content.id}
					bind:value
					type="phone"
					placeholder={content.hint}
					required={content.required}
				/>
			{:else if content.format === 'url'}
				<input
					id={content.id}
					name={content.id}
					bind:value
					type="url"
					placeholder={content.hint}
					required={content.required}
				/>
			{:else if content.format === 'password'}
				<input
					id={content.id}
					name={content.id}
					bind:value
					type="password"
					placeholder={content.hint}
					required={content.required}
				/>
			{/if}
		{/if}
		{#if content.size === 'multiline'}
			<textarea
				id={content.id}
				name={content.id}
				bind:value
				placeholder={content.hint}
				required={content.required}
				rows="4"
			/>
		{/if}
	{/if}

	<!-- Dropdown -->
	{#if content.component === 'input_dropdown'}
		<Select
			id={content.id}
			name={content.id}
			bind:value
			items={content.choices}
			placeholder={content.hint}
			showChevron
			required={content.required}
			--border="1px solid var(--c-gray)"
			--border-radius="0px"
		/>
	{/if}
</div>

<style lang="scss">
	.reuse-field {
		width: 20px;
		flex: 0 0 100%;

		&.half {
			min-width: 200px;
			flex: 1 1 40%;
		}
	}

	label {
		display: block;
		margin: 0 0 10px 0;
		font-weight: 650;

		.optional {
			position: relative;
			left: 0px;
		}
	}

	input,
	textarea {
		resize: none;
		display: block;
		width: 100%;
		padding: 6px 10px;
		border: 1px solid var(--c-gray);
		border-radius: 8px;
		&:focus {
			outline: 2px solid var(--c-teal);
		}
	}

	input.svelte-apvs86.svelte-apvs86.svelte-apvs86 {
		border: 10px solid #000000;
	}
</style>
