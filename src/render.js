// example feeds : https://lorem-rss.hexlet.app/feed?length=42
// another is  https://ru.hexlet.io/lessons.rss

const modalEl = {
  header: document.querySelector('.modal-header'),
  body: document.querySelector('.modal-body'),
  openLinkButton: document.querySelector('.full-article'),
};

const modalLogic = (button, { title, desc, id }) => {
  button.addEventListener('click', () => {
    modalEl.header.textContent = title;
    modalEl.body.textContent = desc;
    modalEl.openLinkButton.href = id;
  });
};

const changeVisitedLinks = (openedLinks) => {
  const links = document.querySelectorAll('a[data-id].fw-bold');
  Array.from(links).forEach((link) => {
    const url = link.getAttribute('href');
    if (openedLinks.has(url)) {
      // console.log('the if with openedLinks.has(url) worked out!')
      link.classList.remove('fw-bold');
      link.classList.add('fw-normal', 'link-secondary');
    }
  });
};

const createPosts = (state, postsList, postsHeader, viewButton, ul) => {
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
  // ul is one main for all, as for header and till newDiv
  // const ul = document.createElement('ul');
  // ul.classList.add('list-group', 'border-0', 'rounded-0');
  // maybe i need to have status in state?
  postsList.forEach(({
    id, title, desc,
  }) => {
    // post = {id, title, desc, link}
    // desc goes to modal, as well as title
    const li = document.createElement('li');
    li.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );
    // const modalHeader = document.querySelector('.modal-header');
    // const modalContent = document.querySelector('.modal-body');
    // modalHeader.textContent = title;
    // modalContent.textContent = desc;
    const a = document.createElement('a');
    a.classList.add('fw-bold');
    a.setAttribute('href', id);
    a.setAttribute('data-id', id);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = title;
    a.addEventListener('click', () => {
      state.openedLinks.add(id);
      changeVisitedLinks(state.openedLinks);
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
      state.openedLinks.add(id);
      changeVisitedLinks(state.openedLinks);
    });

    modalLogic(button, { title, desc, id });

    li.insertAdjacentElement('beforeend', button);

    ul.insertAdjacentElement('beforeend', li);
  });

  newDiv.insertAdjacentElement('beforeend', bodyDiv);
  newDiv.insertAdjacentElement('beforeend', ul);
  postsDiv.insertAdjacentElement('beforeend', newDiv);
};

export default function render(state, [postsHeader, feedsHeader, viewButton]) {
  const { rssFeeds } = state;
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
  rssFeeds.forEach(({ feedTitle, feedDesc, posts }) => {
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

    createPosts(state, posts, postsHeader, viewButton, postsUl);
  });
  newDiv.insertAdjacentElement('beforeend', ul);
  feedsDiv.insertAdjacentElement('beforeend', newDiv);
}
