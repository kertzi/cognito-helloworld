import * as React from 'react';
import './App.css';

import AppView from './AppView';

import { Authenticator,  SignIn, /*SignOut*/ } from 'aws-amplify-react';

class App extends React.Component {
  // handleAuthStateChange = (state) => {
  //   console.log(state);
  // }
  public render() {
    return (
        
          <Authenticator hideDefault={true}>
            <SignIn />            
            <AppView />
          </Authenticator>
        
    );
  }
}
export default App;