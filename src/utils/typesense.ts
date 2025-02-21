import {
  PUBLIC_TYPESENSE_HOST,
  PUBLIC_TYPESENSE_HOST_FALLBACK_1,
  PUBLIC_TYPESENSE_HOST_FALLBACK_2,
  PUBLIC_TYPESENSE_HOST_FALLBACK_3,
  PUBLIC_TYPESENSE_PORT,
  PUBLIC_TYPESENSE_PROTOCOL,
  PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY
} from '$env/static/public';
import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter';

export const typesenseInstantsearchAdapter = (additionalTypesenseAdapterParams: any) =>
  new TypesenseInstantSearchAdapter({
    server: {
      apiKey: PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY,
      nearestNode: {
        host: PUBLIC_TYPESENSE_HOST,
        port: parseInt(PUBLIC_TYPESENSE_PORT),
        protocol: PUBLIC_TYPESENSE_PROTOCOL
      },
      nodes: [
        {
          host: PUBLIC_TYPESENSE_HOST_FALLBACK_1,
          port: parseInt(PUBLIC_TYPESENSE_PORT),
          protocol: PUBLIC_TYPESENSE_PROTOCOL
        },
        {
          host: PUBLIC_TYPESENSE_HOST_FALLBACK_2,
          port: parseInt(PUBLIC_TYPESENSE_PORT),
          protocol: PUBLIC_TYPESENSE_PROTOCOL
        },
        {
          host: PUBLIC_TYPESENSE_HOST_FALLBACK_3,
          port: parseInt(PUBLIC_TYPESENSE_PORT),
          protocol: PUBLIC_TYPESENSE_PROTOCOL
        }
      ],
      connectionTimeoutSeconds: 10
    },
    additionalSearchParameters: {
      query_by: "content.keywords.name,content.author.name,name,content.illustration_categories,content.liturgy_categories.name,content.liturgy_categories.name,content.top_level_categories.name,content.bible_references.bibleRefPlain,content.bible_references.bibleRefBookChapterVerses,content.lectionary_season,content.lectionary_day,content.lectionary_cycle,content.lectionary_year,content.content_plain",
      //  exclude_fields: "content.content_plain", // for future refactor of restricing returned content 
      //num_typos: 0,
      prioritize_exact_match: true,
      stopwords: "common-words",
      highlight_affix_num_tokens: additionalTypesenseAdapterParams.highlight_affix_num_tokens || 50,
      // sort_by: "_eval([ (content.component:worship-guide):3, (content.component:scripture-guide):3,(content.component:series):2 ]):desc"
    },
    facetableFieldsWithSpecialCharacters: ["content.bible_references.bibleRefBookChapterVerses"],
  });