import axios from "axios";

export const elasticSearchApi = axios.create({
    baseURL: 'https://localhost:9200/',
    headers: {
        "Content-Type": "application/x-ndjson",
      },
})