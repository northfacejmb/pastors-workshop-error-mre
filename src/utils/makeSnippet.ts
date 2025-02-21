export const createSnippet = (content: string, textLength: number = 200, returnPlainText: boolean = false): string => {
  if (!content || content.length === 0) return '';

  // 1. Remove HTML tags using regex
  const plainText = content.replace(/<[^>]+>/g, '');

  const maxLength = plainText.length <= textLength ? Math.floor(plainText.length / 1.2) : textLength;

  // 2. Truncate the text
  const truncatedText = plainText.length > maxLength
    ? plainText.substring(0, plainText.lastIndexOf(' ', maxLength)) + '…'
    : plainText;

  // 3. Return plain text if flagged, otherwise return original content with truncation
  return returnPlainText
    ? truncatedText
    : content.length > maxLength
      ? content.substring(0, content.lastIndexOf(' ', maxLength)) + '…'
      : content;
};