const secrets = require('./lib/secrets.js');
const responseHelper = require('callirhoe/lib/responseHelper');
const sentry = require('callirhoe/lib/sentry');
const parseDataURL = require('data-urls');
const got = require('golgoth/lib/got');
const FormData = require('form-data');
const path = require('path');
sentry.init(secrets.SENTRY_DSN);

/**
 * Take an image as input and return the portrait version as output
 * @param {object} rawRequest Request object
 * @returns {object} Response object
 */
async function handler(rawRequest) {
  const response = new responseHelper();

  // Getting the picture as a base64 encoded file
  const data = JSON.parse(rawRequest.body);
  const source = data.source;

  // Converting it to a buffer
  const parsedDataURL = parseDataURL(source);
  const content = parsedDataURL.body;

  // Simulating a form to upload
  const form = new FormData();
  form.append('id', '11111-SHb6');
  form.append('wm', '3');
  form.append('image', content, 'filename.jpg');

  // Submitting the form to portraitai
  const postUrl = 'https://portraitplus.facefun.ai/Port/MakePort';
  let portraitUrl;
  try {
    const portraitAiResponse = await got.post(postUrl, {
      body: form,
    });
    portraitUrl = `https://portraitplus.facefun.ai/Port/${portraitAiResponse.body}`;
  } catch (err) {
    console.info('ERROR');
    return response.output('nope');
  }

  console.info({ portraitUrl });

  // Get the portrait as base64
  const portraitBuffer = await got(portraitUrl).buffer();
  const portraitAsBase64 = portraitBuffer.toString('base64');
  const portraitAsDataURL = `data:image/png;base64,${portraitAsBase64}`;

  const portraitId = path.basename(portraitUrl).replace('_port.jpg', '');

  const responseData = {
    portraitId,
    dataURL: portraitAsDataURL,
  };

  return response.output(JSON.stringify(responseData));
}
// exports.handler = sentry.wrapHandler(handler);
exports.handler = handler;
