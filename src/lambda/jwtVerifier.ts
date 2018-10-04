import axios from 'axios';
var https = require('https');
var jose = require('node-jose');

var region = 'eu-west-1';
var userpool_id = 'eu-west-1_EAAhbYsnv';
var app_client_id = 'equ3bi10aqjcmlnshkppnq1kt';
var keys_url = 'https://cognito-idp.' + region + '.amazonaws.com/' + userpool_id + '/.well-known/jwks.json';

const jwtVerifier = async (token: string) => {
    var sections = token.split('.');
    // get the kid from the headers prior to verification
    var header = jose.util.base64url.decode(sections[0]);
    header = JSON.parse(header);
    var kid = header.kid;

    console.log('downloading keys from: ', keys_url);
    try {
        let keyResponse = await axios.get(keys_url);

        let body = keyResponse.data;

        var keys = body.keys;
        // search for the kid in the downloaded public keys
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
            //callback('Public key not found in jwks.json', createErrorResponse('Public key not found in jwks.json'));
            throw new Error('Public key not found in jwks.json');
        }
        // construct the public key
        let publicKey = await jose.JWK.asKey(keys[key_index]);
        console.log('public key', publicKey);
        // verify the signature
        try {
            let verifyResult = await jose.JWS.createVerify(publicKey).verify(token);
            // now we can use the claims
            var claims = JSON.parse(verifyResult.payload);
            // additionally we can verify the token expiration
            // let current_ts = Math.floor(new Date() / 1000);
            // if (current_ts > claims.exp) {
            //     //callback('Public key not found in jwks.json', createErrorResponse('Token is expired'));
            // }
            // // and the Audience (use claims.client_id if verifying an access token)
            if (claims.aud != app_client_id) {
                //callback('Token was not issued for this audience', createErrorResponse('Token was not issued for this audience'));
            }
            console.log('Successfully verified. returning claims');

            return claims;
        }
        catch (error) {
            throw error;
        }
    } catch (error) {
        throw error;
    }

}

export default jwtVerifier;