<script lang="ts">
	export let image: {
		filename?: any;
		urls?: any;
		alt_description?: string;
	};
	export let loading: 'eager' | 'lazy' | null | undefined = null;
	export let sizes: string = `100vw`;
	export let fallback: string | null = null;
	export let size: [string, string] = ['100%', '100%'];

	// console.log(image);

	// Sizes Example(s)
	// (max-width: 500px) 100vw,
	// (max-width: 1500px) 33.3vw,
	// 100vw
	// (max-width: 900px) 100vw, 33vw

	$: unsplash = image && image.urls;
	$: imgUri = unsplash ? image.urls.raw : image && image.filename ? image.filename : fallback || '';

	$: srcset = !unsplash
		? `${imgUri}/m/300x0/smart 300w,
       ${imgUri}/m/1000x0/smart 1000w,
       ${imgUri}/m/1500x0/smart 1500w,
       ${imgUri}/m/2000x0/smart 2000w,
       ${imgUri}/m/3000x0/smart 3000w,
       ${imgUri}`
		: `${imgUri}&q=70&auto=format,compress,enhance&fit=crop&crop=edges&w=300 300w,
       ${imgUri}&q=70&auto=format,compress,enhance&fit=crop&crop=edges&w=400 400w,
       ${imgUri}&q=70&auto=format,compress,enhance&fit=crop&crop=edges&w=500 500w,
       ${imgUri}&q=70&auto=format,compress,enhance&fit=crop&crop=edges&w=1000 1000w,
       ${imgUri}&q=70&auto=format,compress,enhance&fit=crop&crop=edges&w=1500 1500w,
       ${imgUri}&q=70&auto=format,compress,enhance&fit=crop&crop=edges&w=2000 2000w,
       ${imgUri}&q=70&auto=format,compress,enhance&fit=crop&crop=edges&w=3000 3000w,
       ${imgUri}`;

	$: hasImage = (image && (image.filename || image.urls)) || fallback;

	$: alt = image && image.alt_description ? image.alt_description : ' ';
</script>

{#if hasImage}
	<div class="image-container" style:width={size[0]} style:height={size[1]}>
		<img {srcset} {sizes} {alt} {loading} style:width={size[0]} style:height={size[1]} />
	</div>
{/if}

<style lang="scss">
	img {
		object-fit: cover;
		width: 100%;
		height: 100%;
		transition: opacity 0.3s ease-in-out; // Smooth transition when image loads
	}
</style>
