import _ from 'lodash';


const parsePostsXml = (posts) => [...posts].map((item) => {
  const title = item.querySelector('title').textContent;
  const desc = item.querySelector('description').textContent;
  return {
    title,
    desc,
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
    posts: parsePostsXml(posts, feedId),
  };
};

const parseFeed = (data) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(data, 'text/xml');
  if (xml.querySelector('parsererror')) {
    throw new Error('parseError');
  }
  return parseRssXml(xml);
};

export default parseFeed;
