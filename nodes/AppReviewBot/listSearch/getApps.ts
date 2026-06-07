import type {
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';

type AppItem = {
	id: string;
	title: string;
	app_store_slug: string;
};

type AppsResponse = {
	data: AppItem[];
	has_more: boolean;
};

export async function getApps(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
	const responseData: AppsResponse = await this.helpers.httpRequestWithAuthentication.call(
		this,
		'appReviewBotApi',
		{
			method: 'GET',
			url: 'https://appreviewbot.com/api/v1/apps',
			json: true,
		},
	);

	const results: INodeListSearchItems[] = (responseData.data ?? []).map((item: AppItem) => ({
		name: `${item.title} (${item.app_store_slug})`,
		value: item.id,
		url: `https://appreviewbot.com`,
	}));

	return { results };
}
