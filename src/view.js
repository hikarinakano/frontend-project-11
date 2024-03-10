import onChange from 'on-change';
import _ from 'lodash';
import render from './render.js';

// const changeVisitedLinks = (openedLinks) => {
//   const links = document.querySelectorAll('a[data-id].fw-bold');
//   Array.from(links).forEach((link) => {
//     const url = link.getAttribute('href');
//     if (openedLinks.has(url)) {
//       link.classList.remove('fw-bold');
//       link.classList.add('fw-normal', 'link-secondary');
//     }
//   });
// };

export default (elements, i18n, state) => {
  const { inputEl, message } = elements;
  const [postsTr, feedsTr, viewButton] = [i18n.t('posts'), i18n.t('feeds'), i18n.t('viewButton')];
  return onChange(state, () => {
    const {
      rssForm: { errors, fields },
    } = state;
    if (_.has(errors, ['url'])) {
      message.classList.remove('text-success');
      message.classList.add('text-danger');
      inputEl.classList.add('is-invalid');
      message.textContent = i18n.t(errors.url.message);
    }
    if (_.has(errors, ['networkError'])) {
      message.classList.remove('text-success');
      message.classList.add('text-danger');
      inputEl.classList.add('is-invalid');
      message.textContent = i18n.t('errors.networkError');
    }
    if (_.has(errors, ['parseError'])) {
      message.classList.remove('text-success');
      message.classList.add('text-danger');
      inputEl.classList.add('is-invalid');
      message.textContent = i18n.t('errors.noRssFound');
    }
    if (_.isEmpty(errors)) {
      inputEl.focus();
      // render of feeds and posts on success
      render(state, [postsTr, feedsTr, viewButton]);

      message.classList.add('text-success');
      message.classList.remove('text-danger');
      inputEl.classList.remove('is-invalid');
      message.textContent = i18n.t('success');
    }
    inputEl.value = fields.url;
    // changeVisitedLinks(openedLinks);
  });
};
