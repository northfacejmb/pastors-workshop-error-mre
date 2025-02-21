<script lang="ts">
	import RichText from '$components/reusable-components/rich-text.svelte';
	import { onMount } from 'svelte';

	export let blok: any;
	export const i: number = 0;
	export const color: string = '';
	export const path = '';

	let script: HTMLScriptElement;

	onMount(() => {
		script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'https://donorbox.org/widget.js';
		script.id = 'app-convertbox-script';
		script.async = true;
		script.setAttribute('paypalExpress', 'false');
		document.head.appendChild(script);

		// Cleanup when component is destroyed
		return () => {
			if (script) {
				document.head.removeChild(script);
			}
		};
	});
</script>

<div class="wrapper" style="background-color:{blok.background_color}">
	{#if blok.title}
		<div class="title title-md">{blok.title}</div>
	{/if}
	{#if blok.content && typeof blok.content === 'object'}
		<div class="text-block" style:color={blok.text_color}>
			<RichText content={blok.content} />
		</div>
	{/if}

	<iframe
		src="https://donorbox.org/embed/tpw-foundations-campaign?language=en"
		name="donorbox"
		allowpaymentrequest="allowpaymentrequest"
		seamless="seamless"
		frameborder="0"
		scrolling="no"
		height="100%"
		width="100%"
		style="min-width: 250px;  max-height: none!important"
		allow="payment"
	/>
</div>

<style lang="scss">
	.wrapper {
		display: flex;
		width: 100%;
		height: 100%;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		padding: 30px;
		iframe {
			max-width: 400px;
		}
		.text-block {
			padding-bottom: 10px;
		}
		.title {
			padding: 20px;
		}
	}
</style>
