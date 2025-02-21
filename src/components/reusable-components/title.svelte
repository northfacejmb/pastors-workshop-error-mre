<script>
	export let heading = 'h2';
	export let content = '';
	export let headingStyle = '';
	export let class_ = ''; // For additional custom classes
	export let textClasses = {}; // For globally available text classes
	export let style = ''; // For additional custom styles
	export let color = '';

	const validHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
	const validStyles = [
		'title-2xl',
		'title-xl',
		'title-lg',
		'title-md',
		'title-sm',
		'text-xl-bold',
		'text-xl-semibold',
		...validHeadings
	];

	$: headingTag = validHeadings.includes(heading.toLowerCase()) ? heading.toLowerCase() : 'h2';
	$: styleClass = validStyles.includes(headingStyle) ? headingStyle : '';
	$: combinedClass = `${styleClass} ${class_}`.trim();
</script>

{#if headingTag === 'h1'}
	<h1 class={combinedClass} {style} style:color>{content}</h1>
{:else if headingTag === 'h2'}
	<h2 class={combinedClass} {style} style:color>{content}</h2>
{:else if headingTag === 'h3'}
	<h3 class={combinedClass} {style} style:color>{content}</h3>
{:else if headingTag === 'h4'}
	<h4 class={combinedClass} {style} style:color>{content}</h4>
{:else if headingTag === 'h5'}
	<h5 class={combinedClass} {style} style:color>{content}</h5>
{:else if headingTag === 'h6'}
	<h6 class={combinedClass} {style} style:color>{content}</h6>
{:else if headingTag === 'h7'}
	<p class={combinedClass} {style} style:color>{content}</p>
{/if}
