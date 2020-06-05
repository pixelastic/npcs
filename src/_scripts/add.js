const ky = require('ky').default;
module.exports = {
  data: {
    source: null,
  },
  apiUrl(folder) {
    const baseApiUrl = window.CONFIG.apiUrl;
    return `${baseApiUrl}${folder}`;
  },
  isEnabled() {
    return this.byId('addPage');
  },
  byId(selector) {
    return document.getElementById(selector);
  },
  getPictureUpload() {
    return this.byId('pictureUpload');
  },
  getPicturePreview() {
    return this.byId('picturePreview');
  },
  getPortraitPreview(index) {
    return this.byId(`portraitPreview${index}`);
  },
  async getFileAs(file, as) {
    const reader = new FileReader();
    reader[`readAs${as}`](file);
    return new Promise(resolve => {
      reader.onload = function() {
        resolve(this.result);
      };
    });
  },
  setStep(stepName) {
    this.byId('addForm').setAttribute('data-step', stepName);
  },
  async displayPreview(file) {
    const dataURL = await this.getFileAs(file, 'DataURL');
    const picturePreview = this.getPicturePreview();
    return new Promise(resolve => {
      picturePreview.onload = resolve;
      picturePreview.src = dataURL;
    });
  },
  async getSourceDataURL(file) {
    const dataURL = await this.getFileAs(file, 'DataURL');

    const tmpImage = this.byId('tmpImage');
    const tmpCanvas = this.byId('tmpCanvas');
    const finalDimension = 512;

    return new Promise(resolve => {
      tmpImage.onload = () => {
        const imageWidth = tmpImage.offsetWidth;
        const imageHeight = tmpImage.offsetHeight;
        tmpCanvas.width = finalDimension;
        tmpCanvas.height = finalDimension;
        tmpCanvas
          .getContext('2d')
          .drawImage(
            tmpImage,
            0,
            0,
            imageWidth,
            imageHeight,
            0,
            0,
            finalDimension,
            finalDimension
          );
        const canvasDataURL = tmpCanvas.toDataURL('image/png');

        resolve(canvasDataURL);
      };
      tmpImage.src = dataURL;
    });
  },
  handleInputSelection() {
    const pictureUpload = this.getPictureUpload();
    pictureUpload.addEventListener(
      'change',
      async () => {
        this.setStep('sourceSelected');

        const selectedFile = pictureUpload.files[0];
        await this.displayPreview(selectedFile);
        const sourceDataURL = await this.getSourceDataURL(selectedFile);

        // Save the file
        this.data.source = sourceDataURL;

        // Ask the API for portrait
        this.handlePortraitGeneration(sourceDataURL);
      },
      false
    );
  },
  async handlePortraitGeneration(base64) {
    const apiUrl = this.apiUrl('portraitify');
    const data = {
      source: base64,
    };
    const response = await ky.post(apiUrl, { json: data }).json();

    const portraitPreview = this.getPortraitPreview(1);
    portraitPreview.src = response.dataURL;

    // TODO:
    // Catch errors when something break in the lambda, ask to try with
    // another image
    // Once one is displayed, start loading the others with /alternatives
    // Once one is selected, allow for submitting
    // Clear all previews when selecting a new file
    // Submit the real and portrait to the function
  },
  init() {
    this.handleInputSelection();
  },
};
