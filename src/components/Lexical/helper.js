export const cleanup = (html) => {

	if (!html) return;

	//remove empty <p>-tags
	return html.replace(/<p[^>]*>\s*<\/p[^>]*>/g, '');
}
