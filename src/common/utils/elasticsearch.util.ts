import { Client } from "@elastic/elasticsearch";
import { SearchResponse } from "@elastic/elasticsearch/lib/api/types";
import { removeVietnameseDiacritics } from "./text.util";

export async function searchElasticSearch(
  client: Client,
  index: string,
  query: string,
  from: number,
  size: number
): Promise<SearchResponse<any>> {
  try {
    const normalizedQuery = removeVietnameseDiacritics(query);
    const result = await client.search({
      index,
      body: {
        _source: ["name", "search"],
        from,
        size,
        query: {
          bool: {
            should: [
              {
                multi_match: {
                  query: query,
                  fields: ["name^10", "search^10"],
                  type: "best_fields",
                  operator: "and",
                  fuzziness: "AUTO",
                },
              },
              {
                multi_match: {
                  query: normalizedQuery,
                  fields: ["name", "search"],
                  type: "best_fields",
                  operator: "and",
                  fuzziness: "AUTO",
                },
              },
              { match_phrase: { name: { query: query, slop: 3, boost: 5 } } }, // Allowing for words to be out of order within a reasonable range
              {
                match_phrase: {
                  search: { query: normalizedQuery, slop: 3, boost: 5 },
                },
              }, // Allowing for words to be out of order within a reasonable range
              { match: { name: { query: query, boost: 2 } } },
              { match: { search: { query: normalizedQuery, boost: 2 } } },
              { wildcard: { name: { value: `*${query}*`, boost: 2 } } },
              {
                wildcard: {
                  search: { value: `*${normalizedQuery}*`, boost: 2 },
                },
              },
            ],
            minimum_should_match: 1,
          },
        },
      },
    });
    return result;
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
}
