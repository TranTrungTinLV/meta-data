module.exports = function (doc) {
  return !doc.deleted; // không đánh index cho các bản ghi bị xóa mềm
};
