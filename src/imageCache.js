/* eslint-disable no-continue */
import { Style, Icon } from 'ol/style';

import { IMAGE_LOADING, IMAGE_LOADED, IMAGE_ERROR } from './constants';

/* eslint-disable no-underscore-dangle */
// Global image cache. A map of image Url -> {
//   url: image url,
//   image: an Image instance containing image data,
//   width: image width in pixels,
//   height: image height in pixels
// }
const imageCache = {};

export function setCachedImage(url, imageData) {
  imageCache[url] = imageData;
}

export function getCachedImage(url) {
  return imageCache[url];
}

export function getCachedImageUrls() {
  return Object.keys(imageCache);
}

/**
 * @private
 * Updates the __loadingState metadata for the symbolizers with the new imageLoadState, if
 * the external graphic is matching the image url.
 * This action replaces symbolizers with new symbolizers if they get a new __loadingState.
 * @param {object} featureTypeStyle A feature type style object.
 * @param {string} imageUrl The image url.
 * @param {string} imageLoadState One of 'IMAGE_LOADING', 'IMAGE_LOADED', 'IMAGE_ERROR'.
 */
export function updateExternalGraphicRule(rule, imageUrl, imageLoadState) {
  // for pointsymbolizer
  if (rule.pointsymbolizer && rule.pointsymbolizer.graphic) {
    const { graphic } = rule.pointsymbolizer;
    const { externalgraphic } = graphic;
    if (
      externalgraphic &&
      externalgraphic.onlineresource === imageUrl &&
      rule.pointsymbolizer.__loadingState !== imageLoadState
    ) {
      rule.pointsymbolizer = {
        ...rule.pointsymbolizer,
        __loadingState: imageLoadState,
      };
    }
  }
  // for polygonsymbolizer
  if (
    rule.polygonsymbolizer &&
    rule.polygonsymbolizer.fill &&
    rule.polygonsymbolizer.fill.graphicfill &&
    rule.polygonsymbolizer.fill.graphicfill.graphic
  ) {
    const { graphic } = rule.polygonsymbolizer.fill.graphicfill;
    const { externalgraphic } = graphic;
    if (
      externalgraphic &&
      externalgraphic.onlineresource === imageUrl &&
      rule.polygonsymbolizer.__loadingState !== imageLoadState
    ) {
      rule.polygonsymbolizer = {
        ...rule.polygonsymbolizer,
        __loadingState: imageLoadState,
      };
    }
  }
}

/**
 * @private
 * Go through all rules with an external graphic matching the image url
 * and update the __loadingState metadata for the symbolizers with the new imageLoadState.
 * This action replaces symbolizers with new symbolizers if they get a new __loadingState.
 * @param {object} featureTypeStyle A feature type style object.
 * @param {string} imageUrl The image url.
 * @param {string} imageLoadState One of 'IMAGE_LOADING', 'IMAGE_LOADED', 'IMAGE_ERROR'.
 */
function updateExternalGraphicRules(
  featureTypeStyle,
  imageUrl,
  imageLoadState
) {
  // Go through all rules with an external graphic matching the image url
  // and update the __loadingState metadata for the symbolizers with the new imageLoadState.
  if (!featureTypeStyle.rules) {
    return;
  }

  featureTypeStyle.rules.forEach(rule => {
    updateExternalGraphicRule(rule, imageUrl, imageLoadState);
  });
}

/**
 * @private
 * Load and cache an image that's used as externalGraphic inside one or more symbolizers inside a feature type style object.
 * When the image is loaded, it's put into the cache, the __loadingStaet inside the featureTypeStyle symbolizers are updated,
 * and the imageLoadedCallback is called with the loaded image url.
 * @param {url} imageUrl Image url.
 * @param {string} imageLoadState One of IMAGE_LOADING, IMAGE_LOADED or IMAGE_ERROR.
 * @param {object} featureTypeStyle Feature type style object.
 * @param {Function} imageLoadedCallback Will be called with the image url when image
 * has loaded. Will be called with undefined if the loading the image resulted in an error.
 */
