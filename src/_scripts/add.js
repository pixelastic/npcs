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
  getPortraitPreview() {
    return this.byId('portraitPreview');
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
  handleInputSelection() {
    const pictureUpload = this.getPictureUpload();
    pictureUpload.addEventListener(
      'change',
      async () => {
        const selectedFile = pictureUpload.files[0];
        const base64 = await this.getFileAs(selectedFile, 'DataURL');

        // Update the preview
        const picturePreview = this.getPicturePreview();
        picturePreview.src = base64;

        // Save the file
        this.data.source = base64;

        // Ask the API for portrait
        this.handlePortraitGeneration(base64);
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

    const portraitPreview = this.getPortraitPreview();
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
