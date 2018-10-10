import * as React from 'react';
import './App.css';

import AppView from './AppView';

import { Authenticator,  SignOut, Greetings } from 'aws-amplify-react';

class App extends React.Component {
  // handleAuthStateChange = (state) => {
  //   console.log(state);
  // }
  //
  public render() {
    return (
        
          <Authenticator hideDefault={false}>
          <AppView/>
          <SignOut />
          <Greetings/>

          </Authenticator>
        
    );
  }
}
export default App;