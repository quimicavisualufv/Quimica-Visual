/* esm.sh - @monogrid/gainmap-js@3.4.0/dist/Loader-DLI-_JDP */
// node_modules/@monogrid/gainmap-js/dist/Loader-DLI-_JDP.js
import { SRGBColorSpace, LinearSRGBColorSpace, HalfFloatType, Loader, LoadingManager, Texture, UVMapping, ClampToEdgeWrapping, LinearFilter, LinearMipMapLinearFilter, RGBAFormat, UnsignedByteType } from "./1a1e65d494e34a0f95ed.mjs";
function createDecodeFunction(config) {
  return (params) => {
    const { sdr, gainMap, renderer } = params;
    if (sdr.colorSpace !== SRGBColorSpace) {
      console.warn("SDR Colorspace needs to be *SRGBColorSpace*, setting it automatically");
      sdr.colorSpace = SRGBColorSpace;
    }
    sdr.needsUpdate = true;
    if (gainMap.colorSpace !== LinearSRGBColorSpace) {
      console.warn("Gainmap Colorspace needs to be *LinearSRGBColorSpace*, setting it automatically");
      gainMap.colorSpace = LinearSRGBColorSpace;
    }
    gainMap.needsUpdate = true;
    const material = config.createMaterial({
      ...params,
      sdr,
      gainMap
    });
    const quadRenderer = config.createQuadRenderer({
      width: sdr.image.width,
      height: sdr.image.height,
      type: HalfFloatType,
      colorSpace: LinearSRGBColorSpace,
      material,
      renderer,
      renderTargetOptions: params.renderTargetOptions
    });
    return quadRenderer;
  };
}
var GainMapNotFoundError = class extends Error {
};
var XMPMetadataNotFoundError = class extends Error {
};
var getXMLValue = (xml, tag, defaultValue) => {
  const attributeMatch = new RegExp(`${tag}="([^"]*)"`, "i").exec(xml);
  if (attributeMatch)
    return attributeMatch[1];
  const tagMatch = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i").exec(xml);
  if (tagMatch) {
    const liValues = tagMatch[1].match(/<rdf:li>([^<]*)<\/rdf:li>/g);
    if (liValues && liValues.length === 3) {
      return liValues.map((v) => v.replace(/<\/?rdf:li>/g, ""));
    }
    return tagMatch[1].trim();
  }
  if (defaultValue !== void 0)
    return defaultValue;
  throw new Error(`Can't find ${tag} in gainmap metadata`);
};
var extractXMP = (input) => {
  let str;
  if (typeof TextDecoder !== "undefined")
    str = new TextDecoder().decode(input);
  else
    str = input.toString();
  let start = str.indexOf("<x:xmpmeta");
  while (start !== -1) {
    const end = str.indexOf("x:xmpmeta>", start);
    const xmpBlock = str.slice(start, end + 10);
    try {
      const gainMapMin = getXMLValue(xmpBlock, "hdrgm:GainMapMin", "0");
      const gainMapMax = getXMLValue(xmpBlock, "hdrgm:GainMapMax");
      const gamma = getXMLValue(xmpBlock, "hdrgm:Gamma", "1");
      const offsetSDR = getXMLValue(xmpBlock, "hdrgm:OffsetSDR", "0.015625");
      const offsetHDR = getXMLValue(xmpBlock, "hdrgm:OffsetHDR", "0.015625");
      const hdrCapacityMinMatch = /hdrgm:HDRCapacityMin="([^"]*)"/.exec(xmpBlock);
      const hdrCapacityMin = hdrCapacityMinMatch ? hdrCapacityMinMatch[1] : "0";
      const hdrCapacityMaxMatch = /hdrgm:HDRCapacityMax="([^"]*)"/.exec(xmpBlock);
      if (!hdrCapacityMaxMatch)
        throw new Error("Incomplete gainmap metadata");
      const hdrCapacityMax = hdrCapacityMaxMatch[1];
      return {
        gainMapMin: Array.isArray(gainMapMin) ? gainMapMin.map((v) => parseFloat(v)) : [parseFloat(gainMapMin), parseFloat(gainMapMin), parseFloat(gainMapMin)],
        gainMapMax: Array.isArray(gainMapMax) ? gainMapMax.map((v) => parseFloat(v)) : [parseFloat(gainMapMax), parseFloat(gainMapMax), parseFloat(gainMapMax)],
        gamma: Array.isArray(gamma) ? gamma.map((v) => parseFloat(v)) : [parseFloat(gamma), parseFloat(gamma), parseFloat(gamma)],
        offsetSdr: Array.isArray(offsetSDR) ? offsetSDR.map((v) => parseFloat(v)) : [parseFloat(offsetSDR), parseFloat(offsetSDR), parseFloat(offsetSDR)],
        offsetHdr: Array.isArray(offsetHDR) ? offsetHDR.map((v) => parseFloat(v)) : [parseFloat(offsetHDR), parseFloat(offsetHDR), parseFloat(offsetHDR)],
        hdrCapacityMin: parseFloat(hdrCapacityMin),
        hdrCapacityMax: parseFloat(hdrCapacityMax)
      };
    } catch (e) {
    }
    start = str.indexOf("<x:xmpmeta", end);
  }
};
var MPFExtractor = class {
  options;
  constructor(options) {
    this.options = {
      debug: options && options.debug !== void 0 ? options.debug : false,
      extractFII: options && options.extractFII !== void 0 ? options.extractFII : true,
      extractNonFII: options && options.extractNonFII !== void 0 ? options.extractNonFII : true
    };
  }
  extract(imageArrayBuffer) {
    return new Promise((resolve, reject) => {
      const debug = this.options.debug;
      const dataView = new DataView(imageArrayBuffer.buffer);
      if (dataView.getUint16(0) !== 65496) {
        reject(new Error("Not a valid jpeg"));
        return;
      }
      const length = dataView.byteLength;
      let offset = 2;
      let loops = 0;
      let marker;
      while (offset < length) {
        if (++loops > 250) {
          reject(new Error(`Found no marker after ${loops} loops \u{1F635}`));
          return;
        }
        if (dataView.getUint8(offset) !== 255) {
          reject(new Error(`Not a valid marker at offset 0x${offset.toString(16)}, found: 0x${dataView.getUint8(offset).toString(16)}`));
          return;
        }
        marker = dataView.getUint8(offset + 1);
        if (debug)
          console.log(`Marker: ${marker.toString(16)}`);
        if (marker === 226) {
          if (debug)
            console.log("Found APP2 marker (0xffe2)");
          const formatPt = offset + 4;
          if (dataView.getUint32(formatPt) === 1297106432) {
            const tiffOffset = formatPt + 4;
            let bigEnd;
            if (dataView.getUint16(tiffOffset) === 18761) {
              bigEnd = false;
            } else if (dataView.getUint16(tiffOffset) === 19789) {
              bigEnd = true;
            } else {
              reject(new Error("No valid endianness marker found in TIFF header"));
              return;
            }
            if (dataView.getUint16(tiffOffset + 2, !bigEnd) !== 42) {
              reject(new Error("Not valid TIFF data! (no 0x002A marker)"));
              return;
            }
            const firstIFDOffset = dataView.getUint32(tiffOffset + 4, !bigEnd);
            if (firstIFDOffset < 8) {
              reject(new Error("Not valid TIFF data! (First offset less than 8)"));
              return;
            }
            const dirStart = tiffOffset + firstIFDOffset;
            const count = dataView.getUint16(dirStart, !bigEnd);
            const entriesStart = dirStart + 2;
            let numberOfImages = 0;
            for (let i = entriesStart; i < entriesStart + 12 * count; i += 12) {
              if (dataView.getUint16(i, !bigEnd) === 45057) {
                numberOfImages = dataView.getUint32(i + 8, !bigEnd);
              }
            }
            const nextIFDOffsetLen = 4;
            const MPImageListValPt = dirStart + 2 + count * 12 + nextIFDOffsetLen;
            const images = [];
            for (let i = MPImageListValPt; i < MPImageListValPt + numberOfImages * 16; i += 16) {
              const image = {
                MPType: dataView.getUint32(i, !bigEnd),
                size: dataView.getUint32(i + 4, !bigEnd),
                // This offset is specified relative to the address of the MP Endian
                // field in the MP Header, unless the image is a First Individual Image,
                // in which case the value of the offset shall be NULL (0x00000000).
                dataOffset: dataView.getUint32(i + 8, !bigEnd),
                dependantImages: dataView.getUint32(i + 12, !bigEnd),
                start: -1,
                end: -1,
                isFII: false
              };
              if (!image.dataOffset) {
                image.start = 0;
                image.isFII = true;
              } else {
                image.start = tiffOffset + image.dataOffset;
                image.isFII = false;
              }
              image.end = image.start + image.size;
              images.push(image);
            }
            if (this.options.extractNonFII && images.length) {
              const bufferBlob = new Blob([dataView]);
              const imgs = [];
              for (const image of images) {
                if (image.isFII && !this.options.extractFII) {
                  continue;
                }
                const imageBlob = bufferBlob.slice(image.start, image.end + 1, "image/jpeg");
                imgs.push(imageBlob);
              }
              resolve(imgs);
            }
          }
        }
        offset += 2 + dataView.getUint16(offset + 2);
      }
    });
  }
};
var extractGainmapFromJPEG = async (jpegFile) => {
  const metadata = extractXMP(jpegFile);
  if (!metadata)
    throw new XMPMetadataNotFoundError("Gain map XMP metadata not found");
  const mpfExtractor = new MPFExtractor({ extractFII: true, extractNonFII: true });
  const images = await mpfExtractor.extract(jpegFile);
  if (images.length !== 2)
    throw new GainMapNotFoundError("Gain map recovery image not found");
  return {
    sdr: new Uint8Array(await images[0].arrayBuffer()),
    gainMap: new Uint8Array(await images[1].arrayBuffer()),
    metadata
  };
};
var getHTMLImageFromBlob = (blob) => {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.onload = () => {
      resolve(img);
    };
    img.onerror = (e) => {
      reject(e);
    };
    img.src = URL.createObjectURL(blob);
  });
};
var LoaderBaseShared = class extends Loader {
  _renderer;
  _renderTargetOptions;
  _internalLoadingManager;
  _config;
  constructor(config, manager) {
    super(manager);
    this._config = config;
    if (config.renderer)
      this._renderer = config.renderer;
    this._internalLoadingManager = new LoadingManager();
  }
  setRenderer(renderer) {
    this._renderer = renderer;
    return this;
  }
  setRenderTargetOptions(options) {
    this._renderTargetOptions = options;
    return this;
  }
  prepareQuadRenderer() {
    if (!this._renderer) {
      console.warn("WARNING: A Renderer was not passed to this Loader constructor or in setRenderer, the result of this Loader will need to be converted to a Data Texture with toDataTexture() before you can use it in your renderer.");
    }
    const material = this._config.createMaterial({
      gainMapMax: [1, 1, 1],
      gainMapMin: [0, 0, 0],
      gamma: [1, 1, 1],
      offsetHdr: [1, 1, 1],
      offsetSdr: [1, 1, 1],
      hdrCapacityMax: 1,
      hdrCapacityMin: 0,
      maxDisplayBoost: 1,
      gainMap: new Texture(),
      sdr: new Texture()
    });
    return this._config.createQuadRenderer({
      width: 16,
      height: 16,
      type: HalfFloatType,
      colorSpace: LinearSRGBColorSpace,
      material,
      renderer: this._renderer,
      renderTargetOptions: this._renderTargetOptions
    });
  }
  async processImages(sdrBuffer, gainMapBuffer, imageOrientation) {
    const gainMapBlob = gainMapBuffer ? new Blob([gainMapBuffer], { type: "image/jpeg" }) : void 0;
    const sdrBlob = new Blob([sdrBuffer], { type: "image/jpeg" });
    let sdrImage;
    let gainMapImage;
    let needsFlip = false;
    if (typeof createImageBitmap === "undefined") {
      const res = await Promise.all([
        gainMapBlob ? getHTMLImageFromBlob(gainMapBlob) : Promise.resolve(void 0),
        getHTMLImageFromBlob(sdrBlob)
      ]);
      gainMapImage = res[0];
      sdrImage = res[1];
      needsFlip = imageOrientation === "flipY";
    } else {
      const res = await Promise.all([
        gainMapBlob ? createImageBitmap(gainMapBlob, { imageOrientation: imageOrientation || "flipY" }) : Promise.resolve(void 0),
        createImageBitmap(sdrBlob, { imageOrientation: imageOrientation || "flipY" })
      ]);
      gainMapImage = res[0];
      sdrImage = res[1];
    }
    return { sdrImage, gainMapImage, needsFlip };
  }
  createTextures(sdrImage, gainMapImage, needsFlip) {
    const gainMap = new Texture(gainMapImage || new ImageData(2, 2), UVMapping, ClampToEdgeWrapping, ClampToEdgeWrapping, LinearFilter, LinearMipMapLinearFilter, RGBAFormat, UnsignedByteType, 1, LinearSRGBColorSpace);
    gainMap.flipY = needsFlip;
    gainMap.needsUpdate = true;
    const sdr = new Texture(sdrImage, UVMapping, ClampToEdgeWrapping, ClampToEdgeWrapping, LinearFilter, LinearMipMapLinearFilter, RGBAFormat, UnsignedByteType, 1, SRGBColorSpace);
    sdr.flipY = needsFlip;
    sdr.needsUpdate = true;
    return { gainMap, sdr };
  }
  updateQuadRenderer(quadRenderer, sdrImage, gainMap, sdr, metadata) {
    quadRenderer.width = sdrImage.width;
    quadRenderer.height = sdrImage.height;
    quadRenderer.material.gainMap = gainMap;
    quadRenderer.material.sdr = sdr;
    quadRenderer.material.gainMapMin = metadata.gainMapMin;
    quadRenderer.material.gainMapMax = metadata.gainMapMax;
    quadRenderer.material.offsetHdr = metadata.offsetHdr;
    quadRenderer.material.offsetSdr = metadata.offsetSdr;
    quadRenderer.material.gamma = metadata.gamma;
    quadRenderer.material.hdrCapacityMin = metadata.hdrCapacityMin;
    quadRenderer.material.hdrCapacityMax = metadata.hdrCapacityMax;
    quadRenderer.material.maxDisplayBoost = Math.pow(2, metadata.hdrCapacityMax);
    quadRenderer.material.needsUpdate = true;
  }
};
export {
  GainMapNotFoundError as G,
  LoaderBaseShared as L,
  MPFExtractor as M,
  XMPMetadataNotFoundError as X,
  extractXMP as a,
  createDecodeFunction as c,
  extractGainmapFromJPEG as e
};
