// redirects should primarily be in vercel.json or hooks.server.ts, this is client side fallback that loads on the 404 page. 
import { goto } from '$app/navigation'; // Adjust the import path as necessary


export async function fetchRedirectsAndNavigate(StoryblokApi, currentPathname) {
    try {
        const data = await getDataSourceRedirects(StoryblokApi);
        const redirect = data.find(entry => {
            const normalizedEntryName = entry.name.startsWith('/') ? entry.name : '/' + entry.name;
            return normalizedEntryName === currentPathname;
        });

        if (redirect) {    
            await goto(redirect.value.startsWith("/") ? redirect.value : "/" + redirect.value);
            return true; // signal that a redirect occurred
        } else {
            return false; // No redirect found
        }
    } catch (error) {
        console.error('Error fetching redirects:', error);
        throw error; // Rethrow the error for further handling
    }
}

async function getDataSourceRedirects(StoryblokApi) {
    try {
        let allEntries = [];
        let page = 1;
        let hasMore = true;
        
        while (hasMore) {
            const entriesResponse = await StoryblokApi.get('cdn/datasource_entries', {
                datasource: 'redirects',
                page: page,
                per_page: 1000 // Max allowed value
            });

            allEntries = allEntries.concat(entriesResponse.data.datasource_entries);
            
            // Check if we've reached the last page
            hasMore = entriesResponse.data.datasource_entries.length === 1000;
            page++;

        }

        return allEntries;
    } catch (error) {
        console.error('Error fetching data sources:', error);
        throw error;
    }
}