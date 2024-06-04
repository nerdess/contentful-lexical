import { LexicalNode, NodeMap } from "lexical";


export const cleanup = (html: string) => {

	//replace empty nonbreaking-spaces
	const removeNbsp = html
	.replace(/&nbsp;/g, ' ')			//replace &nbsp; with empty space
	.replace(/\u00A0/g, ' ')			//replace utf-8 representation of &nbsp; with empty space

	
	//replace wrong quotes with „...“
	const split = removeNbsp.split(/(["“„”><])/).filter(Boolean);
	let checkQuotes = 0;
	let checkTags = 0;
	let lastTag = '';

	const result = split.map((item) => {

		if (item.match(/["“„”]/)) {
			checkQuotes++;
			if (checkTags !== 0 && checkTags % 2 !== 0) {
				return item;
			}
			if (checkQuotes % 2 !== 0) {
				return '„';
			} else {
				return '“';
			}
		}

		if (item === '<' && lastTag !== '<') {
			checkTags++;
			lastTag = '<';
		}
		
		if (item === '>' && lastTag !== '>') {
			checkTags++;
			lastTag = '>';
		}

		return item;
	});
	return result.join('');
	
}

export const mapToObj = (map: NodeMap) => {
	const obj: Record<string, LexicalNode> = {};
	for (let [k,v] of map) {
	  	obj[k] = v;
	}
	return obj
}
