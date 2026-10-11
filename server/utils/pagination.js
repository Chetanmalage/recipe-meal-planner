const parsePositiveInteger = (value, fallback, maximum = Number.MAX_SAFE_INTEGER) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, maximum) : fallback;
};

const paginate = async (model, query, { page = 1, limit = 12, filter = {}, sort = '-createdAt', populate = '' }) => {
  const pageNum = parsePositiveInteger(page, 1);
  const limitNum = parsePositiveInteger(limit, 12, 50);
  const skip = (pageNum - 1) * limitNum;
  const [items, total] = await Promise.all([
    model.find(filter).sort(sort).skip(skip).limit(limitNum).populate(populate),
    model.countDocuments(filter),
  ]);
  return { items, pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum), limit: limitNum } };
};

module.exports = paginate;
