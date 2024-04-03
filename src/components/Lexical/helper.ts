import { LexicalNode, NodeMap } from "lexical";

export const cleanup = (html: string) => {

	//replace &nbsp; with space
	return html.replace(/&nbsp;/g, ' ');
	
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