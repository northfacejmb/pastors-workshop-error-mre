import { browser } from '$app/environment';
import { goto, invalidateAll } from '$app/navigation';

// export const getSession = async () => {
//   // if (browser) {
//   const response = await fetch('/api/auth');
//   const data = await response.json();
//   return data;
//   // }
// };

export const logout = async () => {
  if (browser) {
    await fetch('/api/account?/logout', {
      method: 'POST', headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: ""
    });
    window.location.href = '/';
  }
};


