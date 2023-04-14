const options = {
	lang: 'de-DE',
	height: 360,
	linkTargetBlank: true,
	useProtocol: false,
	defaultProtocol: 'https://',
	minHeight: null,
	maxHeight: null,
	focus: !0,
	toolbar: [
		['style', ['bold', 'italic', 'underline', 'clear']],
		['font', ['strikethrough', 'quotation', 'ndash']],
		['para', ['ul', 'ol']],
		['insert', ['link', 'imageLink']],
		['cleaner', ['cleaner']],
		['view', ['codeview']],
	],
	popover: {
		image: [['remove', ['removeMedia']]],
		link: [['link', ['linkDialogShow', 'unlink']]],
	},
	cleaner: {
		action: 'button', // both|button|paste 'button' only cleans via toolbar button, 'paste' only clean when pasting content, both does both options.
		newline: '<br>', // Summernote's default is to use '<p><br></p>'
		notStyle: 'position:absolute;top:0;left:0;right:0',
		icon:
			'<i class="note-icon"><svg xmlns="http://www.w3.org/2000/svg" id="libre-paintbrush" viewBox="0 0 14 14" width="14" height="14"><path d="m 11.821425,1 q 0.46875,0 0.82031,0.311384 0.35157,0.311384 0.35157,0.780134 0,0.421875 -0.30134,1.01116 -2.22322,4.212054 -3.11384,5.035715 -0.64956,0.609375 -1.45982,0.609375 -0.84375,0 -1.44978,-0.61942 -0.60603,-0.61942 -0.60603,-1.469866 0,-0.857143 0.61608,-1.419643 l 4.27232,-3.877232 Q 11.345985,1 11.821425,1 z m -6.08705,6.924107 q 0.26116,0.508928 0.71317,0.870536 0.45201,0.361607 1.00781,0.508928 l 0.007,0.475447 q 0.0268,1.426339 -0.86719,2.32366 Q 5.700895,13 4.261155,13 q -0.82366,0 -1.45982,-0.311384 -0.63616,-0.311384 -1.0212,-0.853795 -0.38505,-0.54241 -0.57924,-1.225446 -0.1942,-0.683036 -0.1942,-1.473214 0.0469,0.03348 0.27455,0.200893 0.22768,0.16741 0.41518,0.29799 0.1875,0.130581 0.39509,0.24442 0.20759,0.113839 0.30804,0.113839 0.27455,0 0.3683,-0.247767 0.16741,-0.441965 0.38505,-0.753349 0.21763,-0.311383 0.4654,-0.508928 0.24776,-0.197545 0.58928,-0.31808 0.34152,-0.120536 0.68974,-0.170759 0.34821,-0.05022 0.83705,-0.07031 z"/></svg></i>',
		keepHtml: true, //Remove all Html formats
		keepTagContents: ['span'], //Remove tags and keep the contents
		//badTags: ['applet', 'col', 'colgroup', 'embed', 'noframes', 'noscript', 'script', 'style', 'title'], //Remove full tags with contents
		//badAttributes: ['bgcolor', 'border', 'height', 'cellpadding', 'cellspacing', 'lang', 'start', 'style', 'valign', 'width'], //Remove attributes from remaining tags
		keepOnlyTags: ['<p>', '<br>', '<a>', '<b>', '<i>', '<u>', '<strike>'], // If keepHtml is true, remove all tags except these
		keepClasses: false, //Remove Classes
		badTags: [
			'style',
			'script',
			'applet',
			'embed',
			'noframes',
			'noscript',
			'html',
		], //Remove full tags with contents
		badAttributes: ['style', 'start'], //Remove attributes from remaining tags
		limitChars: 0, // 0|# 0 disables option
		limitDisplay: 'both', // none|text|html|both
		limitStop: false, // true/false
		notTimeOut: 250, //time before status message is hidden in miliseconds
		imagePlaceholder: 'https://via.placeholder.com/200',
	},
	quotation: {
		icon:
			'<i class="note-icon"><svg xmlns="http://www.w3.org/2000/svg" id="libre-quote" viewBox="0 0 24 24" width="14" height="14"><path d="M7.17,17 C7.68,17 8.15,16.71 8.37,16.26 L9.79,13.42 C9.93,13.14 10,12.84 10,12.53 L10,8 C10,7.45 9.55,7 9,7 L5,7 C4.45,7 4,7.45 4,8 L4,12 C4,12.55 4.45,13 5,13 L7,13 L5.97,15.06 C5.52,15.95 6.17,17 7.17,17 Z M17.17,17 C17.68,17 18.15,16.71 18.37,16.26 L19.79,13.42 C19.93,13.14 20,12.84 20,12.53 L20,8 C20,7.45 19.55,7 19,7 L15,7 C14.45,7 14,7.45 14,8 L14,12 C14,12.55 14.45,13 15,13 L17,13 L15.97,15.06 C15.52,15.95 16.17,17 17.17,17 Z" id="🔹-Icon-Color" fill="#1D1D1D"></path></svg></i>',
	},
	ndash: {
		icon: '<i class="note-icon-minus"></i>',
	},
	imageLink: {
		icon: '<i class="note-icon-picture"></i>',
	},
	onInit: () => {
		console.log('Summernote is launched!');
	}
};

export default options;
