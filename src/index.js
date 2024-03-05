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

function checkAndAddNewPosts(newPosts, existingPosts) {
  const existingLinks = new Set(existingPosts.map((post) => post.id));
  newPosts.forEach((post) => {
    if (!existingLinks.has(post.id)) {
      existingPosts.unshift(post);
    }
  });
  return existingPosts;
}

// const loadRss = (url, rssFeeds) => getRequest(url)
//   .then((parsedData) => {
//     const index = _.findIndex(rssFeeds, (feed) => feed.id === url);
//     const rssFeed = parseRssXml(parsedData, url);
//     if (index < 0) {
//       state.rssFeeds = [rssFeed, ...rssFeeds];
//     } else {
//       // const existingFeed = state.rssFeeds[index];
//       // state.rssFeeds[index].posts = checkAndAddNewPosts(rssFeed.posts, existingFeed.posts);
//       state.rssFeeds = rssFeeds.map((feed, i) => {
//         if (i === index) {
//           return {
//             ...feed,
//             posts: checkAndAddNewPosts(rssFeed.posts, feed.posts),
//           };
//         }
//         return feed;
//       });
//     }
//   })
//   .catch((e) => {
//     state.rssForm.errors = { parseError: e };
//   });

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
    openedLinks: [],
  });

  const updateStateLinks = (links) => {
    links.forEach((link) => {
      const { children } = link;
      Array.from(children).forEach((child) => {
        child.addEventListener('click', (e) => {
          if (e.target.getAttribute('href') && !state.openedLinks.includes(child.href)) {
            state.openedLinks.push(child.href);
          } else if (e.target.dataset.id && !state.openedLinks.includes(e.target.dataset.id)) {
            state.openedLinks.push(e.target.dataset.id);
          }
        });
      });
    });
  };
  const loadRss = (url, rssFeeds) => getRequest(url)
    .then((parsedData) => {
      const index = _.findIndex(rssFeeds, (feed) => feed.id === url);
      const rssFeed = parseRssXml(parsedData, url);
      if (index < 0) {
        state.rssFeeds = [rssFeed, ...rssFeeds];
      } else {
        // const existingFeed = state.rssFeeds[index];
        // state.rssFeeds[index].posts = checkAndAddNewPosts(rssFeed.posts, existingFeed.posts);
        state.rssFeeds = rssFeeds.map((feed, i) => {
          if (i === index) {
            return {
              ...feed,
              posts: checkAndAddNewPosts(rssFeed.posts, feed.posts),
            };
          }
          return feed;
        });
      }
    })
    .catch((e) => {
      state.rssForm.errors = { parseError: e };
    });
  const fnc = () => {
    state.feeds.map((url) => loadRss(url, state));
    const links = document.querySelectorAll('.list-group-item');
    updateStateLinks(links);
  };

  const refresh = () => {
    setTimeout(() => {
      fnc();
      // const links = document.querySelectorAll('.list-group-item');
      // updateStateLinks(links);
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
        loadRss(currentUrl, state.rssFeeds)
          .then(() => {
            state.rssForm.errors = {};
            state.feeds = [...state.feeds, currentUrl];
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
