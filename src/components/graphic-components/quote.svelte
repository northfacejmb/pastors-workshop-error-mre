<script lang="ts">
	export let fillColor = '#307fe2';
	export let inview = false;
	export let animate = false;
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width="73"
	height="51.981"
	viewBox="0 0 73 51.981"
	class:animate
	class:inview
>
	<defs>
		<clipPath id="clip-path">
			<rect
				id="Rectangle_64"
				data-name="Rectangle 64"
				width="73"
				height="51.981"
				fill={fillColor}
			/>
		</clipPath>
	</defs>
	<g id="Icon" clip-path="url(#clip-path)">
		<path
			id="Path_10"
			data-name="Path 10"
			d="M171.253,0C162.5,0,155.4,6.751,155.4,15.078s7.043,15.074,16,15.074L153.75,51.173a.491.491,0,0,0,.376.808h6.138a.983.983,0,0,0,.753-.351l22.256-26.488a15.266,15.266,0,0,0,3.834-10.064C187.106,6.742,180,0,171.253,0"
			transform="translate(-114.106)"
			fill={fillColor}
		/>
		<path
			id="Path_11"
			data-name="Path 11"
			d="M17.62,0C8.865,0,1.767,6.751,1.767,15.078s7.043,15.074,16,15.074L.116,51.173a.492.492,0,0,0,.376.808H6.63a.983.983,0,0,0,.753-.351L29.638,25.143a15.266,15.266,0,0,0,3.834-10.064C33.472,6.742,26.362,0,17.62,0"
			transform="translate(0)"
			fill={fillColor}
		/>
	</g>
</svg>

<style lang="scss">
	.animate {
		transform: scale(0);
		transform-origin: center;
		transition: transform 0.5s ease-in-out;
		transition-delay: 1s;
		&.inview {
			transform: scale(1);
		}
	}
</style>
