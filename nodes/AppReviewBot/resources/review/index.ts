import type { INodeProperties } from 'n8n-workflow';
import { reviewGetManyDescription } from './getAll';

const showOnlyForReview = {
	resource: ['review'],
};

export const reviewDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForReview,
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get reviews for an app',
				description: 'Return reviews for a connected app, ordered by most recently updated',
				routing: {
					request: {
						method: 'GET',
						url: '=/apps/{{$parameter["appRef"]}}/reviews',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
		],
		default: 'getAll',
	},
	...reviewGetManyDescription,
];
