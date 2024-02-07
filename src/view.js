import onChange from 'on-change';
import _ from 'lodash';
// import { uniqueId } from 'lodash';

export default (elements, i18n, state) => {
  const { inputEl, message } = elements;
  return onChange(state, () => {
    const { errors, fields } = state.rssForm;
    if (_.has(errors, 'url')) {
      message.classList.remove('text-success');
      message.classList.add('text-danger');
      inputEl.classList.add('is-invalid');
      message.textContent = i18n.t(errors.url.message);
    } else {
      message.classList.add('text-success');
      message.classList.remove('text-danger');
      inputEl.classList.remove('is-invalid');

      message.textContent = i18n.t('success');
      inputEl.focus();
    }
    inputEl.value = fields.url;
  });
};
