import { LexicalNode, NodeMap } from "lexical";

export const cleanup = (html: string) => {

	const htmlCleanedUp = html
	.replace(/&nbsp;/g, ' ')			//replace &nbsp; with space
	.replace(/"(.*?)"/g, '„$1“')		//replace "..." with „...“
	.replace(/“(.*?)“/g, '„$1“')		//replace “...“ with „...“
	.replace(/“(.*?)”/g, '„$1“')		//replace “...” with „...“
	.replace(/“(.*?)”/g, '„$1“')	

	return htmlCleanedUp;
	
	//remove empty <p>-tags
	//return html.replace(/<p[^>]*>\s*<\/p[^>]*>/g, '');
}

export const mapToObj = (map: NodeMap) => {
	const obj: Record<string, LexicalNode> = {};
	for (let [k,v] of map) {
	  	obj[k] = v;
	}
	return obj
}

/*
	let notification = '';

	if (htmlCleanedUp !== html) {
		console.log('....', html, htmlCleanedUp);
		notification = notification + `${html} wurde bereinigt mit ${htmlCleanedUp} <br />`
	}

	if (notification.length > 0) Notification.success(notification)



*/