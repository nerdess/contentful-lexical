export const cleanup = (html) => {
	//remove empty <p>-tags
	return html.replace(/<p[^>]*>\s*<\/p[^>]*>/g, '');
}
