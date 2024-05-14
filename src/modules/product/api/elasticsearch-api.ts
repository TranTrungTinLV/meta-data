import axios from 'axios';

export const elasticSearchApi = axios.create({
  baseURL: 'https://127.0.0.1:9200/',
  headers: {
    'Content-Type': 'application/x-ndjson',
  },
});
