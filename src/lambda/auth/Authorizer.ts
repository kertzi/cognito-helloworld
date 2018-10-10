import AuthPolicy, { Policy } from './AuthPolicy';
import JwtVerifier, { Options } from './JwtVerifier';

export enum Effect {
    Allow,
    Deny
}

class Authorizer {

    // Creates policy document for called resource
    public createPolicy(event: any, principalId: string, effect: Effect): Policy {
        var apiOptions: any = {};
        var tmp = event.methodArn.split(':');
        var apiGatewayArnTmp = tmp[5].split('/');
        var awsAccountId = tmp[4];

        apiOptions.region = tmp[3];
        apiOptions.restApiId = apiGatewayArnTmp[0];
        apiOptions.stage = apiGatewayArnTmp[1];

        var method = apiGatewayArnTmp[2];
        var resource = '/'; // root resource
        if (apiGatewayArnTmp[3]) {
            resource += apiGatewayArnTmp.slice(3, apiGatewayArnTmp.length).join('/');
        }

        var policy = new AuthPolicy(principalId, awsAccountId, apiOptions);
        
        if (effect === Effect.Allow) {
            policy.allowMethod(method, resource);
        } else if (effect === Effect.Deny) {
            policy.denyMethod(method, resource);
        }

        var authResponse = policy.build();
        return authResponse;
    }

    public async authorize(event: any) {
        const requiredGroup = 'admins2';
        console.log('Client token: ' + event.authorizationToken);
        console.log('Method ARN: ' + event.methodArn);
        console.log('Method', event);
        var token = event.authorizationToken;

        const verifierOptions: Options = {
            appClientId: '1q1tfl4g54aglutpen4onualku',
            region: 'eu-west-1',
            userpoolId: 'eu-west-1_stPjdpnxN'
        };

        var claims = await JwtVerifier(token, verifierOptions);
        console.log('claims', claims);
        var principalId = claims.username;
        console.log('Username', principalId);

        return this.createPolicy(event, principalId, Effect.Allow);
        
        //return this.createPolicy(event, principalId, Effect.Deny);
    }
}

export default Authorizer;