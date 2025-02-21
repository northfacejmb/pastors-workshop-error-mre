<script lang="ts">
	export let label: string;
	export let btnColor = 'orange';
	export let btnStyle = 'solid';
	export let version: ButtonVersion = 'primary';
	export let btnAction: () => void = () => {};
</script>

{#key label || version || btnStyle}
	<button class="btn button {version} {btnStyle} {btnColor}" on:click={btnAction}>
		<span>{label}</span>
	</button>
{/key}

<style lang="scss">
	// @import '$src/styles/design/buttons';
</style>
