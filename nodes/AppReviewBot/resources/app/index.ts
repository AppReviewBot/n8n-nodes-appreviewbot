import type { INodeProperties } from 'n8n-workflow';

const showOnlyForApp = {
	resource: ['app'],
};

export const appDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForApp,
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many apps',
				description: 'Return many apps connected to your AppReviewBot organization',
				routing: {
					request: {
						method: 'GET',
						url: '/apps',
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
];
