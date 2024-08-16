import onChange from 'on-change';

const changePostToVisited = (list, post) => {
  const link = post.href;
  if (list.has(link)) {
    post.classList.remove('fw-bold');
    post.classList.add('fw-normal', 'link-secondary');
  }
};

const renderPosts = (state, postsHeader, viewButton) => {
  const { posts, ui } = state;

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
    changePostToVisited(ui.openedLinks, a);

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('data-id', postId);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.textContent = viewButton;

    li.insertAdjacentElement('beforeend', button);

    ul.insertAdjacentElement('beforeend', li);
  });

  newDiv.insertAdjacentElement('beforeend', bodyDiv);
  newDiv.insertAdjacentElement('beforeend', ul);

  postsDiv.insertAdjacentElement('beforeend', newDiv);
};

const renderFeeds = (state, feedsHeader) => {
  const { feeds } = state;

  if (feeds.length !== 0) {
    const feedsDiv = document.querySelector('.feeds');
    feedsDiv.innerHTML = '';

    const newDiv = document.createElement('div');
    newDiv.classList.add('card', 'border-0');

    const bodyDiv = document.createElement('div');
    bodyDiv.classList.add('card-body');

    const header = document.createElement('h3');
    header.classList.add('card-title', 'h4');
    header.innerText = feedsHeader;

    bodyDiv.insertAdjacentElement('beforeend', header);

    newDiv.insertAdjacentElement('beforeend', bodyDiv);

    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'border-0', 'rounded-0');
    feeds.forEach(({ feedTitle, feedDesc }) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'border-0', 'border-end-0');

      const title = document.createElement('h3');
      title.classList.add('h6', 'm0');
      title.textContent = feedTitle;

      const desc = document.createElement('p');
      desc.classList.add('m0', 'small', 'text-black-50');
      desc.textContent = feedDesc;

      li.insertAdjacentElement('beforeend', title);
      li.insertAdjacentElement('beforeend', desc);

      ul.append(li);
    });
    newDiv.insertAdjacentElement('beforeend', ul);
    feedsDiv.insertAdjacentElement('beforeend', newDiv);
  }
};

const fillModal = (state) => {
  const modalHeader = document.querySelector('.modal-header');
  const modalBody = document.querySelector('.modal-body');
  const modalLink = document.querySelector('.full-article');

  const { title, desc, url } = state.posts.find((post) => post.url === state.ui.id);

  modalHeader.textContent = title;
  modalBody.textContent = desc;
  modalLink.href = url;
};

export default (elements, i18n, state) => {
  const { input, message, submitBtn } = elements;

  const postsHandler = () => {
    renderPosts(state, i18n.t('posts'), i18n.t('viewButton'));
  };

  const showOnLoading = () => {
    input.classList.remove('is-invalid');
    message.textContent = '';
    submitBtn.disabled = true;
  };

  const errorHandler = () => {
    const { rssForm } = state;
    message.classList.remove('text-success');
    message.classList.add('text-danger');
    input.classList.add('is-invalid');
    message.textContent = i18n.t(`errors.${rssForm.error}`);
    submitBtn.disabled = false;
  };

  const feedsHandler = () => {
    renderFeeds(state, i18n.t('feeds'));
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
        break;
      case 'ui.openedLinks':
        postsHandler(state);
        break;
      default:
        break;
    }
    input.value = state.rssForm.fields.input;
  });
};
