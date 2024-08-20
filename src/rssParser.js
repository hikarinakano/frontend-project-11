const parsePostsXml = (posts) => [...posts].map((item) => {
  const title = item.querySelector('title').textContent;
  const description = item.querySelector('description').textContent;
  const url = item.querySelector('link').textContent;
  return {
    title,
    description,
    url,
  };
});

const parseRssXml = (xml) => {
  const feed = xml.querySelector('channel');
  const posts = feed.querySelectorAll('item');
  const feedTitle = feed.querySelector('title').textContent;
  const feedDescription = feed.querySelector('description').textContent;
  return {
    feedTitle,
    feedDescription,
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
