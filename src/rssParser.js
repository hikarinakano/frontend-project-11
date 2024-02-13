import { uniqueId } from 'lodash';

const parsePostsXml = (posts) => [...posts].map((item, index) => {
  // console.log(posts);
  const id = index + 1;
  const title = item.querySelector('title').textContent;
  const desc = item.querySelector('description').textContent;
  const link = item.querySelector('link').textContent;
  return {
    id,
    title,
    desc,
    link,
  };
});

const parseRssXml = (xml, url) => {
  const feed = xml.querySelector('channel');
  const posts = feed.querySelectorAll('item');
  const feedTitle = feed.querySelector('title').textContent;
  const feedDesc = feed.querySelector('description').textContent;
  return {
    id: uniqueId(),
    feedTitle,
    feedDesc,
    validatedUrl: url,
    posts: parsePostsXml(posts),
  };
};

export default parseRssXml;
