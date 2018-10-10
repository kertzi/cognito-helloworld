import AuthPolicy from './auth-policy';
import jwtVerifier from './jwtVerifier';

export enum Effect {
    Allow,
    Deny
}

class Authorizer {

    // Creates policy document for called resource
    public createPolicy(event: any, principalId: string, effect: Effect) {
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

        var claims = await jwtVerifier(token);
        console.log('claims', claims);
        var principalId = claims.username;
        var groups: Array<string> = claims['cognito:groups'] ? claims['cognito:groups'] : null;
        console.log('Username', principalId);
        console.log('groups', groups);

        if (groups.indexOf(requiredGroup) > -1) {
            return this.createPolicy(event, principalId, Effect.Allow);
        }
        return this.createPolicy(event, principalId, Effect.Deny);
    }
}

export default Authorizer;