<script lang="ts">
	import Footer from '$components/cms-global/footer.svelte';
	import Header from '$components/cms-global/header.svelte';
	import { config } from '$src/stores/config.store.ts';
	import '$src/styles/app.scss';

</script>

<svelte:head>
	{#if $config.seo_icon && $config.seo_icon_svg}
		<link rel="icon" href={`${$config.seo_icon.filename}/m/32x32`} sizes="any" /><!-- 32×32 -->
		<link rel="icon" href={`${$config.seo_icon_svg.filename}`} type="image/svg+xml" /><!-- SVG -->
		<link rel="apple-touch-icon" href={`${$config.seo_icon.filename}/m/180x180`} /><!-- 180×180 -->
	{/if}
	<!-- <link rel="manifest" href="/manifest.webmanifest" /> -->
</svelte:head>
	<div class="application-wrapper">
		
		<Header header={$config} authenticated={true} />
			<div class="layout-wrapper">
				<slot />
			</div>
		
		<Footer footer={$config} />
	</div>


<style lang="scss">
	.application-wrapper {
		overscroll-behavior: contain;
		display: flex;
		min-height: 100vh;
		flex-direction: column;
		overflow-x: hidden;
		margin: 0px;
		background-color: var(--c-white);
		.layout-wrapper {
			display: flex;
			position: relative;
			min-height: 100px;
			flex: 1 0 auto;
			flex-direction: column;
		}
	}
</style>
