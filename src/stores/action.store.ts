import { writable, derived } from 'svelte/store';

export const mobileMenuOpen = writable<boolean>(false);

// export const screenWidth = writable<number>(1024);

// export const breakpoint = derived(screenWidth, (width) => {
//   if(width <  450) {
//     return 'phone';
//   } else if(width <  1024) {
//     return 'tablet';
//   } else {
//     return 'desktop';
//   }
// });