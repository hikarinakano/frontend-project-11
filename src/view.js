import onChange from 'on-change';
import render from './render.js';

const renderPosts = (state, postsHeader, viewButton) => {
  const { posts } = state;
  const postsDiv = document.querySelector('.posts');
  postsDiv.innerHTML = '';
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  const newDiv = document.createElement('div');
  newDiv.classList.add('card', 'border-0');

  const bodyDiv = document.createElement('div');
  bodyDiv.classList.add('card-body');

  const header = document.createElement('h2');
  header.classList.add('card-title', 'h4');
  header.innerText = postsHeader;

  bodyDiv.insertAdjacentElement('beforeend', header);

  posts.forEach(({
    url, title, postId,
  }) => {
    const li = document.createElement('li');
    li.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );
    const a = document.createElement('a');
    a.classList.add('fw-bold');
    a.setAttribute('href', url);
    a.setAttribute('data-id', postId);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = title;
    li.insertAdjacentElement('beforeend', a);

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('data-id', postId);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.textContent = viewButton;

    button.addEventListener('click', () => {
      ui.openedLinks.add(url);
      ui.id = url;
      changeVisitedLinks(ui);
      renderModal(posts, url);
    });

    li.insertAdjacentElement('beforeend', button);

    ul.insertAdjacentElement('beforeend', li);
  });

  newDiv.insertAdjacentElement('beforeend', bodyDiv);
  newDiv.insertAdjacentElement('beforeend', ul);
  postsDiv.insertAdjacentElement('beforeend', newDiv);

}

const renderFeeds = (state) => {
  
}
export default (elements, i18n, state) => {
  const { input, message, submitBtn } = elements;
const postsHandler = (state) => {
  renderPosts(state, i18n.t('posts'),i18n.t('viewButton'));
}
// somehow shows error as '';
const showErrorCode = (rssForm) => {
  console.log('err code is ', `"${rssForm.error}"`);
  return rssForm.error;
}
const handleLoading = (input, message,submitBtn) => {
  input.classList.remove('is-invalid');
  message.textContent = '';
  submitBtn.disabled = true;
}
const errorHandler = (state) => {
    const { rssForm } = state;
    message.classList.remove('text-success');
    message.classList.add('text-danger');
    input.classList.add('is-invalid');
    message.textContent = i18n.t(`errors.${rssForm.error}`);
    submitBtn.disabled = false;
}

const feedsHandler = (state) => {
  console.log(state.feeds);
}

const handleStatus = (state) => {
  
  const { rssForm } = state;
  console.log('status should be fail', rssForm.status);
  switch (rssForm.status) {
    case 'fail':
      showErrorCode(rssForm)
    case 'success':
      showErrorCode(rssForm);
      break;
    case 'loading Rss':
      handleLoading(input, message, submitBtn);
      break;
    default:
      break;
  }
}

  return onChange(state, (path, value) => {
    // check path of changed param in state, do not need to analyze it
    console.log('path is changed:', path)
    switch (path) {
      case 'rssForm.status':
        handleStatus(state)
        break;
      case 'rssForm.error': 
        errorHandler(state);
        break;
      case 'feeds':
        feedsHandler(state);
        break;
      case 'posts':
         postsHandler(state);
         break;
      case 'ui.id':
         fillModal(state);
         postsHandler(state);      
      default:
        console.log('something else happened');
        break;
    }
    // if valid
    // if not valid

    // if (value === 'fail') {
    //   invalidMessage();
    // }
    // if (value === 'loading Rss') {
    //   input.classList.remove('is-invalid');
    //   message.textContent = '';
    //   submitBtn.disabled = true;
    // }
    // if (value === 'success') {
    //   input.focus();
    //   render(state, i18n.t('posts'), i18n.t('feeds'), i18n.t('viewButton'));

    //   message.classList.add('text-success');
    //   message.classList.remove('text-danger');
    //   input.classList.remove('is-invalid');
    //   message.textContent = i18n.t('success');
    // }
    //input.value = fields.input;
  });
};
