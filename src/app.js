import * as yup from 'yup';
import _ from 'lodash';
import i18next from 'i18next';
import axios from 'axios';
import watch from './view.js';
import resources from './locales/index.js';
import parseFeed from './rssParser.js';
import customErrors from './locales/yupLocale.js';

const checkAndAddNewPosts = (newPosts, posts) => {
  const existingLinks = new Set(posts.map((post) => post.id));
  newPosts.forEach((post) => {
    if (!existingLinks.has(post.id)) {
      posts.unshift(post);
    }
  });
  return posts;
};

const app = async () => {
  const elements = {
    form: document.querySelector('form'),
    inputEl: document.querySelector('input'),
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
  }).catch((err) => {
    console.log('Error initializing i18next:', err);
  });

  const state = watch(elements, i18nInstance, {
    rssForm: {
      fields: {
        input: '',
      },
      errors: {},
      status: '',
    },
    feeds: [],
    posts: [],
    ui: {
      openedLinks: new Set(),
      id: null,
    },
  });

  const validateUrl = (url, urls) => {
    state.rssForm.errors = {};
    state.rssForm.fields.input = url;
    state.rssForm.status = 'being validated';
    const schema = yup.string()
      .url(customErrors.string.url)
      .required();
    return schema
      .notOneOf(urls, customErrors.string.test)
      .validate(url)
      .then(() => null)
      .catch((error) => {
        state.rssForm.errors = { [`${error.message.key}`]: `${error.message.key}` };
        return error;
      });
  };

  const addProxy = (originUrl) => {
    const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
    proxyUrl.searchParams.set('url', originUrl);
    proxyUrl.searchParams.set('disableCache', 'true');
    return proxyUrl.toString();
  };

  const loadRss = (url) => {
    const proxiedUrl = addProxy(url);
    const getRequest = axios.get(proxiedUrl, { responseType: 'json' });
    return getRequest
      .then((response) => {
        const data = response.data.contents;
        const feed = parseFeed(data, url);
        const index = _.findIndex(state.feeds, (feed) => feed.id === url);
        if (index < 0) {
          state.posts = [...feed.posts, ...state.posts];
          state.rssForm.status = 'success';
          state.rssForm.errors = {};
          state.feeds = [...state.feeds, feed];
          state.rssForm.fields.input = '';
        } else {
          const existingFeed = state.feeds[index];
          state.feeds[index].posts = checkAndAddNewPosts(feed.posts, existingFeed.posts);
        }
      })
      .catch((error) => {
        state.rssForm.status = 'not loading';
        if (error.message === 'Network Error') {
          if (Object.keys(state.feeds).length === 0) {
            state.rssForm.errors = { networkError: error.message };
          } else {
            console.error(`Error: ${error.message}`);
          }
        } else state.rssForm.errors = { parseError: error.message };
      });
  };
  const refreshTimeout = 5000;
  const refreshFeeds = () => {
    const feedPromises = state.feeds.map((url) => loadRss(url));
    return Promise.all(feedPromises);
  };

  const refresh = () => {
    refreshFeeds().then(() => {
      setTimeout(refresh, refreshTimeout)
    });
  };

  refresh();

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const url = data.get('url');
    validateUrl(url, state.feeds)
      .then((error) => {
        if (!error) {
          state.rssForm.errors = {};
          state.rssForm.status = 'loading Rss';
          loadRss(url);
        }
      })
  });
};

export default app;
