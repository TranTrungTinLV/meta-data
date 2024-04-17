export const QueryPaginate = (query: any) => {
  delete query.page;
  delete query.limit;
  Object.entries(query).forEach(([key, val]) => {
    query[key] = new RegExp(val.toString(), 'i');
  });
  return query;
};

export const GetPageAndLimit = (query: any) => {
  const page: number = query.page
    ? +query.page
    : +process.env.PAGINATE_DEFAULT_PAGE;
  const limit: number = query.limit
    ? +query.limit
    : +process.env.PAGINATE_DEFAULT_LIMIT;
  delete query.page;
  delete query.limit;
  return { page, limit };
};

export const GetSort = (query: any) => {
  let sort = query.sort && query.sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
  delete query.sort;
  return sort;
};

export const GetOffset = (query: any) => {
  let offset = query.offset ? +query.offset : undefined;
  delete query.offset;
  return offset;
};

export const GetPaginate = (query: any) => {
  const { page, limit } = GetPageAndLimit(query);
  const sort = GetSort(query);
  const offset = GetOffset(query);
  return { page, limit, sort, offset };
};

export const GetConditionQueryParam = (query: any) => {
  Object.entries(query).forEach(([key, val]) => {
    if (!key.includes('_id')) {
      query[key] = new RegExp(val.toString(), 'i');
    }
  });
  return query;
};
