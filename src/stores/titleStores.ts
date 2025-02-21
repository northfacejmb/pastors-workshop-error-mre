import { writable } from 'svelte/store';

export const searchStats = writable({ hits: 0, query: '', contentTypes: [] });
export const primaryScripture = writable([]);
export const fromSearch = writable(false);

