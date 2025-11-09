/**
 * Function to parse a JSON string representing a Shopify's metaobjects
 * rich text document into HTML.
 *
 * The JSON string should be an object with a 'children' property
 * containing an array of nodes. Each node should have a 'type' property
 *
 * @param {string} json - JSON string representing a rich text document
 * @returns {string} - HTML string representing the rich text document
 */
export const parseRichText = (json) => {
  // Parse the JSON string into an object
  const rootNode = JSON.parse(json);

  let htmlOutput = '';

  // Function to process each node
  function processNode(node) {
    // console.log(node);
    switch (node.type) {
      case 'paragraph':
        return `<p>${node.children.map(processNode).join('')}</p>`;
      case 'text':
        let text = node.value;
        if (node.bold) {
          text = `<strong>${text}</strong>`;
        }
        if (node.italic) {
          text = `<em>${text}</em>`;
        }
        return text;
      case 'link':
        return `<a href="${node.url}"${node.title ? ` title="${node.title}"` : ''}${node.target ? ` target="${node.target}"` : ''}>${node.children.map(processNode).join('')}</a>`;
      case 'line_break':
        return '<br>';
      case 'list':
        // console.log('list', node);
        const listTag = node.listType === 'unordered' ? 'ul' : 'ol';
        return `<${listTag}>${node.children.map(processNode).join('')}</${listTag}>`;
      case 'list-item':
        return `<li>${node.children.map(processNode).join('')}</li>`;
      case 'heading':
        const headingTag = `h${node.level}` || 'h1';
        return `<${headingTag}>${node.children.map(processNode).join('')}</${headingTag}>`;
      default:
        return '';
    }
  }

  // Process the root node
  if (rootNode && rootNode.children) {
    // output the HTML for each child node
    htmlOutput = rootNode.children.map(processNode).join('');
  }

  return htmlOutput;
}
