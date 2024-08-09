const modalEl = {
  header: document.querySelector('.modal-header'),
  body: document.querySelector('.modal-body'),
  openLinkButton: document.querySelector('.full-article'),
};

const renderModal = (posts, uiId) => {
  const { title, desc, url } = posts.find((post) => post.url === uiId);
  modalEl.header.textContent = title;
  modalEl.body.textContent = desc;
  modalEl.openLinkButton.href = url;
};

const changeVisitedLinks = ({ id }) => {
  const links = document.querySelectorAll('a[data-id].fw-bold');
  Array.from(links).forEach((link) => {
    if (link.href === id) {
      link.classList.remove('fw-bold');
      link.classList.add('fw-normal', 'link-secondary');
    }
  });
};

const createPosts = (ui, posts, postsHeader, viewButton, ul) => {
  const postsDiv = document.querySelector('.posts');
  postsDiv.innerHTML = '';

  const newDiv = document.createElement('div');
  newDiv.classList.add('card', 'border-0');

  const bodyDiv = document.createElement('div');
  bodyDiv.classList.add('card-body');

  const header = document.createElement('h2');
  header.classList.add('card-title', 'h4');
  header.innerText = postsHeader;

  bodyDiv.insertAdjacentElement('beforeend', header);

  posts.forEach(({
    url, title, id,
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
// write check for visited links when creating a post
  
    const a = document.createElement('a');
    a.classList.add('fw-bold');
    a.setAttribute('href', url);
    a.setAttribute('data-id', id);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = title;
    ui.openedLinks.forEach((link) => {
      if (link === url) {
          a.classList.remove('fw-bold');
          a.classList.add('fw-normal', 'link-secondary');
        }
    })
    a.addEventListener('click', () => {
      ui.openedLinks.add(url);
      ui.id = url;
      changeVisitedLinks(ui);
    });

    li.insertAdjacentElement('beforeend', a);

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('data-id', id);
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
};

export default function render({feeds, posts, ui}, [postsHeader, feedsHeader, viewButton]) {
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
    const postsUl = document.createElement('ul');
    postsUl.classList.add('list-group', 'border-0', 'rounded-0');
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

      createPosts(ui, posts, postsHeader, viewButton, postsUl);
    });
    newDiv.insertAdjacentElement('beforeend', ul);
    feedsDiv.insertAdjacentElement('beforeend', newDiv);
  }
}
