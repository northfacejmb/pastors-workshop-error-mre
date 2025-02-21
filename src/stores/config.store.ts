import { writable } from 'svelte/store';
import type { ConfigStoryblok } from '$src/types/storyblok';

export const config = writable<ConfigStoryblok>({} as ConfigStoryblok);

export const cookieConsent = writable<boolean>(false);
export const nb_show = writable<boolean>(false);
export const first_load = writable<boolean>(true);

export const searchReload = writable<any>(() => { });
