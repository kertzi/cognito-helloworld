import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import Amplify from 'aws-amplify';
import { I18n } from 'aws-amplify';

Amplify.configure({
  Auth: {
    userPoolId: 'eu-west-1_EAAhbYsnv',
    userPoolWebClientId: 'equ3bi10aqjcmlnshkppnq1kt'    
  }
});

const labels = {
  fi: {
    'Sign in': 'Kirjaudu',
  }
}
I18n.setLanguage('fi');
I18n.putVocabularies(labels)


ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
