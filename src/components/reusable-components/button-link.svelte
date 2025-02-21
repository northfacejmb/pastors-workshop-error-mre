<script lang="ts">
	export let label: string;
	export let link: string;
	export let btnColor = 'orange';
	export let btnStyle = 'solid';
  export let style=""
	// console.log(link);
</script>

{#key label || btnStyle}
	<a href={link} class="btn button {btnStyle} {btnColor}" style={style} >
		<span class="btn-label">{label || 'Label'}</span>
	</a>
{/key}

<style lang="scss">
	.btn {
		display: inline-block;
		max-width: 100%;
		overflow: hidden;
		text-align: center; /* Optional: If you want the text centered */
	}

	.btn-label {
		white-space: normal;
		display: inline-block;
		width: 100%;
		text-align: center; /* Optional: If you want the text centered */
		word-wrap: break-word;
	}
	// @import '$src/styles/design/buttons';
</style>
