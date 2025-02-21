import { onDestroy } from 'svelte';

export function onInterval(callback: () => any, milliseconds: number) {
	const interval = setInterval(callback, milliseconds);

	onDestroy(() => {
		clearInterval(interval);
	});
}

export let hydrated = false;
export function update() {
	hydrated = true;
}
