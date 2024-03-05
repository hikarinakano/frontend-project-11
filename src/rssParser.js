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

  const rssFeed = {
    id: url,
    feedTitle,
    feedDesc,
    posts: parsePostsXml(posts),
  };
  return rssFeed;
};

export default parseRssXml;
