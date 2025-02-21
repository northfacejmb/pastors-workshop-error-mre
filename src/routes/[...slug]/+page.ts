// src/routes/[...slug]/+page.ts

import {
  PUBLIC_STORYBLOK_ENV,
  PUBLIC_TYPESENSE_HOST,
  PUBLIC_TYPESENSE_PORT,
  PUBLIC_TYPESENSE_PROTOCOL,
  PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY
} from '$env/static/public';
import relations from '$src/utils/relations';
import { error } from '@sveltejs/kit';
import Typesense from 'typesense';
import type { PageLoad } from './$types';
export const load: PageLoad = async ({ params, parent }) => {

  const { storyblokApi } = await parent();
  let sbRes: any;
  try {
      sbRes = await storyblokApi.get("cdn/stories/lectionary/year-c/2024-2025/maundy-thursday-psalm-116-1-2-12-19", {
      version: PUBLIC_STORYBLOK_ENV as "published" | "draft" | undefined,
      resolve_relations: relations,
    }  );

    let returnData: any = { story: sbRes.data.story };

    console.log("story", returnData.story)
    console.log("Links", returnData.story.content.curated_related_content[0].links.map((link) => {return { 
      "gospel": link.content.gospel[0].book,
      "new_testament": link.content.new_testament[0].book,
    }}))


    return returnData;
  } catch (err) {
    console.log("we hit err", err)
    throw error(404, 'Page not found');
  }
};
