import * as yup from 'yup';
import _ from 'lodash';
import i18next from 'i18next';
import axios from 'axios';
import watch from './view.js';
import resources from './locales/index.js';
import parseFeed from './rssParser.js';
import customErrors from './locales/yupLocale.js';

const refreshTimeout = 5000;

const validateUrl = (url, urls) => {
  const schema = yup.string()
    .url(customErrors.string.url)
    .required();
  return schema
    .notOneOf(urls, customErrors.string.test)
    .validate(url)
    .then(() => null)
    .catch((error) => error.message.key);
};

const addProxy = (originUrl) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxyUrl.searchParams.set('url', originUrl);
  proxyUrl.searchParams.set('disableCache', 'true');
  return proxyUrl.toString();
};

const getErrorCode = (error) => {
  if (error.isAxiosError) {
    return 'networkError';
  }
  if (error.isParseError) {
    return 'parseError';
  }
  return 'unknown';
};

const getParsedData = (url) => {
  const proxiedUrl = addProxy(url);
  const getRequest = axios.get(proxiedUrl, { responseType: 'json' });
  return getRequest
    .then((response) => {
      const data = response.data.contents;
      const feed = parseFeed(data);
      return feed;
    });
};
const loadRss = (url, state) => {
  const feedUrl = url.toString();
  return getParsedData(url).then((feed) => {
    const { feedTitle, feedDesc, posts } = feed;
    const feedId = _.uniqueId('feed_');
    const postswithIds = posts.map((post) => ({
      ...post,
      feedId,
      postId: _.uniqueId('post_'),
    }));
    state.feeds = [...state.feeds,
      {
        feedTitle,
        feedDesc,
        feedId,
        feedUrl,
      },
    ];
    state.posts = [...postswithIds, ...state.posts];
    state.rssForm.status = 'success';
    state.rssForm.fields.input = '';
  })
    .catch((error) => {
      state.rssForm.status = 'fail';
      state.rssForm.error = getErrorCode(error);
    });
};
const updatePosts = (feedUrl, feedId, state) => {
  const oldPosts = state.posts;
  return getParsedData(feedUrl)
    .then((feed) => {
      const { posts } = feed;
      const oldPostsTitles = oldPosts.map((post) => post.title);
      const newPosts = posts.filter((post) => !oldPostsTitles.includes(post.title));
      const newUpdatedPosts = newPosts.map((post) => (
        {
          ...post,
          feedId,
          postId: _.uniqueId('post_'),
        }
      ));
      state.posts = [...newUpdatedPosts, ...oldPosts];
    });
};

const refreshFeeds = (state) => {
  const { feeds } = state;
  Promise.all(feeds.map(({ feedUrl, feedId }) => updatePosts(feedUrl, feedId, state)))
    .then(() => setTimeout(() => refreshFeeds(state), refreshTimeout));
};

const app = () => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    example: document.querySelector('.example'),
    message: document.querySelector('.feedback'),
    submitBtn: document.querySelector('button[type="submit"]'),
  };

  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => {
    yup.setLocale(customErrors);

    const state = watch(elements, i18nInstance, {
      rssForm: {
        fields: {
          input: '',
        },
        error: '',
        status: '',
      },
      feeds: [],
      posts: [],
      ui: {
        openedLinks: new Set(),
        id: null,
      },
    });
    refreshFeeds(state);
    // post event listener on click
    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(e.target);
      const url = data.get('url');
      state.rssForm.fields.input = url;
      const urls = _.map(state.feeds, (feed) => feed.url);
      validateUrl(url, urls)
        .then((error) => {
          if (!error) {
            state.rssForm.error = '';
            state.rssForm.status = 'loading Rss';
            loadRss(url, state);
          } else {
            state.rssForm.status = 'fail';
            state.rssForm.error = getErrorCode(error);
          }
        });
    });
  }).catch((err) => {
    console.error('Error initializing i18next:', err);
  });
};

export default app;
