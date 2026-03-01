import { render } from 'solid-js/web';
import App from './App.tsx';
import './App.css';

// biome-ignore lint/style/noNonNullAssertion: root element always exists
render(() => <App />, document.getElementById('root')!);
