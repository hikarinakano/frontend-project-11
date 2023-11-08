import onChange from "on-change";


const watchedState = onChange(state, (path, value) => {
  switch (path) {
    case 'lng': i18nInstance.changeLanguage(value).then(() => render(container, watchedState, i18nInstance));
      break;

    case 'clicksCount': render(container, watchedState, i18nInstance);
      break;

    default:
      break;
  }
});

export default watchedState;
