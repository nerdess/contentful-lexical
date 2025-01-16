export interface BlockTypeToBlockName {
    bullet: string;
    //h2: string;
    h4: string;
    number: string;
    'custom-paragraph': string;
}

export const blockTypeToBlockName: BlockTypeToBlockName = {
    bullet: 'Liste (einfach)',
    //check: 'Check List',
    //code: 'Code Block',
    //h2: 'TPM H2',
    h4: 'Zwischenüberschrift',
    /*h3: 'Heading 3',
    h4: 'Heading 4',
    h5: 'Heading 5',
    h6: 'Heading 6',*/
    number: 'Liste (nummeriert)',
    "custom-paragraph": 'Normal',
    //quote: 'Quote',
};