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

// function keyBy(array, key) {
//   return array.reduce((result, item) => {
//     const res = { ...result };
//     res[item[key]] = item;
//     return res;
//   }, {});
// }

const validate = (fields, { context, abortEarly }) => {
  try {
    rssSchema.validateSync(fields, { context, abortEarly });
    return {};
  } catch (e) {
    console.log(e.inner);
    return _.keyBy(e.inner, 'path');
  }
};

// const validate = (fields, { context, abortEarly }) => {
//   return new Promise((resolve, reject) => {
//     rssSchema.validate(fields, { context, abortEarly })
//     .then(valid => resolve())
//     .catch(err => {
//       reject(keyBy(err.inner, 'path'))
//     })
//   })
// }

const app = () => {
  const elements = {
    container: document.querySelector('.container-fluid'),
    form: document.querySelector('form'),
    inputEl: document.querySelector('input'),
    example: document.querySelector('.mt-2'),
    message: document.querySelector('.feedback'),
  };
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
    state.rssForm.errors = validate(
      state.rssForm.fields,
      { context: { feeds: state.feeds }, abortEarly: false },
    );
    // .then(() => {
    //   console.log('Validation succeeded')
    // })
    // .catch(errors => {
    //   console.log('Validation failed with errors:', errors.url)
    //   return errors.url;
    // })
    if (!_.has(state.rssForm.errors, 'url')) {
      state.feeds.push(state.rssForm.fields.url);
    }
  });
};

app();
