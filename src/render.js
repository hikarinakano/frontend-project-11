// example feeds : https://lorem-rss.hexlet.app/feed?length=42
// another is  https://ru.hexlet.io/lessons.rss
// i also need to find modal and fill in the description
const modalLogic = (button, { title, desc, link }) => {
  const modalHeader = document.querySelector('.modal-header');
  const modalContent = document.querySelector('.modal-body');
  const modal = document.querySelector('.modal-content');
  const openLinkBtn = modal.querySelector('.full-article');
  button.addEventListener('click', () => {
    modalHeader.textContent = title;
    modalContent.textContent = desc;
    openLinkBtn.addEventListener('click', () => {
      openLinkBtn.href = link;
    });
  });
  // create in a state new instance for modal logic
};
const createPosts = (postsList, postsHeader, viewButton, ul) => {
  const postsDiv = document.querySelector('.posts');
  postsDiv.innerHTML = '';

  const newDiv = document.createElement('div');
  newDiv.classList.add('card', 'border-0');

  const bodyDiv = document.createElement('div');
  bodyDiv.classList.add('card-body');

  const header = document.createElement('h2');
  header.classList.add('card-title', 'h4');
  header.innerText = postsHeader;

  bodyDiv.insertAdjacentElement('afterbegin', header);
  // ul is one main for all, as for header and till newDiv
  // const ul = document.createElement('ul');
  // ul.classList.add('list-group', 'border-0', 'rounded-0');

  postsList.forEach(({
    id, title, link, desc,
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
    a.setAttribute('href', link);
    a.setAttribute('data-id', id);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = title;

    li.insertAdjacentElement('beforeend', a);

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('data-id', id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.textContent = viewButton;
    modalLogic(button, { title, desc, link });
    li.insertAdjacentElement('beforeend', button);

    ul.insertAdjacentElement('beforeend', li);
  });

  newDiv.insertAdjacentElement('beforeend', bodyDiv);
  newDiv.insertAdjacentElement('beforeend', ul);
  postsDiv.insertAdjacentElement('beforeend', newDiv);
};

const createFeeds = (feedsList, [postsHeader, feedsHeader, viewButton]) => {
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

  feedsList.forEach(({ feedTitle, feedDesc, posts }) => {
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
    ul.insertAdjacentElement('afterbegin', li);

    createPosts(posts, postsHeader, viewButton, postsUl);
  });
  newDiv.insertAdjacentElement('beforeend', ul);
  feedsDiv.insertAdjacentElement('beforeend', newDiv);
};

export default function renderFeedsAndPosts(rssDataList, [postsHeader, feedsHeader, viewButton]) {
  createFeeds(rssDataList, [postsHeader, feedsHeader, viewButton]);
  // rssDataList.map(({id, feedTitle, feedDesc, posts},) => {
  //   // create two outer divs
  //   // create outer h2
  //   // create outer ul
  //   // then stuff ul with li
  //   // then another two outer divs
  //   //then h2
  //   // then ul
  //   // then stuff it with map
  // })
}
