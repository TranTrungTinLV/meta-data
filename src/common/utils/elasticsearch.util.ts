import { Client } from '@elastic/elasticsearch';
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';

export async function searchElasticSearch(
  client: Client,
  index: string,
  query: string,
): Promise<SearchResponse<any>> {
  try {
    return await client.search({
      index,
      body: {
        query: {
          query_string: {
            query: `*${query}*`,
            fields: [
              'name',
              'category_id',
              'detail',
              'images',
              'specification',
              'standard',
            ],
          },
        },
      },
    });
  } catch (error) {
    if (
      error.meta &&
      error.meta.body &&
      error.meta.body.error.type === 'index_not_found_exception'
    ) {
      console.error(`Index ${index} not found`);
      // return {
      //   hits: {
      //     hits: [],
      //   },
      // };
    }
    throw error;
  }
}
