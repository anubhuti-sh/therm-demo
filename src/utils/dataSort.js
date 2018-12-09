// sorts area
const sortArea = (data, type, entity) => {
  if (type === 'asc') data.sort((a, b) => a.area - b.area);
  else data.sort((a, b) => b[entity] - a[entity]);
  return data;
};

// Sorts coordinates
const sortCoord = (data, type, entity) => {
  if (type === 'asc') data.sort((a, b) => a[entity].geometry.coordinates[0] - b[entity].geometry.coordinates[0]);
  else data.sort((a, b) => b[entity].geometry.coordinates[0] - a[entity].geometry.coordinates[0]);
  return data;
};

module.exports = {
  sortArea,
  sortCoord,
};
