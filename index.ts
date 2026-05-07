// Expo 엔트리. registerRootComponent를 거치면 dev client·standalone 양쪽에서 동작.
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
