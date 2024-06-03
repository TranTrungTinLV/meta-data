import { Client } from "@elastic/elasticsearch";
import { SearchResponse } from "@elastic/elasticsearch/lib/api/types";

export async function searchElasticSearch(
  client: Client,
  index: string,
  query: string,
  from: number,
  size: number,
): Promise<SearchResponse<any>> {
  try {
    return await client.search({
      index,
      body: {
        from,
        size,
        query: {
          query_string: {
            query: `*${query}*`,
            fields: [
              "name",
              "category_id",
              "detail",
              "images",
              "specification",
              "standard",
            ],
          },
        },
      },
    });
  } catch (error) {
    if (
      error.meta &&
      error.meta.body &&
      error.meta.body.error.type === "index_not_found_exception"
    ) {
      console.error(`Index ${index} not found`);
    }
    if (
      error.meta &&
      error.meta.body &&
      error.meta.body.error.type === "search_phase_execution_exception"
    ) {
      console.log(`file it large`);
    }
    throw error;
  }
}
