import * as React from 'react';
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';

interface IProps {
    children?: React.ReactNode;
}

interface IState {
    currentUser?: string
    errorMsg?: string
}

function getParameterByName(name: string, url?: string):any {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&#]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

class Authenticated extends React.PureComponent<IProps, IState> {
    public state: IState = {
        currentUser: undefined,
        errorMsg: undefined,
    }

    private poolData: AmazonCognitoIdentity.ICognitoUserPoolData = {
        UserPoolId: 'eu-west-1_EAAhbYsnv',
        ClientId: 'equ3bi10aqjcmlnshkppnq1kt',
    }

    private userPool = new AmazonCognitoIdentity.CognitoUserPool(this.poolData);

    public componentDidMount() {
        // if (!this.isAuthenticated()) {
        //     this.authenticate();
        // }
        let token: string = getParameterByName('id_token');
        this.verifyToken(token);
    }

    public verifyToken(token: string) {
        const verifier_url = 'http://localhost:4000/jwt/verify';
        
        let request: XMLHttpRequest = new XMLHttpRequest();
        
        request.onreadystatechange = function (event: Event) {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        console.log('verify success ');
                        console.log(this.responseText);
                    } else {
                        console.log('verify FAILED', this.responseText);
                    }
                }
            }
        
        request.open('POST', verifier_url, true);
        request.send(token);
    }

    public signup = () => {
        let attributeList: AmazonCognitoIdentity.CognitoUserAttribute[] = [];
        // const validationData: AmazonCognitoIdentity.CognitoUserAttribute[] = [];
    
        var dataEmail: AmazonCognitoIdentity.ICognitoUserAttributeData = {
            Name : 'email',
            Value : 'email@mydomain.com'
        };
        var dataPhoneNumber: AmazonCognitoIdentity.ICognitoUserAttributeData = {
            Name : 'given_name',
            Value : 'Mikko'
        };
        var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
        var attributePhoneNumber = new AmazonCognitoIdentity.CognitoUserAttribute(dataPhoneNumber);

        attributeList.push(attributeEmail);
        attributeList.push(attributePhoneNumber);
        
        // this.userPool.signUp('username', 'password', attributeList, validationData, (err: Error, result: AmazonCognitoIdentity.ISignUpResult) => {
        //     if (err) {                
        //         console.log(err);
        //         this.setState({
        //             errorMsg: err.message,
        //         });
        //         return;
        //     }
        //     const cognitoUser = result.user;            
        //     this.setState({
        //         currentUser: cognitoUser.getUsername(),
        //     })
        //     console.log('user name is ' + cognitoUser.getUsername());
        // });
    };

    public authenticate = () => {
        const detailsData: AmazonCognitoIdentity.IAuthenticationDetailsData = {

            Username: 'kertzi',
            Password: 'password'
        }
        let authDetails = new AmazonCognitoIdentity.AuthenticationDetails(detailsData);

        const userData: AmazonCognitoIdentity.ICognitoUserData = {
            Pool: this.userPool,
            Username: authDetails.getUsername()
        }

        const user = new AmazonCognitoIdentity.CognitoUser(userData);
        user.authenticateUser(authDetails, {
            onSuccess: (session: AmazonCognitoIdentity.CognitoUserSession, confirmNeeded: boolean) => {
                this.setState({
                    currentUser: user.getUsername()
                })
            }, 
            onFailure: (error: any) => {
                this.setState({
                    errorMsg: error.message,
                    currentUser: undefined
                });
            }
        })
    }

    public isAuthenticated = () => {
        const currentUser = this.userPool.getCurrentUser();
        return !currentUser ? false : true;
    }

    public render() {
        return (
            <div>
                {this.state.currentUser ? 
                    this.props.children : 
                    <p>Not authenticated</p>
                    }
                {this.state.errorMsg}
            </div>
        );
    }
}

export default Authenticated;