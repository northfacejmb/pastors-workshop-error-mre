import LectionarySingle from '$components/cms-contentTypes/lectionary-single.svelte';
import ChildIndex from '$components/cms-modules/child-index.svelte';
import Circles from '$components/cms-modules/circles.svelte';
import ContentList from '$components/cms-modules/content-list.svelte';
import Content from '$components/cms-modules/content.svelte';
import Embed from '$components/cms-modules/embed.svelte';
import Form from '$components/cms-modules/form.svelte';
import HeroInterior from '$components/cms-modules/hero-interior.svelte';
import Hero from '$components/cms-modules/hero.svelte';
import LectionaryIndex from '$components/cms-modules/lectionary-index.svelte';
import RamdomContent from '$components/cms-modules/random-content.svelte';
import ScriptureGuide from '$components/cms-modules/scripture-guide-index.svelte';
import Search from '$components/cms-modules/search.svelte';
import PricingTable from '$components/cms-modules/stripe-pricing-table.svelte';
import Testimonials from '$components/cms-modules/testimonials.svelte';
import TextSidebar from '$components/cms-modules/text-sidebar.svelte';
import UpcomingLectionary from '$components/cms-modules/upcoming-lectionary.svelte';
import Button from '$components/reusable-components/button.svelte';
import { PUBLIC_STORYBLOK_ENV, PUBLIC_STORYBLOK_TOKEN,  } from '$env/static/public';
import { config } from '$src/stores/config.store.js';
import { portalUrl } from '$src/stores/portalUrl.store.js';
import { hydrated } from '$src/utils/lifecycles.js';
import cloneDeep from "clone-deep";
import Typesense from 'typesense';
import { browser } from '$app/environment';

const mySchema = cloneDeep(RichTextSchema);

export const ssr = true; //turning back on for meta tags, 

/** @type {import('./$types').LayoutServerData} */

import { RichTextSchema, apiPlugin, storyblokInit, useStoryblokApi } from '@storyblok/svelte';

export async function load({ data, url, fetch }) {


  if (!hydrated) {
    console.log('Layout.ts Server Load');
  } else {
    console.log('Layout.ts Hydrated');
  }

  const { pathname } = "url";

  storyblokInit({
    accessToken: PUBLIC_STORYBLOK_TOKEN,
    use: [apiPlugin],
    components: {
      hero: Hero,
      hero_interior: HeroInterior,
      text_sidebar: TextSidebar,
      button: Button,
      content: Content,
      search: Search,
      form: Form,
      code_embed: Embed,
      content_list: ContentList,
      child_index: ChildIndex,
      lectionary: LectionarySingle,  
    },
    richText: {
      schema: mySchema,
      resolver: (component, blok) => {
        // console.log(component, blok);

        const blokString = encodeURIComponent(JSON.stringify(blok));
        return `<div class="richtext-imported-component" data-component="${component}" data-blok="${blokString}"></div>`;
      }
    },
    apiOptions: {
      https: true,
      region: 'us'
    }
  });

  const storyblokApi = await useStoryblokApi();
  const dataConfig = await storyblokApi.get('cdn/stories/config/', {
    version: PUBLIC_STORYBLOK_ENV as "published" | "draft" | undefined,
    resolve_links: 'url'
  });

  config.update(() => {
    return dataConfig.data.story.content;
  });


  return {
    storyblokApi,
    pathname,

  };
}
