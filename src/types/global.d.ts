type BasicLink = {
	path: string;
	label: string;
};

type ButtonVersion = 'primary' | 'secondary' | 'arrow' | 'nav' | 'outline' | undefined;

type TextFieldType = 'text' | 'email' | 'password' | 'phone' | 'url';
interface ISbRichtext {
	content?: ISbRichtext[];
	marks?: ISbRichtext[];
	attrs?: any;
	text?: string;
	type: string;
	content?: ISbRichtext[];
	marks?: ISbRichtext[];
	attrs?: any;
	text?: string;
	type: string;
}

interface Option {
	label: string;
	value: string;
}

interface FormResult {
	error: boolean;
	title: string;
	message?: string;
	richText?: any;
}
