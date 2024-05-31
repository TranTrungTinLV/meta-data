/* eslint-disable @typescript-eslint/no-unused-vars */
export const GetPageLimitOffset = (query: any) => {
  const page: number = query.page
    ? +query.page
    : +process.env.DEFAULT_PAGE_SIZE;
  const limit: number = query.limit
    ? +query.limit
    : +process.env.DEFAULT_PAGE_LIMIT;
  const offset: number = (query.page - 1) * query.limit;
  delete query.page;
  delete query.limit;
  delete query.offset;
  return { page, limit, offset };
};

export const GetPageLimitOffsetSort = (query: any) => {
  const page: number = query.page
    ? +query.page
    : +process.env.DEFAULT_PAGE_SIZE;
  const limit: number = query.limit
    ? +query.limit
    : +process.env.DEFAULT_PAGE_LIMIT;
  const offset: number = query.offset ? +query.offset : 0;
  const sort: number = query.sort ? +query.sort : 1;
  delete query.page;
  delete query.limit;
  delete query.offset;
  delete query.sort;
  return { page, limit, offset, sort };
};
