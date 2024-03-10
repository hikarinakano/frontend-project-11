import onChange from 'on-change';
import _ from 'lodash';
import render from './render.js';

const changeVisitedLinks = (openedLinks) => {
  const headers = document.querySelectorAll('.fw-bold');
  Array.from(headers).forEach((header) => {
    const nodeHref = header.getAttribute('href');
    if (openedLinks.includes(nodeHref)) {
      header.classList.remove('fw-bold');
      header.classList.add('fw-normal');
      header.classList.add('link-secondary');
    }
  });
};

export default (elements, i18n, state) => {
  const { inputEl, message } = elements;
  const [postsTr, feedsTr, viewButton] = [i18n.t('posts'), i18n.t('feeds'), i18n.t('viewButton')];
  return onChange(state, () => {
    const {
      rssForm: { errors, fields },
      rssFeeds,
      openedLinks,
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
      console.log('Now there are no errors in state');
      inputEl.focus();
      // render of feeds and posts on success
      render(rssFeeds, [postsTr, feedsTr, viewButton]);

      message.classList.add('text-success');
      message.classList.remove('text-danger');
      inputEl.classList.remove('is-invalid');
      message.textContent = i18n.t('success');
    }
    inputEl.value = fields.url;
    changeVisitedLinks(openedLinks);
  });
};
