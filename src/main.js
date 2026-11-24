import { initApp } from './app.js';
import { browserAdapters } from './ui/adapters.js';

export function bootstrap(doc, win) {
  initApp(doc, browserAdapters(win));
}
