/* eslint-disable no-param-reassign */
const turf = require('@turf/turf');

// calculates area of polygon
const areaCalc = (data) => {
  let polygon = null;
  let area = null;
  data.forEach((d) => {
    polygon = turf.polygon(d.geometry.coordinates);
    area = turf.area(polygon);
    d.area = area;
  });
  return data;
};

// calculates center of mass of polygon
const comCalc = (data) => {
  let polygon = null;
  let com = null;
  data.forEach((d) => {
    polygon = turf.polygon(d.geometry.coordinates);
    com = turf.centerOfMass(polygon);
    d.centerOfMass = com;
  });
  return data;
};

// calculates centroid of polygon
const centroidCalc = (data) => {
  let polygon = null;
  let centroid = null;
  data.forEach((d) => {
    polygon = turf.polygon(d.geometry.coordinates);
    centroid = turf.centroid(polygon);
    d.centroid = centroid;
  });
  return data;
};

module.exports = {
  areaCalc,
  comCalc,
  centroidCalc,
};
