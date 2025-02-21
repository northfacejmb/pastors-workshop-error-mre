import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function filterIllustrations(filePath) {
  // Read and parse the JSON file
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  function searchIllustrations(obj) {
    if (typeof obj === 'string') {
      return obj.includes('/illustrations/');
    }
    if (Array.isArray(obj)) {
      return obj.some(item => searchIllustrations(item));
    }
    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(value => searchIllustrations(value));
    }
    return false;
  }

  function findIllustrationLink(obj, parentKey = '') {
    if (typeof obj === 'string' && obj.includes('/illustrations/')) {
      return { link: obj, field: parentKey };
    }
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const result = findIllustrationLink(obj[i], `${parentKey}[${i}]`);
        if (result) return result;
      }
    }
    if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        const newParentKey = parentKey ? `${parentKey}.${key}` : key;
        const result = findIllustrationLink(value, newParentKey);
        if (result) return result;
      }
    }
    return null;
  }

  const filteredStories = data.filter(story => searchIllustrations(story))
    .map(story => {
      const illustrationInfo = findIllustrationLink(story);
      return {
        name: story.name,
        full_slug: story.full_slug,
        illustrations_link: illustrationInfo ? illustrationInfo.link : null,
        illustrations_field: illustrationInfo ? illustrationInfo.field : null
      };
    });

  return filteredStories;
}

// Usage
const filePath = path.join(__dirname, 'all_storyblok_stories.json');
const result = filterIllustrations(filePath);

// Print the result
console.log(JSON.stringify(result, null, 2));

// Optionally, save the result to a new JSON file
fs.writeFileSync('filtered_illustrations.json', JSON.stringify(result, null, 2));

console.log('Filtered stories saved to filtered_illustrations.json');