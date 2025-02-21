import StoryblokClient from 'storyblok-js-client';

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct the path to the .env file
const envPath = path.resolve(__dirname, '../.env');

// Check if the .env file exists
if (fs.existsSync(envPath)) {
  console.log('.env file found at:', envPath);
  // Load the .env file
  const result = dotenv.config({ path: envPath });
  
  if (result.error) {
    console.error('Error loading .env file:', result.error);
  } else {
    console.log('.env file loaded successfully');
  }
} else {
  console.error('.env file not found at:', envPath);
}

// Rest of your code...

const Storyblok = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_ACCESS_TOKEN,
  region: 'us',
  https: true
})

const StoryblokCDN = new StoryblokClient({
  accessToken: process.env.PUBLIC_STORYBLOK_TOKEN,
  region: 'us',
  https: true
})

const spaceId =  process.env.STORYBLOK_SPACE_ID



// Usage
const slugsToProcess = [
  'cat-liturgy/blessings',
  'cat-liturgy/special-liturgy',
  'cat-liturgy/special-services',
  'cat-liturgy/creeds-confessions',
  'cat-liturgy/assurances-of-pardon',
  'cat-liturgy/benedictions',
  'cat-liturgy/opening-prayers',
  'cat-liturgy/prayers-of-the-people',
  'cat-liturgy/prayers-for-illumination',
  'cat-liturgy/prayers-of-invocation',
  'cat-liturgy/prayers-of-confession',
  'cat-illustration/thought-exercise',
  'cat-illustration/background',
  'cat-illustration/stories',
  'cat-illustration/analogies',
  'cat-illustration/humor',
  'cat-illustration/studies',
  'cat-illustration/discussion',

]
processSlugs(slugsToProcess)


async function processSlugs(slugs) {
  for (const fullSlug of slugs) {
    try {
      // 1. Get the original story
      const { data: { story } } = await StoryblokCDN.get(`cdn/stories/${fullSlug}`)

      console.log(story)

      // // 2. Create a new folder
      // const { data: { story: newFolder } } = await Storyblok.post(`spaces/${spaceId}/stories`, {
      //   story: {
      //     name: `${story.name} Folder`,
      //     slug: `${story.slug}_2`,
      //     is_folder: true,
      //     parent_id: story.parent_id,
      //     content: {
      //       "component": "page",
      //       "content_types": [
      //         story.content.component,
      //       ]
      //     }
      //   }
      // })
    

    
      // 2b, Create /on/ sub folder
      // const { data: { story: onFolder } } = await Storyblok.post(`spaces/${spaceId}/stories`, {
      //   story: {
      //     name: `${story.name}/on/`,
      //     slug: 'on',
      //     is_folder: true,
      //     parent_id: newFolder.id,
      //     content: {
      //       "component": "page",
      //       "content_types": [
      //         "index"
      //       ]
      //     }
      //   }
      // })
    
        // 2c, Create /from/ sub folder
        // const { data: { story: fromFolder } } = await Storyblok.post(`spaces/${spaceId}/stories`, {
        //   story: {
        //     name: `${story.name}/from/`,
        //     slug: `from`,
        //     is_folder: true,
        //     parent_id: newFolder.id,
        //     content: {
        //       "component": "page",
        //       "content_types": [
        //         "page"
        //       ]
        //     }
        //   }
        // })
    
      // console.log({newFolder})
      // let originalStory = {
      //   ...story,
      //   parent_id: newFolder.id
      // }
      // originalStory.is_startpage = true
      // // 3. Move the original story into the new folder
      // await Storyblok.put(`spaces/${spaceId}/stories/${story.id}`, {
      //   story: originalStory,
      //   publish: 1
      // })

      // // 4. Set the story as the "root" of the new folder
      // await Storyblok.put(`spaces/${spaceId}/stories/${newFolder.id}`, {
      //   story: {
      //     ...newFolder,
      //     default_root: story.content.component
      //   },
      //   // force_update: 1
      // })

      // 5. Rename the folder to the original story slug
      // let newFolderStory =  {
      //     ...newFolder,
      //     slug: story.slug
      //   }
      //   newFolderStory.slug = story.slug
      // await Storyblok.put(`spaces/${spaceId}/stories/${newFolder.id}`, {
      //   story: {
      //     ...newFolder,
      //     slug: story.slug
      //   },
      //   // force_update: 1
      // })

      // change parent folder content type 
      // await Storyblok.put(`spaces/${spaceId}/stories/${newFolder.id}`, {
      //     story: {
            
      //       slug: story.slug
      //     },
      //     // force_update: 1
      //   })


        // get stories in parent folder  to update to "index content type" for their children
      // const { data: {stories: catParentFolder }} = await Storyblok.get(`/spaces/${spaceId}/stories`, {
      //   with_parent: story.parent_id,
      //   folder_only: true
      // })

      // console.log(catParentFolder)

      // for(const folder of catParentFolder){
      //   await Storyblok.put(`spaces/${spaceId}/stories/${folder.id}`, {
      //     publish: 1,
      //     story: {
      //       default_root: "index",
      //       content:{
      //         component: "index",
      //         "content_types" : [
      //           "index"
      //         ]
      //       }
      //     },
      //     // force_update: 1
      //   })
      // }

      console.log(`Successfully processed slug: ${fullSlug}`)
    } catch (error) {
      console.error(`Error processing slug ${fullSlug}:`, error.message)
    }
  }
}
