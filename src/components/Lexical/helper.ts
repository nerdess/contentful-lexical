import { LexicalNode, NodeMap } from "lexical";


export const cleanup = (html: string) => {

	const removeNbsp = html
	.replace(/&nbsp;/g, ' ')					//replace &nbsp; with empty space
	.replace(/\u00A0/g, ' ')					//replace utf-8 representation of &nbsp; with empty space

	const parser = new DOMParser();
	const doc = parser.parseFromString(removeNbsp, 'text/html');
	doc.querySelectorAll('*').forEach(element => {
		element.removeAttribute('style');		//remove all style tags
		element.removeAttribute('class');		//remove all class tags
		element.removeAttribute('id');			//remove all id tags
		element.removeAttribute('align');		//remove all align tags
		element.removeAttribute('text-align');	//remove all text-align tags
	});

	//remove all empty <o:p> and <p> tags
	doc.querySelectorAll('o\\:p').forEach(element => element.remove());
	doc.querySelectorAll('p').forEach(element => {
		if (element.innerHTML === '') {
			element.remove();
		};
	});

	return doc.body.innerHTML;
	
	//const cleanedHTMLString = doc.body.innerHTML;

	//replace wrong quotes with „...“
	/*const split = cleanedHTMLString.split(/(["“„”><])/).filter(Boolean);
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
	return result.join('');*/
	
}

export const mapToObj = (map: NodeMap) => {
	const obj: Record<string, LexicalNode> = {};
	for (let [k,v] of map) {
	  	obj[k] = v;
	}
	return obj
}
