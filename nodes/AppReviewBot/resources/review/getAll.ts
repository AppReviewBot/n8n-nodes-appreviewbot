import type { INodeProperties } from 'n8n-workflow';

const showOnlyForReviewGetMany = {
	operation: ['getAll'],
	resource: ['review'],
};

export const reviewGetManyDescription: INodeProperties[] = [
	{
		displayName: 'App',
		name: 'appRef',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		displayOptions: {
			show: showOnlyForReviewGetMany,
		},
		description: 'The app to fetch reviews for',
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				placeholder: 'Select an app...',
				typeOptions: {
					searchListMethod: 'getApps',
					searchable: true,
					searchFilterRequired: false,
				},
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: 'e.g. apple_app_store__123456789',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '^(apple_app_store|google_play_store)__.+$',
							errorMessage:
								'Must be a composite app reference like apple_app_store__123456789',
						},
					},
				],
			},
		],
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForReviewGetMany,
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		routing: {
			send: {
				paginate: '={{ $value }}',
				type: 'query',
				property: 'limit',
				value: '100',
			},
			operations: {
				pagination: {
					type: 'generic',
					properties: {
						continue: '={{ $response.body?.has_more === true && ($response.body?.data?.length ?? 0) > 0 }}',
						request: {
							qs: {
								starting_after:
									'={{ $response.body?.data?.[$response.body.data.length - 1]?.id ?? "" }}',
							},
						},
					},
				},
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				...showOnlyForReviewGetMany,
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		routing: {
			send: {
				type: 'query',
				property: 'limit',
			},
			output: {
				maxResults: '={{$value}}',
			},
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: showOnlyForReviewGetMany,
		},
		default: {},
		options: [
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: '',
				placeholder: 'e.g. us',
				description: 'Filter reviews by two-letter country code (ISO 3166-1 alpha-2), e.g. us, gb, de',
				routing: {
					request: {
						qs: {
							country: '={{$value}}',
						},
					},
				},
			},
			{
				displayName: 'From',
				name: 'from',
				type: 'dateTime',
				default: '',
				description: 'Return only reviews updated at or after this date (filters on content_updated_at)',
				routing: {
					request: {
						qs: {
							from: '={{$value ? new Date($value).toISOString() : undefined}}',
						},
					},
				},
			},
			{
				displayName: 'Rating',
				name: 'rating',
				type: 'options',
				options: [
					{ name: '1 Star', value: '1', description: 'Return only 1-star reviews' },
					{ name: '2 Stars', value: '2', description: 'Return only 2-star reviews' },
					{ name: '3 Stars', value: '3', description: 'Return only 3-star reviews' },
					{ name: '4 Stars', value: '4', description: 'Return only 4-star reviews' },
					{ name: '5 Stars', value: '5', description: 'Return only 5-star reviews' },
					{ name: 'Any', value: '', description: 'Return reviews of all ratings' },
				],
				default: '',
				description: 'Filter reviews by star rating',
				routing: {
					request: {
						qs: {
							rating: '={{$value}}',
						},
					},
				},
			},
			{
				displayName: 'To',
				name: 'to',
				type: 'dateTime',
				default: '',
				description: 'Return only reviews updated at or before this date (filters on content_updated_at)',
				routing: {
					request: {
						qs: {
							to: '={{$value ? new Date($value).toISOString() : undefined}}',
						},
					},
				},
			},
		],
	},
];
