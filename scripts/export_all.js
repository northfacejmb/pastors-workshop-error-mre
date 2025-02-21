// run with npm run getAll from the root. retrieves all stories in the space. 

import dotenv from 'dotenv';
import fs from 'fs';
import StoryblokClient from 'storyblok-js-client';

dotenv.config();

const Storyblok = new StoryblokClient({
  accessToken: process.env.PUBLIC_STORYBLOK_TOKEN,
  region: 'us',
  https: true
});


async function getAllStories() {
  let allStories = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await Storyblok.get('cdn/stories/', {
        version: 'published',
        // starts_with: 'authors/',
        page: page,
        per_page: 100, // Adjust this value as needed
      });

      allStories = allStories.concat(response.data.stories);
      hasMore = response.data.stories.length === 100; // If we got less than 100 stories, we've reached the end
      page++;

      console.log(`Retrieved ${allStories.length} stories so far...`);
    } catch (error) {
      console.error('Error fetching stories:', error);
      hasMore = false;
    }
  }
// const StoryNames = allStories.map(story => {
//   return story.name
// })

// const ids =  allStories.map(story => {
//   return story.id
// })
  return allStories;
}
async function exportDataSources() {
  try {
    const datasourcesResponse = await Storyblok.get('cdn/datasources', {});
    const datasources = datasourcesResponse.data.datasources;

    for (let datasource of datasources) {
      let allEntries = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const entriesResponse = await Storyblok.get('cdn/datasource_entries', {
          datasource: datasource.slug,
          page: page,
          per_page: 1000 // Max allowed value
        });

        allEntries = allEntries.concat(entriesResponse.data.datasource_entries);
        
        // Check if we've reached the last page
        hasMore = entriesResponse.data.datasource_entries.length === 1000;
        page++;

        console.log(`Retrieved ${allEntries.length} entries for datasource "${datasource.name}" so far...`);
      }

      // Replace the datasource object with one that includes all entries
      datasource.entries = allEntries;
    }

    return datasources;
  } catch (error) {
    console.error('Error fetching data sources:', error);
    throw error;
  }
}
async function exportAllStories(options) {
  try {
    const exportLocally = options.exportLocally
    const exportStories = options?.exportStories=== false ? false : true 
    const exportDatasources = options?.exportDatasources === false ? false : true 
    
    const allStories = exportStories ? await getAllStories() : {"stories": "excluded from export"} ;
    const allDatasources = exportDatasources ? await exportDataSources() : {"stories": "excluded from export"} ;

  if(exportLocally){
    fs.writeFileSync('./scripts/data/all_storyblok_stories.json', JSON.stringify(allStories, null, 2));
    console.log(`Successfully exported ${allStories.length} stories to all_storyblok_stories.json`);

    fs.writeFileSync('./scripts/data/all_storyblok_datasources.json', JSON.stringify(allDatasources, null, 2));
    console.log(`Successfully exported ${allDatasources?.datasources?.length} datasources to all_storyblok_datasources.json`);
  } else {
    return {exportDatasources, allStories}
  }
  } catch (error) {
    console.error('Error exporting stories:', error);
  }
}

// Check if this script is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  exportAllStories({ exportLocally:true });
}

export default exportAllStories;
