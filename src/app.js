import * as yup from 'yup';
import _ from 'lodash';
import i18next from 'i18next';
import axios from 'axios';
import watch from './view.js';
import resources from './locales/index.js';
import parse from './rssParser.js';
import yupLocale from './locales/yupLocale.js';

const rssSchema = yup.object().shape({
  url: yup.string()
    .url('errors.validation.notUrl')
    .test('uniqie-url', 'errors.validation.duplicateUrl', function feedsExclude(value) {
      const { feeds } = this.options.context;
      return !feeds.includes(value);
    })
    .required(),
});

const elements = {
  form: document.querySelector('form'),
  inputEl: document.querySelector('input'),
  example: document.querySelector('.mt-2'),
  message: document.querySelector('.feedback'),
  submitBtn: document.querySelector('button[type="submit"]'),
};

function checkAndAddNewPosts(newPosts, posts) {
  const existingLinks = new Set(posts.map((post) => post.id));
  newPosts.forEach((post) => {
    if (!existingLinks.has(post.id)) {
      posts.unshift(post);
    }
  });
  return posts;
}

const app = async () => {
  console.log('app call', new Error().stack);
  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => {
    yupLocale();
  }).catch((err) => {
    console.log('Error initializing i18next:', err);
  });

  const state = watch(elements, i18nInstance, {
    rssForm: {
      fields: {
        url: '',
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

  const validate = () => {
    state.rssForm.errors = {};
    state.rssForm.status = 'being validated';
    return rssSchema.validate(
      state.rssForm.fields,
      { context: state, abortEarly: false },
    );
  };

  const addProxy = (originUrl) => {
    const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
    proxyUrl.searchParams.set('url', originUrl);
    proxyUrl.searchParams.set('disableCache', 'true');
    return proxyUrl.toString();
  };

  const loadRss = (url) => {
    console.log('getRequest call', new Error().stack);
    const proxiedUrl = addProxy(url);
    const getRequest = axios.get(proxiedUrl, { responseType: 'json' });
    return getRequest
      .then((response) => {
        console.log('No Error', new Error().stack);
        const data = response.data.contents;
        const rssFeed = parse(data, url);
        console.log('No Error', new Error().stack);
        const index = _.findIndex(state.rssFeeds, (feed) => feed.id === url);
        if (index < 0) {
          state.rssFeeds = [rssFeed, ...state.rssFeeds];
        } else {
          const existingFeed = state.rssFeeds[index];
          state.rssFeeds[index].posts = checkAndAddNewPosts(rssFeed.posts, existingFeed.posts);
        }
        return true;
      });
  };

  const updateError = (error) => {
    state.rssForm.status = 'not loading';
    if (error.code === 'ERR_NETWORK') {
      state.rssForm.errors = { networkError: error.message };
    } else {
      state.rssForm.errors = { parseError: error };
    }
    return false;
  };

  const fnc = () => {
    console.log('fnc call', new Error().stack);
    state.feeds.map((url) => loadRss(url).catch(updateError));
  };

  const refresh = () => {
    console.log('not Error', new Error().stack);
    setTimeout(() => {
      fnc();
      refresh();
    }, 5000);
  };

  refresh();

  elements.form.addEventListener('submit', (e) => {
    console.log('not Error', new Error().stack);
    e.preventDefault();
    const link = elements.inputEl.value;
    state.rssForm.fields.url = link;
    validate(state)
      .then(() => {
        const currentUrl = state.rssForm.fields.url;
        state.rssForm.status = 'loading Rss';
        loadRss(currentUrl)
          .catch(updateError)
          .then((success) => {
            if (!success) {
              return;
            }
            state.rssForm.errors = {};
            state.rssForm.status = 'success';
            state.feeds = [...state.feeds, currentUrl];
            state.rssForm.fields.url = '';
          });
      })
      .catch((err) => {
        console.log('Validation error', new Error().stack);
        state.rssForm.status = 'not validated';
        state.rssForm.errors = _.keyBy(err.inner, 'path');
      });
  });
};

export default app;
