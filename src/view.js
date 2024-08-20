import onChange from 'on-change';

const renderPost = (postUl, i18n, post, ui) => {
  const { postId, url, title } = post;
  const li = document.createElement('li');
  const liClassList = ['list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0'];
  li.classList.add(...liClassList);
  const a = document.createElement('a');
  const attributes = {
    href: url,
    'data-id': postId,
    target: '_blank',
    rel: 'noopener noreferrer',
    classList: 'fw-bold',
  };
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'classList') {
      if (ui.openedLinks.has(postId)) {
        a.classList.remove('fw-bold');
        a.classList.add('fw-normal', 'link-secondary');
      }
      a.classList.add('fw-bold');
    }
    a.setAttribute(key, value);
  });
  a.textContent = title;
  li.insertAdjacentElement('beforeend', a);
  const button = document.createElement('button');
  const buttonAttributes = {
    type: 'button',
    'data-id': postId,
    'data-bs-toggle': 'modal',
    'data-bs-target': '#modal',
    classList: ['btn', 'btn-outline-primary', 'btn-sm'],
  };
  Object.entries(buttonAttributes).forEach(([key, value]) => {
    if (key === 'classList') {
      button.classList.add(...value);
    }
    button.setAttribute(key, value);
  });
  button.textContent = i18n.t('viewButton');
  li.insertAdjacentElement('beforeend', button);
  postUl.insertAdjacentElement('beforeend', li);
};

const handlePosts = (state, postsContainer, i18n) => {
  const { posts, ui } = state;
  postsContainer.innerHTML = '';
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  const cardDiv = document.createElement('div');
  cardDiv.classList.add('card', 'border-0');

  const bodyDiv = document.createElement('div');
  bodyDiv.classList.add('card-body');

  const header = document.createElement('h2');
  header.classList.add('card-title', 'h4');
  header.innerText = i18n.t('posts');

  bodyDiv.insertAdjacentElement('beforeend', header);
  posts.forEach((post) => renderPost(ul, i18n, post, ui));

  cardDiv.insertAdjacentElement('beforeend', bodyDiv);
  cardDiv.insertAdjacentElement('beforeend', ul);

  postsContainer.insertAdjacentElement('beforeend', cardDiv);
};

const renderFeed = (ul, feed) => {
  const { feedTitle, feedDescription } = feed;
  const li = document.createElement('li');
  li.classList.add('list-group-item', 'border-0', 'border-end-0');

  const title = document.createElement('h3');
  title.classList.add('h6', 'm0');
  title.textContent = feedTitle;

  const description = document.createElement('p');
  description.classList.add('m0', 'small', 'text-black-50');
  description.textContent = feedDescription;

  li.insertAdjacentElement('beforeend', title);
  li.insertAdjacentElement('beforeend', description);

  ul.append(li);
};

const handleFeeds = (state, feedsContainer, i18n) => {
  const { feeds } = state;

  if (feeds.length !== 0) {
    feedsContainer.innerHTML = '';

    const container = document.createElement('div');
    container.classList.add('card', 'border-0');

    const bodyDiv = document.createElement('div');
    bodyDiv.classList.add('card-body');

    const header = document.createElement('h3');
    header.classList.add('card-title', 'h4');
    header.innerText = i18n.t('feeds');

    bodyDiv.insertAdjacentElement('beforeend', header);

    container.insertAdjacentElement('beforeend', bodyDiv);

    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'border-0', 'rounded-0');
    feeds.forEach((feed) => renderFeed(ul, feed));
    container.insertAdjacentElement('beforeend', ul);
    feedsContainer.insertAdjacentElement('beforeend', container);
  }
};

const fillModal = (state) => {
  const modalHeader = document.querySelector('.modal-header');
  const modalBody = document.querySelector('.modal-body');
  const modalLink = document.querySelector('.full-article');
  const { title, description, url } = state.posts.find((post) => post.postId === state.ui.id);
  modalHeader.textContent = title;
  modalBody.textContent = description;
  modalLink.href = url;
};

export default (elements, i18n, state) => {
  const
    {
      input,
      message,
      submitBtn,
      postsContainer,
      feedsContainer,
    } = elements;

  const showOnLoading = () => {
    input.classList.remove('is-invalid');
    message.textContent = '';
    submitBtn.disabled = true;
  };

  const handleError = () => {
    const { rssForm } = state;
    message.classList.remove('text-success');
    message.classList.add('text-danger');
    input.classList.add('is-invalid');
    message.textContent = i18n.t(`errors.${rssForm.error}`);
    submitBtn.disabled = false;
  };

  const showOnSuccess = () => {
    input.focus();
    submitBtn.disabled = false;
    message.classList.add('text-success');
    message.classList.remove('text-danger');
    input.classList.remove('is-invalid');
    message.textContent = i18n.t('success');
  };

  const handleStatus = () => {
    const { rssForm } = state;
    switch (rssForm.status) {
      case 'fail':
        break;
      case 'success':
        showOnSuccess();
        break;
      case 'loading Rss':
        showOnLoading();
        break;
      default:
        break;
    }
  };

  return onChange(state, (path) => {
    switch (path) {
      case 'rssForm.status':
        handleStatus(state);
        break;
      case 'rssForm.error':
        handleError(state);
        break;
      case 'feeds':
        handleFeeds(state, feedsContainer, i18n);
        break;
      case 'posts':
        handlePosts(state, postsContainer, i18n);
        break;
      case 'ui.id':
        fillModal(state);
        handlePosts(state, postsContainer, i18n);
        break;
      case 'ui.openedLinks':
        handlePosts(state, postsContainer, i18n);
        break;
      default:
        break;
    }
    input.value = state.rssForm.fields.input;
  });
};
