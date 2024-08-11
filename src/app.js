import * as yup from 'yup';
import _ from 'lodash';
import i18next from 'i18next';
import axios from 'axios';
import watch from './view.js';
import resources from './locales/index.js';
import parseFeed from './rssParser.js';
import customErrors from './locales/yupLocale.js';

const refreshTimeout = 5000;

const checkAndAddNewPosts = (newPosts, oldPosts, feedId) => {
  const uniqueNewPosts = newPosts.filter(
    (newPost) => !oldPosts.some(
      (oldPost) => oldPost.title === newPost.title || oldPost.url === newPost.url,
    ),
  );
  const relatedPosts = uniqueNewPosts.map((post) => ({
    ...post,
    feedId,
  }));
  const updatedPosts = [...relatedPosts, ...oldPosts];
  return updatedPosts;
};

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

const errorCode = (error) => {
  if (error.code === 'ERR_NETWORK') {
    return 'networkError';
  }
  if (error.message === 'parseError') {
    return error.message;
  }
  return 'unknown error';
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

    const loadRss = (url) => {
      const feedUrl = url.toString();
      const proxiedUrl = addProxy(url);
      const getRequest = axios.get(proxiedUrl, { responseType: 'json' });
      return getRequest
        .then((response) => {
          const data = response.data.contents;
          let feedId;
          const feed = parseFeed(data);
          const { feedTitle, feedDesc, posts } = feed;
          const postswithIds = posts.map((post) => ({
            ...post,
            feedId,
            postId: _.uniqueId(),
          }));
          const index = _.findIndex(state.feeds, (stateFeed) => stateFeed.url === url);
          if (index < 0) {
            feedId = state.feeds.length + 1;
            state.feeds = [...state.feeds,
              {
                feedTitle, feedDesc, url: feedUrl, id: feedId,
              }];
            state.posts = [...postswithIds, ...state.posts];
            state.rssForm.status = 'success';
            state.rssForm.fields.input = '';
          } else {
            feedId = state.feeds.find((stateFeed) => stateFeed.url === feedUrl).id;
            state.posts = checkAndAddNewPosts(postswithIds, state.posts, feedId);
          }
        })
        .catch((error) => {
          state.rssForm.status = 'fail';
          state.rssForm.error = error;
        });
    };

    const refreshFeeds = () => {
      const feedPromises = state.feeds.map(({ url }) => loadRss(url));
      return Promise.all(feedPromises);
    };

    const refresh = () => {
      refreshFeeds().then(() => {
        setTimeout(refresh, refreshTimeout);
      });
    };

    refresh();

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
            loadRss(url);
          } else {
            state.rssForm.status = 'fail';
            state.rssForm.error = errorCode(error);
          }
        });
    });
  }).catch((err) => {
    console.error('Error initializing i18next:', err);
  });
};

export default app;
