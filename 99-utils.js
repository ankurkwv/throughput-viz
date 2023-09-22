window.addEventListener('load', function() {
  registerResizeEvent();
});

let resizeTimeout;

const registerResizeEvent = () => {
  window.addEventListener('resize', function() {
    // Clear the timeout if it's already set. This prevents the function from executing
    // if the event is fired again before the timeout has completed.
    if (resizeTimeout) {
        clearTimeout(resizeTimeout);
    }

    // Set a new timeout
    resizeTimeout = setTimeout(function() {
        // Call the function after a delay. Adjust the delay (300ms here) as needed.
        respositionTitles();
    }, 300);
  });
}

const respositionTitles = () => {
  console.log('here');
  titles.forEach((title) => {
    const borderElement = document.querySelector(`#${title.borderId}`);
    if(!borderElement) return;
    const bbox = getAugmentedBbox(borderElement, true);
    if (title.titleDiv) {
      let style = { left: `${bbox.x + 6}px`, top: `${bbox.y - 14}px` };
      Object.assign(title.titleDiv.style, style);
    }

    if (title.subtitleDiv) {
      let style = { right: `${bbox.xRight - 2}px`, top: `${bbox.yBottom - title.subtitleDiv.offsetHeight + 2}px`};
      Object.assign(title.subtitleDiv.style, style);
    }
  });
};

const createDiv = (className, text) => {
  const div = document.createElement('div');
  div.className = className;
  if (text) div.innerHTML = text;
  document.body.appendChild(div);
  return div;
};

const addTitles = () => {
  titles.forEach((title) => {

    if (title.title && isNaN(title.titleDiv)) {
      title.titleDiv = createDiv('svg-title', title.title);
    }

    if (title.subtitle && isNaN(title.subtitleDiv)) {
      title.subtitleDiv = createDiv('svg-subtitle', title.subtitle);
    }
  });
  respositionTitles();
};

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