export function loadExternalGraphic(
  imageUrl,
  imageLoadState,
  featureTypeStyle,
  imageLoadedCallback
) {
  const image = new Image();

  image.onload = () => {
    setCachedImage(imageUrl, {
      url: imageUrl,
      image,
      width: image.naturalWidth,
      height: image.naturalHeight,
    });
    updateExternalGraphicRules(featureTypeStyle, imageUrl, IMAGE_LOADED);
    imageLoadState[imageUrl] = IMAGE_LOADED;
    if (typeof imageLoadedCallback === 'function') {
      imageLoadedCallback(imageUrl);
    }
  };

  image.onerror = () => {
    updateExternalGraphicRules(featureTypeStyle, imageUrl, IMAGE_ERROR);
    imageLoadState[imageUrl] = IMAGE_ERROR;
    if (typeof imageLoadedCallback === 'function') {
      imageLoadedCallback();
    }
  };

  image.src = imageUrl;
  updateExternalGraphicRules(featureTypeStyle, imageUrl, IMAGE_LOADING);
}

/**
 * @private
 * Start loading images used in rules that have a pointsymbolizer with an externalgraphic.
 * On image load start or load end, update __loadingState metadata of the symbolizers for that image url.
 * @param {Array<object>} rules Array of SLD rule objects that pass the filter for a single feature.
 * @param {FeatureTypeStyle} featureTypeStyle The feature type style object for a layer.
 * @param {object} imageLoadState Cache of image load state: imageUrl -> IMAGE_LOADING | IMAGE_LOADED | IMAGE_ERROR.
 * @param {Function} imageLoadedCallback Function to call when an image has loaded.
 */
export function processExternalGraphicSymbolizers(
  rules,
  featureTypeStyle,
  imageLoadState,
  imageLoadedCallback
) {
  // If a feature has an external graphic point or polygon symbolizer, the external image may
  // * have never been requested before.
  //   --> set __loadingState IMAGE_LOADING on the symbolizer and start loading the image.
  //       When loading is complete, replace all symbolizers using that image inside the featureTypeStyle
  //       with new symbolizers with a new __loadingState. Also call options.imageLoadCallback if one has been provided.
  // * be loading.
  //   --> set __loadingState IMAGE_LOADING on the symbolizer if not already so.
  // * be loaded and therefore present in the image cache.
  //   --> set __loadingState IMAGE_LOADED on the symbolizer if not already so.
  // * be in error. Error is a kind of loaded, but with an error icon style.
  //   --> set __loadingState IMAGE_ERROR on the symbolizer if not already so.
  for (let k = 0; k < rules.length; k += 1) {
    const rule = rules[k];

    let symbolizer;
    let exgraphic;

    if (
      rule.pointsymbolizer &&
      rule.pointsymbolizer.graphic &&
      rule.pointsymbolizer.graphic.externalgraphic
    ) {
      symbolizer = rule.pointsymbolizer;
      exgraphic = rule.pointsymbolizer.graphic.externalgraphic;
    } else if (
      rule.polygonsymbolizer &&
      rule.polygonsymbolizer.fill &&
      rule.polygonsymbolizer.fill.graphicfill &&
      rule.polygonsymbolizer.fill.graphicfill.graphic &&
      rule.polygonsymbolizer.fill.graphicfill.graphic.externalgraphic
    ) {
      symbolizer = rule.polygonsymbolizer;
      exgraphic =
        rule.polygonsymbolizer.fill.graphicfill.graphic.externalgraphic;
    } else {
      continue;
    }

    const imageUrl = exgraphic.onlineresource;
    if (!(imageUrl in imageLoadState)) {
      // Start loading the image and set image load state on the symbolizer.
      imageLoadState[imageUrl] = IMAGE_LOADING;
      loadExternalGraphic(
        imageUrl,
        imageLoadState,
        featureTypeStyle,
        imageLoadedCallback
      );
    } else if (
      // Change image load state on the symbolizer if it has changed in the meantime.
      symbolizer.__loadingState !== imageLoadState[imageUrl]
    ) {
      updateExternalGraphicRule(rule, imageUrl, imageLoadState[imageUrl]);
    }
  }
}

/**
 * @private
 * Create an OL Icon style for an external graphic.
 * The Graphic must be already loaded and present in the global imageCache.
 * @param {string} imageUrl Url of the external graphic.
 * @param {number} size Requested size in pixels.
 * @param {number} [rotationDegrees] Image rotation in degrees (clockwise). Default 0.
 */
export function createCachedImageStyle(imageUrl, size, rotationDegrees = 0.0) {
  const { image, width, height } = getCachedImage(imageUrl);
  return new Style({
    image: new Icon({
      img: image,
      imgSize: [width, height],
      // According to SLD spec, if size is given, image height should equal the given size.
      scale: size / height || 1,
      rotation: (Math.PI * rotationDegrees) / 180.0,
    }),
  });
}
