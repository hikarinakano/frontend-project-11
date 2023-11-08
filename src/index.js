import './styles.scss';
import 'bootstrap';
import 'yup';
import { data } from './data.js';

const root = document.getElementById('app')

data.forEach((element) => {
  const item = document.createElement('div');
  item.textContent = element;
  item.classList.add('item');

  root.appendChild(item);
})
// import watchedState from '../view.js'

// console.log(watchedState)
// const render = (container, watchedState) => {
//   console.log(watchedState)
// }
 
// export default () => {
//   const state = {

//   };

// }