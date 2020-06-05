const secrets = require('./lib/secrets.js');
const responseHelper = require('callirhoe/lib/responseHelper');
const sentry = require('callirhoe/lib/sentry');
const got = require('golgoth/lib/got');
const FormData = require('form-data');
sentry.init(secrets.SENTRY_DSN);

/**
 * Take a portraitId from portraitai.com and return a variant as base64
 * @param {object} rawRequest Request object
 * @returns {object} Response object
 */
async function handler(rawRequest) {
  const response = new responseHelper();

  const { portraitId } = JSON.parse(rawRequest.body);

  // Simulating a form to upload
  const form = new FormData();
  form.append('id', '11111-SHb6');
  form.append('wm', '3');
  form.append('code', `${portraitId}-_port`);

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

  // Get the portrait as base64
  const portraitBuffer = await got(portraitUrl).buffer();
  const portraitAsBase64 = portraitBuffer.toString('base64');
  const portraitAsDataURL = `data:image/png;base64,${portraitAsBase64}`;

  const responseData = {
    dataURL: portraitAsDataURL,
  };

  return response.output(JSON.stringify(responseData));
}
// exports.handler = sentry.wrapHandler(handler);
exports.handler = handler;
