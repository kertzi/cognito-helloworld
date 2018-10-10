import * as React from 'react';
import Header from './Header';
import Description from './Description';
// import { Auth } from 'aws-amplify';
import * as AWS from 'aws-sdk';
import axios from 'axios';

interface IProps {
    authState?: any,
    authData?: any,
}

//const cognitoIdentitySp = new AWS.CognitoIdentityServiceProvider();

class AppView extends React.PureComponent<IProps> {


    public authorizerTest() {
        const { authState, authData } = this.props;
        if (authState === "signedIn") {
            const accessJwtToken = authData.signInUserSession.accessToken.jwtToken;
            
            console.log('getting users');
            axios.get('http://localhost:4000/users', {
                headers: {
                    'Authorization': accessJwtToken,
                }
            }).then(response => {
                console.log(response);
            });
        }

    }
    public authTest() {
        const { authState, authData } = this.props;
        const userPoolId = 'eu-west-1_EAAhbYsnv';

        if (authState === "signedIn") {
            const idJwtToken = authData.signInUserSession.idToken.jwtToken;
            console.log(idJwtToken);

            AWS.config.region = 'eu-west-1';
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: 'eu-west-1:5111192d-eb67-453d-a45f-3b38a899ba2e',
                Logins: {
                    ['cognito-idp.' + AWS.config.region + '.amazonaws.com/' + userPoolId]: idJwtToken
                }
            });
            AWS.config.getCredentials(err => {
                if (!err) {
                    var id = AWS.config.credentials ? AWS.config.credentials.accessKeyId : null;
                    console.log('success got temp credentials', id);
                } else {
                    console.log(err);
                }

                var params: AWS.CognitoIdentityServiceProvider.ListUsersRequest = {
                    UserPoolId: userPoolId,
                    AttributesToGet: [],
                    Filter: "",
                    Limit: 60
                };
                var cognitoIdentitySp = new AWS.CognitoIdentityServiceProvider();
                cognitoIdentitySp.listUsers(params, (err: AWS.AWSError, data: AWS.CognitoIdentityServiceProvider.ListUsersResponse) => {
                    if (err) {
                        console.log(err);
                    }
                    console.log(data);
                });
            });
        }
    }
    
    public componentDidUpdate(prevProps: Readonly<IProps>) {
        this.authTest();
    }
    public render() {
        const { authState, authData } = this.props;
        if (authState === "signedIn") {
            console.log(authData.signInUserSession.accessToken.jwtToken);
            return (

                <div className="App">
                    <Header name={authData.username} />
                    <Description countBy={2} />
                </div>

            );
        } else {
            return (
                <div className="App" />
            );
        }
    }
}

export default AppView;