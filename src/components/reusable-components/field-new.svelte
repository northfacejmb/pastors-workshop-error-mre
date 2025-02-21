<script lang="ts">
	import type {
		InputCheckboxesStoryblok,
		InputDateStoryblok,
		InputDropdownStoryblok,
		InputFileStoryblok,
		InputSubChoiceStoryblok,
		InputTextStoryblok,
		FirstAndLastNameStoryblok,
		FullNameStoryblok,
		EmailInputStoryblok,
		CompanyStoryblok,
		PhoneNumberStoryblok,
		MessageFieldStoryblok
	} from '$src/types/storyblok';
	import Select from 'svelte-select';
	// import FieldSelect from './field-select.svelte';

	export let content:
		| InputCheckboxesStoryblok
		| InputDateStoryblok
		| InputDropdownStoryblok
		| InputFileStoryblok
		| InputSubChoiceStoryblok
		| InputTextStoryblok
		| FirstAndLastNameStoryblok
		| FullNameStoryblok
		| EmailInputStoryblok
		| CompanyStoryblok
		| PhoneNumberStoryblok
		| MessageFieldStoryblok;
	export let margin: string = '0 0 0 0';
	export let type: TextFieldType = content.type;
	// console.log(content);
</script>

<div class="reuse-field" class:half={content.width === 'half'} style="margin: {margin}">
	<!-- Text -->
	{#if content.component === 'full_name'}
		<label for="FULLNAME">
			{content.label || 'Full Name'}
			{#if content.required === false}
				<span class="optional text-body">(optional)</span>
			{/if}
		</label>
		<input
			id="FULLNAME"
			name="FULLNAME"
			type="text"
			autocomplete="name"
			placeholder={content.placeholder || 'First & Last Name'}
			required={content.required}
		/>
	{:else if content.component === 'email_input'}
		<label for="EMAIL">
			{content.label || 'Email'}
			{#if content.required === false}
				<span class="optional text-body">(optional)</span>
			{/if}
		</label>
		<input
			id="EMAIL"
			name="EMAIL"
			type="email"
			autocomplete="email"
			placeholder={content.placeholder || 'name@company.com'}
			required={content.required}
		/>
	{:else if content.component === 'company'}
		<label for="COMPANY">
			{content.label || 'Company'}
			{#if content.required === false}
				<span class="optional text-body">(optional)</span>
			{/if}
		</label>
		<input
			id="COMPANY"
			name="COMPANY"
			type="text"
			autocomplete="organization"
			placeholder={content.placeholder || 'Company Name'}
			required={content.required}
		/>
	{:else if content.component === 'phone_number'}
		<label for="PHONE">
			{content.label || 'Phone Number'}
			{#if content.required === false}
				<span class="optional text-body">(optional)</span>
			{/if}
		</label>
		<input
			id="PHONE"
			name="PHONE"
			type="tel"
			autocomplete="tel"
			placeholder={content.placeholder || '555-555-5555'}
			required={content.required}
		/>
	{:else if content.component === 'message_field'}
		<label for="MESSAGE">
			{content.label || 'Message'}
			{#if content.required === false}
				<span class="optional text-body">(optional)</span>
			{/if}
		</label>
		<textarea
			id="MESSAGE"
			name="MESSAGE"
			rows={content.rows || 4}
			placeholder={content.placeholder || ''}
			required={content.required}
		/>
	{/if}
	{#if content.component === 'input_text'}
		{#if content.size === 'single'}
			{#if content.format === 'text'}
				<input
					id={content.id}
					name={content.id}
					type="text"
					placeholder={content.hint}
					required={content.required}
				/>
			{:else if content.format === 'email'}
				<input
					id={content.id}
					name={content.id}
					type="email"
					placeholder={content.hint}
					required={content.required}
				/>
			{:else if content.format === 'phone'}
				<input
					id={content.id}
					name={content.id}
					type="phone"
					placeholder={content.hint}
					required={content.required}
				/>
			{:else if content.format === 'url'}
				<input
					id={content.id}
					name={content.id}
					type="url"
					placeholder={content.hint}
					required={content.required}
				/>
			{:else if content.format === 'password'}
				<input
					id={content.id}
					name={content.id}
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
		font-family: var(--font-mono);
		// font-weight: 650;
		font-size: 16px;
		.optional {
			position: relative;
			left: 0px;
			font-family: var(--font-mono);
			font-size: 16px;
		}
		@include breakpoint('tablet') {
			font-size: 12px;
		}
	}

	input,
	textarea {
		resize: none;
		display: block;
		width: 100%;
		padding: 6px 10px;
		font-family: var(--font-mono);
		border: 2px solid var(--c-gray);
		border-bottom: 2px solid var(--c-blue-400);
		background-color: var(--c-gray);

		&:focus {
			border: 2px solid var(--c-blue-400);
			outline: none;
		}
	}

	// input.svelte-apvs86.svelte-apvs86.svelte-apvs86 {
	// 	border: 10px solid #000000;
	// }
</style>
