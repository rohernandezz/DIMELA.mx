import htm from "https://unpkg.com/htm?module";
import { h } from "https://unpkg.com/preact/compat?module";

const html = htm.bind(h);
const CMS = window.CMS;

// Register the site stylesheet inside the preview iframe
// Adjust path as needed (for Blowfish it's usually /css/main.min.css)
CMS.registerPreviewStyle("/css/compiled/main.css");

 console.log("PostPreview entry:", entry.toJS())
// Define a simple preview component
const PostPreview = ({ entry, widgetFor }) => {
  return html`
  const title = entry.getIn(["data", "title"]);
    <div id=${title} class="max-w-prose mx-auto px-4 theme-light">
      <article class="prose lg:prose-xl">
        <h1>${title}</h1>
        <div>${[widgetFor("body")]}</div>
      </article>
    </div>
  `;
};

// Register the template for the “posts” collection (match your config.yml)
CMS.registerPreviewTemplate("Directorio", PostPreview);