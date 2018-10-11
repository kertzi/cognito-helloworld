import axios from 'axios';
var jose = require('node-jose');

export interface Options {
    region?: string;
    userpoolId: string;
    appClientId: string;
}

/**
 * 
 * @param provider Idp provider where jwt token comes from. values: cognito-userpool|google
 * @param kid Kid from token
 * @param options options required only when provider == cognito-userpool
 */
const getPublicKey = async (provider: string, kid: string, options?: Options) => {
    let keys_url = "";
    let format = "json";

    if (provider === 'cognito-userpool') {
        keys_url = 'https://cognito-idp.' + options.region + '.amazonaws.com/' + options.userpoolId + '/.well-known/jwks.json';
    } else if (provider === 'google') {
        keys_url = 'https://www.googleapis.com/oauth2/v3/certs';
    } else {
        throw new Error('Unsupported provider. Supported providers: cognito-userpool | google');
    }

    let keyResponse = await axios.get(keys_url);
    let body = keyResponse.data;

    // search for the kid in the downloaded public keys
    let key;

    // if (provider === 'cognito-userpool') {
    let keys = body.keys;
    var key_index = -1;
    for (var i = 0; i < keys.length; i++) {
        if (kid === keys[i].kid) {
            key_index = i;
            console.log('kid matched public key');
            break;
        }
    }
    console.log('key_index', key_index);
    if (key_index === -1) {
        console.log('Public key not found in jwks.json');
        throw new Error('Public key not found in jwks.json');
    }
    key = keys[key_index];

    try {
        // construct the public key
        let publicKey = await jose.JWK.asKey(key, format);
        return publicKey;
    } catch (error) {
        console.log('public key construct failed', error);
        throw error;
    }


}

const JwtVerifier = async (token: string, publicKey: string, appClientId: string) => {
    // verify the signature

    let verifyResult = await jose.JWS.createVerify(publicKey).verify(token);
    // now we can use the claims
    var claims = JSON.parse(verifyResult.payload);
    // additionally we can verify the token expiration
    let current_ts: any = Math.floor(new Date().valueOf() / 1000);
    if (current_ts > claims.exp) {
        throw new Error('Token is expired');
    }
    // // and the Audience (use claims.client_id if verifying an access token)
    if (claims.aud != appClientId) {
        throw new Error('Token was not issued for this audience');
    }
    console.log('Successfully verified. returning claims');

    return claims;
}

const parseKid = (token: string) => {
    var sections = token.split('.');
    // get the kid from the headers prior to verification
    var header = jose.util.base64url.decode(sections[0]);
    header = JSON.parse(header);
    var kid = header.kid;
    return kid;
}

export const googleJwtVerifier = async (token: string, appClientId: string) => {
    const publicKey = await getPublicKey('google', parseKid(token));
    const result = await JwtVerifier(token, publicKey, appClientId);

    return result;
}

export const userPoolJwtVerifier = async (token: string, options: Options) => {
    const publicKey = await getPublicKey('cognito-userpool', parseKid(token), options);
    const result = await JwtVerifier(token, publicKey, options.appClientId);

    return result;
}
