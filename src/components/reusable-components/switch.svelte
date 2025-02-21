<script lang="ts">
	export let name: string;
	export let value = false;

	$: ariaLabel = `Toggle ${name.replace(/_/g, ' ')}`;
</script>

{#key name}
	<input class="switch" type="checkbox" bind:checked={value} aria-label={ariaLabel} />
{/key}

<style lang="scss">
	.switch {
		appearance: none;
		display: inline-block;
		position: relative;
		width: 62px;
		height: 32px;
		overflow: hidden;
		border: none;
		border-radius: 50px;
		outline: none;
		background-color: #707070;
		cursor: pointer;
		transition: background-color ease 0.3s;
	}

	.switch::before {
		white-space: nowrap;
		content: 'or and';
		display: block;
		position: absolute;
		z-index: 2;
		top: 2px;
		left: 2px;
		width: 28px;
		height: 28px;
		color: #ffffff;
		font: 10px/28px Helvetica;
		font-weight: bold;
		text-indent: -22px;
		text-shadow: -1px -1px rgba(0, 0, 0, 0.15);
		text-transform: uppercase;
		word-spacing: 37px;
		border-radius: 50%;
		background: #ffffff;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
		transition: all cubic-bezier(0.3, 1.5, 0.7, 1) 0.3s;
	}

	.switch:checked {
		background-color: var(--c-orange);
	}

	.switch:checked::before {
		left: 32px;
	}
</style>
