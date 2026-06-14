import {
	NodeConnectionTypes,
	type IDataObject,
	type ILoadOptionsFunctions,
	type INodeExecutionData,
	type INodeListSearchItems,
	type INodeListSearchResult,
	type INodeType,
	type INodeTypeDescription,
	type IPollFunctions,
} from 'n8n-workflow';

const MAX_PAGES = 10;
const PAGE_SIZE = 100;

type ReviewItem = {
	id: string;
	content_updated_at: number;
	[key: string]: unknown;
};

type ReviewsResponse = {
	data: ReviewItem[];
	has_more: boolean;
};

type AppItem = {
	id: string;
	title: string;
	app_store_slug: string;
};

type AppsResponse = {
	data: AppItem[];
};

async function fetchApps(context: IPollFunctions | ILoadOptionsFunctions): Promise<AppItem[]> {
	const response: AppsResponse = await context.helpers.httpRequestWithAuthentication.call(
		context,
		'appReviewBotApi',
		{
			method: 'GET',
			url: 'https://appreviewbot.com/api/v1/apps',
			json: true,
		},
	);
	return response.data ?? [];
}

// eslint-disable-next-line @n8n/community-nodes/node-usable-as-tool -- polling triggers cannot be used as AI tools; usableAsTool is intentionally absent
export class AppReviewBotTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'AppReviewBot Trigger',
		name: 'appReviewBotTrigger',
		icon: {
			light: 'file:../../icons/appreviewbot.svg',
			dark: 'file:../../icons/appreviewbot.dark.svg',
		},
		group: ['trigger'],
		version: 1,
		subtitle: '=Polling: {{$parameter["appRef"]}}',
		description:
			'Polls AppReviewBot on your workflow schedule for new Apple App Store and Google Play reviews. Uses a content_updated_at watermark — only reviews arriving after activation trigger the workflow.',
		defaults: {
			name: 'AppReviewBot Trigger',
		},
		polling: true,
		activationMessage:
			'AppReviewBot is now polling for new reviews. The first run records the current time — only reviews arriving after activation will trigger the workflow.',
		triggerPanel: {
			header: 'Polling for new reviews',
			executionsHelp: {
				inactive:
					'Workflow is inactive. Activate it to start polling on your configured schedule.',
				active:
					'Polling on your workflow schedule. New reviews (by content_updated_at) will trigger downstream nodes.',
			},
			activationHint: {
				inactive:
					'On first activation, the watermark is set to now — older reviews are not backfilled.',
				active:
					'Use "Test workflow" to fetch the latest review without advancing the watermark.',
			},
		},
		hints: [
			{
				message:
					'Polling interval is set in the workflow trigger schedule (e.g. every 5 minutes), not in this node. See https://appreviewbot.com/docs/guides/n8n-integration for setup details.',
				type: 'info',
				location: 'ndv',
				whenToDisplay: 'always',
			},
		],
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'appReviewBotApi',
				required: true,
			},
		],
		properties: [
			{
				displayName:
					'This node polls on your workflow schedule. On first activation the watermark is set to now (no backfill). Manual test returns the latest review. Normal polling fetches reviews newer than the stored watermark.',
				name: 'pollingNotice',
				type: 'notice',
				default: '',
				displayOptions: {
					show: {},
				},
			},
			{
				displayName: 'App',
				name: 'appRef',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				description: 'The app to monitor for new reviews',
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
				displayName: 'Additional Filters',
				name: 'additionalFilters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				options: [
					{
						displayName: 'Country',
						name: 'country',
						type: 'string',
						default: '',
						placeholder: 'e.g. us',
						description: 'Only trigger for reviews from this country (two-letter ISO 3166-1 alpha-2 code, e.g. us, gb)',
					},
					{
						displayName: 'Rating',
						name: 'rating',
						type: 'options',
						options: [
							{ name: '1 Star', value: '1', description: 'Trigger only for 1-star reviews' },
							{ name: '2 Stars', value: '2', description: 'Trigger only for 2-star reviews' },
							{ name: '3 Stars', value: '3', description: 'Trigger only for 3-star reviews' },
							{ name: '4 Stars', value: '4', description: 'Trigger only for 4-star reviews' },
							{ name: '5 Stars', value: '5', description: 'Trigger only for 5-star reviews' },
							{ name: 'Any', value: '', description: 'Trigger for all ratings' },
						],
						default: '',
						description: 'Only trigger for reviews with this star rating',
					},
				],
			},
		],
	};

	methods = {
		listSearch: {
			async getApps(
				this: ILoadOptionsFunctions,
			): Promise<INodeListSearchResult> {
				const apps = await fetchApps(this);
				const results: INodeListSearchItems[] = apps.map((item) => ({
					name: `${item.title} (${item.app_store_slug})`,
					value: item.id,
					url: 'https://appreviewbot.com',
				}));
				return { results };
			},
		},
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const staticData = this.getWorkflowStaticData('node') as {
			lastContentUpdatedAt?: number;
		};

		const appRef = this.getNodeParameter('appRef', '', { extractValue: true }) as string;
		const additionalFilters = this.getNodeParameter('additionalFilters', {}) as {
			country?: string;
			rating?: string;
		};

		const isManualMode = this.getMode() === 'manual';
		const now = Math.floor(Date.now() / 1000);

		// On the very first automated run, initialise watermark to now and return nothing
		if (!isManualMode && staticData.lastContentUpdatedAt === undefined) {
			staticData.lastContentUpdatedAt = now;
			return null;
		}

		const qs: IDataObject = {
			limit: String(PAGE_SIZE),
		};

		if (additionalFilters.country) {
			qs.country = additionalFilters.country;
		}

		if (additionalFilters.rating) {
			qs.rating = additionalFilters.rating;
		}

		if (isManualMode) {
			// Manual mode: return the single most recent review regardless of watermark
			qs.limit = '1';
			const response: ReviewsResponse =
				await this.helpers.httpRequestWithAuthentication.call(this, 'appReviewBotApi', {
					method: 'GET',
					url: `https://appreviewbot.com/api/v1/apps/${appRef}/reviews`,
					qs,
					json: true,
				});

			const reviews = response.data ?? [];
			if (reviews.length === 0) {
				return null;
			}
			return [reviews.map((r) => ({ json: r as IDataObject }))];
		}

		// Normal polling mode: fetch all reviews newer than the watermark
		const watermark = staticData.lastContentUpdatedAt as number;
		qs.from = String(watermark + 1);

		const allReviews: ReviewItem[] = [];
		let startingAfter: string | undefined;
		let page = 0;

		do {
			if (startingAfter) {
				qs.starting_after = startingAfter;
			}

			const response: ReviewsResponse =
				await this.helpers.httpRequestWithAuthentication.call(this, 'appReviewBotApi', {
					method: 'GET',
					url: `https://appreviewbot.com/api/v1/apps/${appRef}/reviews`,
					qs: { ...qs },
					json: true,
				});

			const batch = response.data ?? [];
			allReviews.push(...batch);

			if (!response.has_more || batch.length === 0) {
				break;
			}

			startingAfter = batch[batch.length - 1].id;
			page++;
		} while (page < MAX_PAGES);

		if (allReviews.length === 0) {
			return null;
		}

		// Advance watermark to max content_updated_at seen
		const maxUpdatedAt = allReviews.reduce(
			(acc, r) => Math.max(acc, r.content_updated_at ?? 0),
			watermark,
		);
		staticData.lastContentUpdatedAt = maxUpdatedAt;

		return [allReviews.map((r) => ({ json: r as IDataObject }))];
	}
}
