import { writable } from 'svelte/store';

type AuthStore = {
  authenticated: boolean;
  customer: any;
  group: any;
  hasActiveSubscription: boolean;
  isGroupAdmin: boolean;
  userContentRestrictions: string;
  lastChecked: number;
};

const createAuthStore = () => {
  const { subscribe, set, update } = writable<AuthStore>({
    authenticated: false,
    customer: null,
    group: null,
    hasActiveSubscription: false,
    isGroupAdmin: false,
    userContentRestrictions: '',
    lastChecked: 0,
  });

  return {
    subscribe,
    set,
    update,
    reset: () => set({
      authenticated: false,
      customer: null,
      group: null,
      hasActiveSubscription: false,
      isGroupAdmin: false,
      userContentRestrictions: '',
      lastChecked: 0,
    }),
  };
};

export const authStore = createAuthStore();