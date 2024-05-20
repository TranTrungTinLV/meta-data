module.exports = function (doc) {
  if (!doc.deleted) {
    // Giữ lại toàn bộ trường `name` cùng các trường khác
    return {
      _id: doc._id,
      name: doc.name,
      code: doc.code,
      detail: doc.detail,
      images: doc.images,
      note: doc.note,
      category_id: doc.category_id,
      specification: doc.specification,
      standard: doc.standard,
      unit: doc.unit,
      quantity: doc.quantity,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
  return null; // Không index các bản ghi bị xóa mềm
};
