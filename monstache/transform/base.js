module.exports = function (doc) {
  return _.pick(doc, '_id', 'name');
};
