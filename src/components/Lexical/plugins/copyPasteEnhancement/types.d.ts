export type Cleanup = {
	original: string;
	cleaned: string;
}

export type InvocationParameters_LexicalFullScreen = {
	type: 'lexicalFullScreen'
	ids: { 
	  space: string; 
	  environment: string; 
	  entry: string; 
	  field: string 
	};
	locale: string;
	name: string;
	initialValue: string;
}

export type InvocationParameters_Cleanup = {
	type: 'cleanups'
	cleanups: Cleanup[];
}