const calculatePaginationData = (count, page, limit) => {
    const totalPage = Math.ceil(count / limit);
    const hasNextPage = Boolean(totalPage - page) && totalPage - page > 0;
    const hasPreviousPage = page != 1 && page <= totalPage + 1;
    return {
        page: Number(page),
        limit: Number(limit),
        totalItem: count,
        totalPage: totalPage === 0 ? 1 : totalPage,
        hasPreviousPage,
        hasNextPage,
    };
};

export default calculatePaginationData;
