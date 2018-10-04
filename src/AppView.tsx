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
    

    public authTest() {
        const {authState, authData} = this.props;
        if (authState === "signedIn") {
            console.log('getting users');
            axios.get('http://localhost:4000/users', {
                headers: {
                    'Authorization': authData.signInUserSession.accessToken.jwtToken
                }
            }).then(response => {
                console.log(response);
            });
            // Auth.currentAuthenticatedUser().then((result: any) => {
            //     console.log(result);
            // });
            // var params: AWS.CognitoIdentityServiceProvider.ListUsersRequest = {
            //     UserPoolId: 'eu-west-1_EAAhbYsnv',
            //     AttributesToGet: [],
            //     Filter: "",
            //     Limit: 100
            // };

            // cognitoIdentitySp.listUsers(params, (err: AWS.AWSError, data: AWS.CognitoIdentityServiceProvider.ListUsersResponse) => {
            //     if (err) {
            //         console.log(err);
            //     }
            //     console.log(data);
            // })

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
                <div className="App"/>
            );
        }
    }
}

export default AppView;