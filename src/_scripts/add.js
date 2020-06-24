const ky = require('ky').default;
const pMap = require('p-map');
// TODO:
// Catch errors when something break in the lambda, ask to try with
// another image
// Once one is selected, allow for submitting
// Allow sending a new file
// Clear all previews when selecting a new file
module.exports = {
  data: {
    source: null,
  },
  /**
   * Init the form interactivity
   **/
  init() {
    const pictureUpload = this.byId('pictureUpload');
    pictureUpload.addEventListener(
      'change',
      async () => {
        this.setStep('sourceSelected');

        const selectedFile = pictureUpload.files[0];
        const dataURL = await this.getSelectedFileDataURL(selectedFile);

        // We display the preview directly from the selected file
        const picturePreview = this.byId('picturePreview');
        await this.loadImage(picturePreview, dataURL);

        // We get the source dataURL by writing it to a canvas offscreen
        const sourceDataURL = await this.convertAndResizeToPNG(dataURL, 512);

        // Save the file
        this.data.source = sourceDataURL;

        // Ask the API for portrait
        // this.generatePortraits(sourceDataURL);
      },
      false
    );
  },
  /**
   * Returns true if we're on the add page
   * @returns {boolean} True if we're on the add page
   **/
  isEnabled() {
    return this.byId('addPage');
  },
  /**
   * Wrapper around document.getElementById
   * @param {string} id Id selector
   * @returns {object} HTML object
   **/
  byId(id) {
    return document.getElementById(id);
  },
  /**
   * Change the current step of the form.
   * It internally changes an HTML attibute and toggling element is handled in
   * CSS
   * @param {string} stepName Name of the current step
   **/
  setStep(stepName) {
    this.byId('addForm').setAttribute('data-step', stepName);
  },
  /**
   * Load an image and wait until it's loaded
   * @param {object} image Image HTML tag
   * @param {string} src Src value of the image
   * @returns {object} The image HTML tag
   **/
  async loadImage(image, src) {
    return new Promise((resolve) => {
      image.onload = () => {
        resolve(image);
      };
      image.src = src;
    });
  },
  /**
   * Convert a dataURL into a resized png dataURL
   * @param {string} inputDataURL Source dataURl
   * @param {number} newDimension Length of one new side
   * @returns {string} Final dataURL
   **/
  async convertAndResizeToPNG(inputDataURL, newDimension) {
    const tmpImage = this.byId('tmpImage');
    const tmpCanvas = this.byId('tmpCanvas');

    return new Promise((resolve) => {
      tmpImage.onload = () => {
        tmpCanvas.width = newDimension;
        tmpCanvas.height = newDimension;
        tmpCanvas
          .getContext('2d')
          .drawImage(
            tmpImage,
            0,
            0,
            tmpImage.offsetWidth,
            tmpImage.offsetHeight,
            0,
            0,
            newDimension,
            newDimension
          );
        const canvasDataURL = tmpCanvas.toDataURL('image/png');

        resolve(canvasDataURL);
      };
      tmpImage.src = inputDataURL;
    });
  },
  /**
   * Returns the dataURL representing a file selected by the upload input
   * @param {object} selectedFile File selected in the file input
   * @returns {string} dataURL of the file
   **/
  async getSelectedFileDataURL(selectedFile) {
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.readAsDataURL(selectedFile);
      reader.onload = function () {
        resolve(this.result);
      };
    });
  },

  /**
   * Return the full API url to a given endpoint
   * @param {string} entrypoint API entrypoint
   * @returns {string} Full API endpoint
   **/
  apiUrl(entrypoint) {
    const baseApiUrl = window.CONFIG.apiUrl;
    return `${baseApiUrl}${entrypoint}`;
  },

  /**
   * Generate portraits from the source and display them
   * @param {string} sourceDataURL dataURL of the source image
   **/
  async generatePortraits(sourceDataURL) {
    const apiUrl = this.apiUrl('portraitify');
    const data = {
      source: sourceDataURL,
    };
    const response = await ky.post(apiUrl, { json: data }).json();

    // Display the first preview
    const mainPortraitPreview = this.byId('portraitPreview1');
    mainPortraitPreview.src = response.dataURL;

    // Display variants
    const portraitId = response.portraitId;
    const variantUrl = this.apiUrl('variants');
    const variantData = {
      portraitId,
    };
    await pMap([2, 3, 4], async (index) => {
      const variantResponse = await ky
        .post(variantUrl, { json: variantData })
        .json();
      const portraitPreview = this.byId(`portraitPreview${index}`);
      portraitPreview.src = variantResponse.dataURL;
    });
  },
};
