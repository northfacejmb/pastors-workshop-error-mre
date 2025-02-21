import type { MultilinkStoryblok } from '$src/types/storyblok';

export const GetUrl = (link: MultilinkStoryblok) => {
  // console.log(link);
  if (typeof link === 'string') return link;
  if (!!link && (link.url || link.cached_url || (link.story && !link.story.url))) {
    return link.linktype === 'story'
      ? link.cached_url
        ? `/${link.cached_url}`
        : `/${link.story.url}`
      : link.url;
  }
};

export function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;

  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

export function throttle<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let previousTime = 0;

  return ((...args: Parameters<T>) => {
    const currentTime = Date.now();

    if (currentTime - previousTime > delay) {
      previousTime = currentTime;
      func(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        previousTime = Date.now();
        func(...args);
        timeoutId = undefined;
      }, delay - (currentTime - previousTime));
    }
  }) as T;
}

export function hasRichtextContent(richtext: ISbRichtext | null | undefined): boolean {
  if (!richtext || !Array.isArray(richtext.content)) {
    return false;
  }
  if (richtext.content.length > 0) return true;

  if (richtext.content[0].type === 'bullet_list' || richtext.content[0].type === 'ordered_list')
    return true;

  // Check if there's at least one non-empty text node
  return richtext.content.some(
    (node) =>
      node.type === 'paragraph' &&
      node.content &&
      node.content.some(
        (contentNode) => contentNode.type === 'text' && contentNode.text.trim() !== ''
      )
  );
}