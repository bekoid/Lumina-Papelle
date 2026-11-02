import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

const app = createApp(App);
app.config.errorHandler = (err, instance, info) => {
  console.error('[VUE GLOBAL ERROR]', err, info);
  if (err && err.stack) console.error(err.stack);
};
window.addEventListener('error', (e) => {
  console.error('[WINDOW ERROR]', e.error || e.message);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('[UNHANDLED REJECTION]', e.reason);
});
app.mount('#app');
