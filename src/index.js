import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import _ from 'lodash';
import i18next from 'i18next';
import axios from 'axios';
import watch from './view.js';
import resources from './locales/index.js';
import parse from './parser.js';
import parseRssXml from './rssParser.js';

yup.setLocale({
  mixed: {
    default: 'Must not happen',
    required: ({ path }) => ({ key: 'networkError', values: { path } }),
  },
  string: {
    url: ({ path }) => ({ key: 'notUrl', values: { path } }),
    test: ({ path }) => ({ key: 'duplicateUrl', values: { path } }),
  },
});

// const rssAdressExample = "https://ru.hexlet.io/lessons.rss";
// const rssAdressExample = 'http://example.com';
const rssSchema = yup.object().shape({
  url: yup.string()
    .url('errors.validation.notUrl')
    .test('uniqie-url', 'errors.validation.duplicateUrl', function feedsExclude(value) {
      const { feeds } = this.options.context;
      return !feeds.includes(value);
    })
    .required(),
});

const validate = (state) => rssSchema.validate(
  state.rssForm.fields,
  { context: state, abortEarly: false },
);

const elements = {
  form: document.querySelector('form'),
  inputEl: document.querySelector('input'),
  example: document.querySelector('.mt-2'),
  message: document.querySelector('.feedback'),
};

const getRequest = (url) => axios.get(
  `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`,
)
  .then((response) => {
    const data = response.data.contents;
    return parse(data);
  })
  .catch((err) => {
    console.error('Error occured', err.message);
  });

const loadRss = (url, state) => getRequest(url)
  .then((parsedData) => {
    const index = _.findIndex(state.rssFeeds, (feed) => feed.url === url);
    const rssFeed = parseRssXml(parsedData, url);
    if (index < 0) {
      state.rssFeeds.unshift(rssFeed);
    } else {
      _.set(state.rssFeeds, `[${index}]`, rssFeed);
    }
  });

const app = async () => {
  const i18nInstance = i18next.createInstance();
  await i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  const state = watch(elements, i18nInstance, {
    rssForm: {
      fields: {
        url: '',
      },
      errors: {},
    },
    feeds: [],
    rssFeeds: [],
  });

  const fnc = () => {
    state.feeds.map((url) => loadRss(url, state));
  };

  const refresh = () => {
    setTimeout(() => {
      fnc();
      refresh();
    }, 5000);
  };

  refresh();

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const link = elements.inputEl.value;
    state.rssForm.fields.url = link;
    validate(state)
      .then(() => {
        const currentUrl = state.rssForm.fields.url;
        state.feeds = [...state.feeds, currentUrl];
        loadRss(currentUrl, state)
          .then(() => {
            state.rssForm.errors = {};
            state.rssForm.fields.url = '';
          })
          .catch((parseError) => {
            state.rssForm.errors = { parseError };
          });
      })
      .catch((err) => {
        state.rssForm.errors = _.keyBy(err.inner, 'path');
      });
  });
};
// add a check on all rss feeds if there are updates on feeds.
app();
