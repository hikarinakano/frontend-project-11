import onChange from 'on-change';
import _ from 'lodash';
import render from './render.js';
// import { uniqueId } from 'lodash';

export default (elements, i18n, state) => {
  const { inputEl, message } = elements;
  const [postsTr, feedsTr, viewButton] = [i18n.t('posts'), i18n.t('feeds'), i18n.t('viewButton')];
  return onChange(state, () => {
    const {
      rssForm: { errors },
      rssFeeds,
    } = state;
    // console.log(Object.entries(errors).length)
    if (_.has(errors, 'url')) {
      message.classList.remove('text-success');
      message.classList.add('text-danger');
      inputEl.classList.add('is-invalid');
      message.textContent = i18n.t(errors.url.message);
    }
    if (_.has(errors, 'parseError')) {
      message.classList.remove('text-success');
      message.classList.add('text-danger');
      inputEl.classList.add('is-invalid');
      message.textContent = i18n.t('errors.noRssFound');
    }

    if (state.rssFeeds.length !== 0) {
      inputEl.focus();
      // render of feeds and posts on success
      render(rssFeeds, [postsTr, feedsTr, viewButton]);
      // message.classList.add('text-success');
      // message.classList.remove('text-danger');
      // inputEl.classList.remove('is-invalid');
      // message.textContent = i18n.t('success');
      // inputEl.value = fields.url;
      // // inputEl.value = '';
    }
  });
};
