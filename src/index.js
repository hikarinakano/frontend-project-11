import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import _ from 'lodash';
import watch from './view.js';

// const rssAdressExample = "https://ru.hexlet.io/lessons.rss";
// const rssAdressExample = 'http://example.com';

const rssSchema = yup.object().shape({
  url: yup.string()
    .url('URL must be valid')
    .test('uniqie-url', 'This URL has already been added', function feedsExclude(value) {
      const { feeds } = this.options.context;
      return !feeds.includes(value);
    })
    .required(),
});

// const validate = (fields, { context, abortEarly }) => {
//   try {
//     rssSchema.validateSync(fields, { context, abortEarly });
//     return {};
//   } catch (e) {
//     console.log(e.inner);
//     return _.keyBy(e.inner, 'path');
//   }
// };

const validate = (state) => rssSchema.validate(
  state.rssForm.fields,
  { context: state, abortEarly: false },
);

const elements = {
  container: document.querySelector('.container-fluid'),
  form: document.querySelector('form'),
  inputEl: document.querySelector('input'),
  example: document.querySelector('.mt-2'),
  message: document.querySelector('.feedback'),
};

const app = () => {
  const state = watch(elements, {
    rssForm: {
      fields: {
        url: '',
      },
      errors: {},
    },
    feeds: [],
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const link = elements.inputEl.value;
    state.rssForm.fields.url = link;
    validate(state)
      .then(() => {
        state.rssForm.errors = {};
        state.feeds.push(state.rssForm.fields.url);
      })
      .catch((err) => {
        state.rssForm.errors = _.keyBy(err.inner, 'path');
      });
  });
};

app();
