import onChange from 'on-change';
import _ from 'lodash';
// import { uniqueId } from 'lodash';

export default (elements, state) => {
  const { inputEl, message } = elements;
  return onChange(state, () => {
    const errorMsg = state.rssForm.errors;
    console.log('errors', errorMsg);
    if (_.has(errorMsg, 'url')) {
      inputEl.classList.add('is-invalid');
      const warning = errorMsg.url.toString().replace('ValidationError:', '');
      message.textContent = warning;
    } else {
      inputEl.classList.remove('is-invalid');
      inputEl.value = '';
      message.textContent = '';
      inputEl.focus();
    }
    // const existedFeed = state.feeds.find((feed) => feed.feedValue === link && feed.isValidated);

    // if (Object.keys(validate(link)).length === 0 && existedFeed === undefined) {
    //   state.feeds.push({ feedValue: link, isValidated: true });
    // } else if (Object.keys(validate(link)).length === 0 && existedFeed !== undefined) {
    //   state.feeds.push({ error: 'RSS already exists' });
    // } else {
    //   state.feeds.push({ feedValue: link, isValidated: false, error: 'URL must be valid' });
    // }
    // Object.keys(state.feeds).forEach((feedId) => {
    //   if (state.feeds[feedId].error) {
    //     elements.inputEl.classList.add('is-invalid');
    //     if (elements.message.classList.contains('text-sucess')) {
    //       elements.message.classList.remove('text-sucess');
    //     }
    //     elements.message.classList.add('text-danger');
    //     elements.message.textContent = state.feeds[feedId].error;
    //   } else {
    //     elements.message.classList.remove('text-danger');
    //     elements.message.classList.add('text-sucess');
    //     elements.message.textContent = 'Sucess!';
    //     elements.inputEl.classList.remove('is-invalid');
    //     elements.inputEl.value = '';
    //     elements.inputEl.focus();
    //   }
    // });
  });
};
