import axios from "axios";
import retry from "retry";

export function make_request(url) {
  const fetch = retry.operation({
    retries: 5,
    factor: 1,
    minTimeout: 1 * 1000,
    maxTimeout: 10 * 1000,
  });

  return new Promise((resolve, reject) => {
    fetch.attempt(async (currentAttempt) => {
      try {
        const resp = await axios.get(url);
        resolve(resp);
      } catch (err) {
        if (!fetch.retry(err)) {
          reject(err);
        }
      }
    });
  });
}

export async function fetch(url) {
  const galleryRegEx = new RegExp("reddit.com/gallery/.+");
  const commentRegEx = new RegExp("/r/.+/comments/.+/");

  let data = null;

  const extractContent = (resp) => resp.data[0].data.children[0].data;

  if (galleryRegEx.test(url)) {
    const code = url.split("/").slice(-1)[0];
    data = await make_request(`https://www.reddit.com/${code}.json`).then(
      extractContent
    );
  } else if (commentRegEx.test(url)) {
    data = await make_request(`${url}.json`).then(extractContent);
  } else {
    return [];
  }

  const { gallery_data, media_metadata } = data;

  const image_urls = Object.entries(media_metadata).map((e) => {
    const [k, v] = e;
    const img = v.p.slice(-1)[0].u.replace(/&amp;/g, "&");
    return [k, img];
  });
  const image_map = Object.fromEntries(image_urls);

  return gallery_data.items.map(({ media_id }) => image_map[media_id]);
}
