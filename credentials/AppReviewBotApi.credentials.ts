import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AppReviewBotApi implements ICredentialType {
	name = 'appReviewBotApi';

	displayName = 'AppReviewBot API';

	icon: Icon = {
		light: 'file:../icons/appreviewbot.svg',
		dark: 'file:../icons/appreviewbot.dark.svg',
	};

	documentationUrl = 'https://appreviewbot.com';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'arb_...',
			description:
				'Your AppReviewBot API key. Find it in dash.appreviewbot.com → Organization Settings.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://appreviewbot.com/api/v1',
			url: '/apps',
			method: 'GET',
			qs: {
				limit: '1',
			},
		},
	};
}
