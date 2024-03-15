import onChange from 'on-change';
import _ from 'lodash';
import render from './render.js';

export default (elements, i18n, state) => {
  const { inputEl, message, submitBtn } = elements;
  const [postsTr, feedsTr, viewButton] = [i18n.t('posts'), i18n.t('feeds'), i18n.t('viewButton')];
  return onChange(state, () => {
    const {
      rssForm: { errors, fields },
    } = state;
    console.error('errors', state.rssForm.errors);
    console.log('status', state.rssForm.status);
    submitBtn.disabled = false;
    if (_.has(errors, ['url'])) {
      message.classList.remove('text-success');
      message.classList.add('text-danger');
      inputEl.classList.add('is-invalid');
      message.textContent = i18n.t(errors.url.message);
    }
    if (_.has(errors, ['networkError'])) {
      if (state.rssForm.status === 'loading Rss') {
        message.innerHtml = '';
        submitBtn.disabled = true;
        inputEl.classList.remove('is-invalid');
      }
      if (state.rssForm.status === 'not loading') {
        message.classList.remove('text-success');
        message.classList.add('text-danger');
        inputEl.classList.add('is-invalid');
        message.textContent = i18n.t('errors.networkError');
      }
    }

    if (_.has(errors, ['parseError'])) {
      if (state.rssForm.status === 'loading Rss') {
        inputEl.classList.remove('is-invalid');
        message.textContent = '';
        submitBtn.disabled = true;
      }
      if (state.rssForm.status === 'not loading') {
        message.classList.remove('text-success');
        message.classList.add('text-danger');
        inputEl.classList.add('is-invalid');
        message.textContent = i18n.t('errors.noRssFound');
      }
    }

    if (_.isEmpty(errors)) {
      if (state.rssForm.status === 'loading Rss') {
        inputEl.classList.remove('is-invalid');
        message.textContent = '';
        submitBtn.disabled = true;
      }
      if (state.rssForm.status === 'success') {
        inputEl.focus();
        render(state, [postsTr, feedsTr, viewButton]);

        message.classList.add('text-success');
        message.classList.remove('text-danger');
        inputEl.classList.remove('is-invalid');
        message.textContent = i18n.t('success');
      }
    }
    inputEl.value = fields.url;
  });
};
