const parsePostsXml = (posts) => [...posts].map((item) => {
  const title = item.querySelector('title').textContent;
  const desc = item.querySelector('description').textContent;
  const url = item.querySelector('link').textContent;
  return {
    title,
    desc,
    url,
  };
});

const parseRssXml = (xml) => {
  const feed = xml.querySelector('channel');
  const posts = feed.querySelectorAll('item');
  const feedTitle = feed.querySelector('title').textContent;
  const feedDesc = feed.querySelector('description').textContent;
  return {
    feedTitle,
    feedDesc,
    posts: parsePostsXml(posts),
  };
};

const parseFeed = (data) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(data, 'text/xml');
  if (xml.querySelector('parsererror')) {
    const error = new Error('parseError');
    error.isParseError = true;
    throw error;
  }
  return parseRssXml(xml);
};

export default parseFeed;
