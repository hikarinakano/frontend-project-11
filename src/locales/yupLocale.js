// import * as yup from 'yup';

// const yupLocale = () => yup.setLocale();

const customErrors = {
  mixed: {
    default: 'Must not happen',
    required: ({ path }) => ({ key: 'networkError', values: { path } }),
  },
  string: {
    url: ({ path }) => ({ key: 'notUrl', values: { path } }),
    test: ({ path }) => ({ key: 'duplicateUrl', values: { path } }),
  },
}
export default customErrors;
