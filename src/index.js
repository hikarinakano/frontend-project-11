import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import keyBy from 'lodash';
import has from 'lodash/has.js';
import isEmpty from 'lodash/isEmpty.js';
import onChange from 'on-change';

// const rssAdressExample = "https://ru.hexlet.io/lessons.rss";
const rssAdressExample = 'http://example.com';
const rssSchema = yup.string().url('URL must be valid').required()

const errorMessages = {
  network: {
    error: 'Network problems.Try again.',
  }
};
const validate = (schema) => {
  try {
    rssSchema.validateSync(schema, {abortEarly: false});
    return {};
  } catch(e) {
    return keyBy(e.inner,'path');
  }
};


// const render = (elements, initialState) => (path, value, prevValue) => {
//   console.log('path',path)
//   console.log('value', value)
//   console.log('prevValue', prevValue);
//   console.log('elems', elements);
//   console.log('initialState', initialState);


// // there is an example field already, but it doesn't simply show
// // there is feedback field that should be added with text content
// // i need to validate rss from URL(rss usually of xml format, so i
// // think i need to parse and check if it's valid or if content contains xml)?
// // what should else be in state?
// };

const app = () => {
  const state = {
    feeds: [],
  }
  const elements = {
    container: document.querySelector('.container-fluid'),
    form: document.querySelector('form'),
    inputEl: document.querySelector('input'),
    example: document.querySelector('.mt-2'),
    message: document.querySelector('.feedback'),
  }
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const link = elements.inputEl.value;
    const existedFeed  = state.feeds.find((feed) => feed.feedValue === link && feed.isValidated);
    console.log(existedFeed)
    
    if (Object.keys(validate(link)).length === 0 && existedFeed === undefined) {
      state.feeds.push({feedValue: link, isValidated: true});
    }else if(Object.keys(validate(link)).length === 0 && existedFeed !== undefined) {
      state.feeds.push({error: 'RSS already exists'});
    }
    else {
      state.feeds.push({feedValue: link, isValidated: false, error:'The URL must be valid'});
    }
    Object.keys(state.feeds).forEach(feedId => {
      
      if (state.feeds[feedId].error) {
        elements.inputEl.classList.add('is-invalid');
        if (elements.message.classList.contains('text-sucess')) {
          elements.message.classList.remove('text-sucess');
        }
        elements.message.classList.add('text-danger');
        elements.message.textContent = state.feeds[feedId].error;
      } else {
        elements.message.classList.remove('text-danger');
        elements.message.classList.add('text-sucess');
        elements.message.textContent = 'Sucess!';
        elements.inputEl.classList.remove('is-invalid');
        elements.inputEl.value = '';
        elements.inputEl.focus();
      }

    })
  })

};

app();
