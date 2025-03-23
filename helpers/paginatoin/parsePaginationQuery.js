import defaultPagination from '../../constants/defaultPagination.js';

const parseNumber = (number, defaultNumber) => {
    if (typeof number !== 'string') return defaultNumber;
    return isNaN(Number(number)) ? defaultNumber : number;
};

const parsePaginationQuery = query => {
    const { page, limit, recipeLimit } = query;
    return {
        page: parseNumber(page, defaultPagination.page),
        limit: parseNumber(limit, defaultPagination.limit),
        recipeLimit: parseNumber(recipeLimit, defaultPagination.recipeLimit),
    };
};

export default parsePaginationQuery;
