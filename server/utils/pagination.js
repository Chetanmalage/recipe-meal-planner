const paginate = async (model, query, { page = 1, limit = 12, filter = {}, sort = '-createdAt', populate = '' }) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    model.find(filter).sort(sort).skip(skip).limit(limitNum).populate(populate),
    model.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  };
};

module.exports = paginate;