const extractXYTranslation = (element) => {
  const transformList = element.transform.baseVal;
  for (let i = 0; i < transformList.numberOfItems; i++) {
      const transform = transformList.getItem(i);
      if (transform.type === SVGTransform.SVG_TRANSFORM_TRANSLATE) {
          return {
              x: transform.matrix.e || 0,
              y: transform.matrix.f || 0
          };
      }
  }
  return { x: 0, y: 0 };
}

const getAugmentedBbox = (element, scaled = false) => {
  let bbox = element.getBBox();
  let translatedXY = extractXYTranslation(element);
  bbox.x += translatedXY.x;
  bbox.y += translatedXY.y;

  if(scaled) {
      const svg = document.querySelector("svg");
      const viewBoxWidth = svg.viewBox.baseVal.width;
      const clientWidth = svg.clientWidth;
      const scalingFactor = clientWidth / viewBoxWidth;

      bbox.x *= scalingFactor;
      bbox.y *= scalingFactor;
      bbox.width *= scalingFactor;
      bbox.height *= scalingFactor;
  }

  bbox.xRight = window.innerWidth - (bbox.x + bbox.width);
  bbox.yBottom = bbox.y + bbox.height;
  return bbox;
};