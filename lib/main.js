const uuid = require('firost/lib/uuid');
const download = require('firost/lib/download');
const read = require('firost/lib/read');
const sharp = require('sharp');
const spinner = require('firost/lib/spinner');
const path = require('path');
const revHash = require('rev-hash');
const got = require('golgoth/lib/got');
const fs = require('fs');
const FormData = require('form-data');

module.exports = {
  async downloadRealPicture() {
    // Download a tmp file with a random name
    const id = uuid();
    const imageUrl = 'https://www.thispersondoesnotexist.com/image';
    const cachePath = path.resolve(`tmp/cache/${id}.jpg`);
    console.info('Download real picture');
    await download(imageUrl, cachePath);

    // Move this file to the assets
    const fileHash = revHash(await read(cachePath));
    const assetPath = path.resolve(`src/assets/real/${fileHash}.jpg`);
    console.info(`Compress ${cachePath} to ${assetPath}`);
    await sharp(cachePath).jpeg({ quality: 90 }).toFile(assetPath);
    return assetPath;
  },
  async downloadPaintingPortrait(realPath) {
    // Simulate the form
    const form = new FormData();
    form.append('id', '11111-SHb6');
    form.append('wm', '3');
    form.append('image', fs.createReadStream(realPath));

    // Post to portraitai.com
    const postUrl = 'https://portraitplus.facefun.ai/Port/MakePort';
    const progressBar = spinner();
    const response = await got
      .post(postUrl, {
        body: form,
      })
      .on('uploadProgress', (progress) => {
        const percent = Math.floor(progress.percent * 100);
        progressBar.tick(`Upload to portraitai.com ${percent}%`);
        if (percent >= 100) {
          progressBar.success('Upload finished');
        }
      });

    // Download final image
    const downloadPath = response.body;
    const downloadUrl = `https://portraitplus.facefun.ai/Port/${downloadPath}`;
    const basename = path.basename(realPath);
    const portraitPath = path.resolve(`src/assets/portrait/${basename}`);
    console.info('Download portrait');
    await download(downloadUrl, portraitPath);
  },
  async generate() {
    const realPath = await this.downloadRealPicture();
    console.info(realPath);

    try {
      await this.downloadPaintingPortrait(realPath);
    } catch (err) {
      console.info(err);
    }
  },
};
