import onChange from 'on-change';
import _ from 'lodash';
import render from './render.js';

export default (elements, i18n, state) => {
  const { inputEl, message, submitBtn } = elements;
  const [postsTr, feedsTr, viewButton] = [i18n.t('posts'), i18n.t('feeds'), i18n.t('viewButton')];
  return onChange(state, () => {
    const {
      rssForm: { currentError, fields },
    } = state;
    submitBtn.disabled = false;
    if (currentError === 'notUrl') {
      message.classList.remove('text-success');
      message.classList.add('text-danger');
      inputEl.classList.add('is-invalid');
      message.textContent = i18n.t('errors.validation.notUrl');
    }
    if (currentError === 'duplicateUrl') {
      message.classList.remove('text-success');
      message.classList.add('text-danger');
      inputEl.classList.add('is-invalid');
      message.textContent = i18n.t('errors.validation.duplicateUrl');
    }
    if (currentError === 'networkError') {
      if (state.rssForm.status === 'loading Rss') {
        message.textContent = '';
        submitBtn.disabled = true;
        inputEl.classList.remove('is-invalid');
      }
      if (state.rssForm.status === 'not loading') {
        message.classList.remove('text-success');
        message.classList.add('text-danger');
        inputEl.classList.add('is-invalid');
        message.textContent = i18n.t('errors.networkError');
      }
      if (state.rssForm.status === 'no internet') {
        return;
      }
    }
    if (currentError === 'parseError') {
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

    if (currentError === '') {
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
    inputEl.value = fields.input;
  });
};
