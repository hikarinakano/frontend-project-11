import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import _ from 'lodash';
import i18next from 'i18next';
import axios from 'axios';
import watch from './view.js';
import resources from './locales/index.js';
import parse from './rssParser.js';

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

// const getRequest = (url) => axios.get(
//   `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`,
// )
//   .then((response) => {
//     const data = response.data.contents;
//     return parse(data);
//   })
//   .catch((err) => {
//     state.rssForm.errors = { networkError: err.message }
//     console.error('Error occured', err.message);
//   });

function checkAndAddNewPosts(newPosts, posts) {
  const existingLinks = new Set(posts.map((post) => post.id));
  newPosts.forEach((post) => {
    if (!existingLinks.has(post.id)) {
      posts.unshift(post);
    }
  });
  return posts;
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
  console.log('app call', new Error().stack);
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
    console.log('UpdateStateLinks call', new Error().stack);
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

  const loadRss = (url) => {
    console.log('getRequest call', new Error().stack);
    return axios.get(
      `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`,
    )
      .then((response) => {
        console.log('No Error', new Error().stack);
        const data = response.data.contents;
        return parse(data, url);
      })
      .then((rssFeed) => {
        console.log('No Error', new Error().stack);
        const index = _.findIndex(state.rssFeeds, (feed) => feed.id === url);
        if (index < 0) {
          state.rssFeeds = [rssFeed, ...state.rssFeeds];
        } else {
          const existingFeed = state.rssFeeds[index];
          state.rssFeeds[index].posts = checkAndAddNewPosts(rssFeed.posts, existingFeed.posts);
          // state.rssFeeds = rssFeeds.map((feed, i) => {
          //   if (i === index) {
          //     return {
          //       ...feed,
          //       posts: checkAndAddNewPosts(rssFeed.posts, feed.posts),
          //     };
          //   }
          //   return feed;
          // });
        }
      });
  };

  const fnc = () => {
    console.log('fnc call', new Error().stack);
    state.feeds.map((url) => loadRss(url));
    const links = document.querySelectorAll('.list-group-item');
    updateStateLinks(links);
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
        console.log('not Error', new Error().stack);
        const currentUrl = state.rssForm.fields.url;
        loadRss(currentUrl)
          .then(() => {
            state.rssForm.errors = {};
            state.feeds = [...state.feeds, currentUrl];
            state.rssForm.fields.url = '';
          })
          .catch((error) => {
            console.log(error);
            if (error.code === 'ERR_NETWORK') {
              state.rssForm.errors = { networkError: error.message };
            } else {
              state.rssForm.errors = { parseError: error };
            }
            console.log('No Error', new Error().stack);
          });
      })
      .catch((err) => {
        console.log('Now error is parseError', new Error().stack);
        state.rssForm.errors = _.keyBy(err.inner, 'path');
      });
  });
};
// add a check on all rss feeds if there are updates on feeds.
app();
