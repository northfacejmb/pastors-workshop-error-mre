<script lang="ts">
	export let darkBackgroundStyles: boolean = true;
	const fillColor = darkBackgroundStyles ? '#004761' : '#fafafa';
</script>

<svelte:window />
<div class="wrapper max-width pin">
	<svg viewBox="0 0 1219 818" fill="none" xmlns="http://www.w3.org/2000/svg">
		<g filter="url(#filter0_d_121_7)">
			<path
				d="M294.5 718.5L99.5 523.5H1119.5L924.5 718.5H294.5ZM99.5 523.5V294.5L294.5 99.5H924.5L1119.5 294.5V523.5H99.5Z"
				fill="#101820"
			/>
		</g>
		<defs>
			<filter
				id="filter0_d_121_7"
				x="0.5"
				y="0.5"
				width="1218"
				height="817"
				filterUnits="userSpaceOnUse"
				color-interpolation-filters="sRGB"
			>
				<feFlood flood-opacity="0" result="BackgroundImageFix" />
				<feColorMatrix
					in="SourceAlpha"
					type="matrix"
					values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
					result="hardAlpha"
				/>
				<feOffset />
				<feGaussianBlur stdDeviation="49.5" />
				<feColorMatrix
					type="matrix"
					values="0 0 0 0 0 0 0 0 0 0.278431 0 0 0 0 0.380392 0 0 0 1 0"
				/>
				<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_121_7" />
				<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_121_7" result="shape" />
			</filter>
		</defs>
	</svg>
</div>

<style lang="scss">
	.wrapper {
		display: flex;
		position: absolute;
		align-items: center;
		justify-content: center;
		svg {
			height: min(250%, 700px);
		}

		// inset: 0;
		// top: calc(15%);
		// // transform: translateY(calc(-50% + 130px));
		// transform: translateY(-70%);
		@include breakpoint('tablet') {
			display: none;
			// top: calc(5%);
			// min-width: 764px;
			// transform: translateY(-70%);
		}
	}
</style>
