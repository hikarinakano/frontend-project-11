import * as yup from 'yup';
import _ from 'lodash';
import i18next from 'i18next';
import axios from 'axios';
import watch from './view.js';
import resources from './locales/index.js';
import parseFeed from './rssParser.js';
import customErrors from './locales/yupLocale.js';

const refreshTimeout = 5000;

const checkAndAddNewPosts = (newPosts, posts) => {
  const existingLinks = new Set(posts.map((post) => post.id));
  newPosts.forEach((post) => {
    if (!existingLinks.has(post.id)) {
      posts.unshift(post);
    }
  });
  return posts;
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

const app = () => {
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

    const state = watch(elements, i18nInstance, {
      rssForm: {
        fields: {
          input: '',
        },
        currentError: '',
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
      const proxiedUrl = addProxy(url);
      const getRequest = axios.get(proxiedUrl, { responseType: 'json' });
      return getRequest
        .then((response) => {
          const data = response.data.contents;
          const feed = parseFeed(data, url);
          const index = _.findIndex(state.feeds, (stateFeed) => stateFeed.id === url);
          if (index < 0) {
            state.posts = [...feed.posts, ...state.posts];
            state.feeds = [...state.feeds, feed];
            state.rssForm.status = 'success';
            state.rssForm.fields.input = '';
          } else {
            const existingFeed = state.feeds[index];
            state.feeds[index].posts = checkAndAddNewPosts(feed.posts, existingFeed.posts);
          }
        })
        .catch((error) => {
          state.rssForm.status = 'not loading';
          if (error.code === 'ERR_NETWORK') {
            errorCode = 'networkError';
          } else errorCode = error.message;
          state.rssForm.currentError = errorCode;
        });
    };

    const refreshFeeds = () => {
      const feedPromises = state.feeds.map(({ id }) => loadRss(id));
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
      state.rssForm.status = 'being validated';
      state.rssForm.fields.input = url;
      const urls = _.map(state.feeds, (feed) => feed.id);
      validateUrl(url, urls)
        .then((error) => {
          if (!error) {
            state.rssForm.currentError = '';
            state.rssForm.status = 'loading Rss';
            loadRss(url);
          } else {
            state.rssForm.currentError = error;
          }
        });
    });
  }).catch((err) => {
    console.error('Error initializing i18next:', err);
  });
};

export default app;
