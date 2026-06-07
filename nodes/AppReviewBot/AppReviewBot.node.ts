import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { appDescription } from './resources/app';
import { reviewDescription } from './resources/review';
import { getApps } from './listSearch/getApps';

export class AppReviewBot implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'AppReviewBot',
		name: 'appReviewBot',
		icon: {
			light: 'file:../../icons/appreviewbot.svg',
			dark: 'file:../../icons/appreviewbot.dark.svg',
		},
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Fetch Apple App Store and Google Play reviews via the AppReviewBot API',
		defaults: {
			name: 'AppReviewBot',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'appReviewBotApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://appreviewbot.com/api/v1',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'App',
						value: 'app',
					},
					{
						name: 'Review',
						value: 'review',
					},
				],
				default: 'review',
			},
			...appDescription,
			...reviewDescription,
		],
	};

	methods = {
		listSearch: {
			getApps,
		},
	};
}
