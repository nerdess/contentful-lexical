export const cleanup = (html) => {

	if (!html) return;

	//remove empty <p>-tags
	return html.replace(/<p[^>]*>\s*<\/p[^>]*>/g, '');
}

/*export const sanitize = (html) => {

	if (!html) return;

	const parser = new DOMParser();
  	const doc = parser.parseFromString(html, 'text/html');

	//remove all span-tags without attributes
	const spanTags = doc.querySelectorAll('span');
	spanTags.forEach((span) => {
		if (span.attributes.length === 0) {
			const text = doc.createTextNode(span.textContent);
			span.parentNode.replaceChild(text, span);
		}
	});

	return doc.body.innerHTML;

}*/

export const mapToObj = (map) => {
	const obj = {}
	for (let [k,v] of map)
	  obj[k] = v
	return obj
}