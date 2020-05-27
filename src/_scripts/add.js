module.exports = {
  data: {},
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
        const fileAsDataURL = await this.getFileAs(selectedFile, 'DataURL');
        const fileAsText = await this.getFileAs(selectedFile, 'Text');

        // Update the preview
        const picturePreview = this.getPicturePreview();
        picturePreview.src = fileAsDataURL;

        // Save the file
        this.data.real = fileAsText;

        // Ask the API for portrait
        this.handlePortraitGeneration(fileAsText);
      },
      false
    );
  },
  handlePortraitGeneration(file) {
    console.info(file);
  },
  init() {
    this.handleInputSelection();
  },
};
