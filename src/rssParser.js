const parsePostsXml = (posts) => [...posts].map((item) => {
  const title = item.querySelector('title').textContent;
  const desc = item.querySelector('description').textContent;
  const link = item.querySelector('link').textContent;
  return {
    title,
    desc,
    id: link,
  };
});

const parseRssXml = (xml, url) => {
  const feed = xml.querySelector('channel');
  const posts = feed.querySelectorAll('item');
  const feedTitle = feed.querySelector('title').textContent;
  const feedDesc = feed.querySelector('description').textContent;

  return {
    id: url,
    feedTitle,
    feedDesc,
    posts: parsePostsXml(posts),
  };
};

const parseFeed = (data, url) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(data, 'text/xml');
  if (xml.getElementsByTagName('parsererror').length === 1) {
    throw new Error ('parseError');
  }
  else return parseRssXml(xml, url);
};

export default parseFeed;
