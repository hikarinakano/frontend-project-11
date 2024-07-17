import * as yup from 'yup';
import _ from 'lodash';
import i18next from 'i18next';
import axios from 'axios';
import watch from './view.js';
import resources from './locales/index.js';
import parse from './rssParser.js';
import customErrors from './locales/yupLocale.js';

// const rssSchema = yup.object().shape({
//   url: yup.string()
//     .url('errors.validation.notUrl')
//     .test('uniqie-url', 'errors.validation.duplicateUrl', function feedsExclude(value) {
//       const { feeds } = this.options.context;
//       return !feeds.includes(value);
//     })
//     .required(),
// });

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
    example: document.querySelector('.mt-2'),
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
    rssFeeds: [],
    ui: {
      openedLinks: new Set(),
      id: null,
    },
  });

  // const validate = () => {
  //   state.rssForm.errors = {};
  //   state.rssForm.status = 'being validated';
  //   return rssSchema.validate(
  //     state.rssForm.fields,
  //     { context: state, abortEarly: false },
  //   );
  // };
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
        let errMsg;
        if (error.message.key === 'notUrl') {
          errMsg = 'Link should be valid URL';
        } else if (error.message.key === 'duplicateUrl') {
          errMsg = 'The URL exists already';
        }
        state.rssForm.errors = { [`${error.message.key}`]: errMsg };
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
        const rssFeed = parse(data, url);
        const index = _.findIndex(state.rssFeeds, (feed) => feed.id === url);
        if (index < 0) {
          state.rssFeeds = [rssFeed, ...state.rssFeeds];
          state.rssForm.status = 'success';
          state.rssForm.errors = {};
          state.feeds = [...state.feeds, url];
          state.rssForm.fields.input = '';
        } else {
          const existingFeed = state.rssFeeds[index];
          state.rssFeeds[index].posts = checkAndAddNewPosts(rssFeed.posts, existingFeed.posts);
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

  const refreshFeeds = () => {
    const feedPromises = state.feeds.map((url) => loadRss(url));
    Promise.all(feedPromises);
  };

  const refresh = () => {
    setTimeout(() => {
      refreshFeeds();
      refresh();
    }, 5000);
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
      .catch((err) => {
        state.rssForm.status = 'not validated';
        state.rssForm.errors = _.keyBy(err.inner, 'path');
      });
  });
};

export default app;
