/* Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file
 except in compliance with the License. A copy of the License is located at

     http://aws.amazon.com/apache2.0/

 or in the "license" file accompanying this file. This file is distributed on an "AS IS"
 BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 License for the specific language governing permissions and limitations under the License.

 https://github.com/awslabs/aws-support-tools/tree/master/Cognito/decode-verify-jwt
*/

var https = require('https');
var jose = require('node-jose');

var region = 'eu-west-1';
var userpool_id = 'eu-west-1_EAAhbYsnv';
var app_client_id = 'equ3bi10aqjcmlnshkppnq1kt';
var keys_url = 'https://cognito-idp.' + region + '.amazonaws.com/' + userpool_id + '/.well-known/jwks.json';

function createSuccessResponse(payload) {
    return {
        statusCode: 200,
        headers: {"Content-Type": "application/json; charset=utf-8"},
        body: JSON.stringify(payload),
      };
}

function createErrorResponse(payload) {
    return {
        statusCode: 500,
        headers: {"Content-Type": "application/json; charset=utf-8"},
        body: JSON.stringify(payload),
      };
}

exports.handler = async (event, context) => {
    var token = event.body;

    var sections = token.split('.');
    // get the kid from the headers prior to verification
    var header = jose.util.base64url.decode(sections[0]);
    header = JSON.parse(header);
    var kid = header.kid;
    console.log('kid', kid);
    console.log('downloading keys from: ', keys_url);
    // download the public keys
    let error;
    let response;

    let getResponse = await https.get(keys_url, function(response) {
        console.log('got keys response');
        if (response.statusCode == 200) {
            response.on('data', function(body) {
                
                var keys = JSON.parse(body)['keys'];
                console.log('parsing keys', keys);
                // search for the kid in the downloaded public keys
                var key_index = -1;
                for (var i=0; i < keys.length; i++) {
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
                    error = new Error('Public key not found in jwks.json');
                    response = createErrorResponse('Public key not found in jwks.json');
                    //return;
                }
                // construct the public key
                jose.JWK.asKey(keys[key_index]).
                then(function(result) {
                    // verify the signature
                    jose.JWS.createVerify(result).
                    verify(token).
                    then(function(result) {
                        // now we can use the claims
                        var claims = JSON.parse(result.payload);
                        // additionally we can verify the token expiration
                        current_ts = Math.floor(new Date() / 1000);
                        if (current_ts > claims.exp) {
                            //callback('Public key not found in jwks.json', createErrorResponse('Token is expired'));
                        }
                        // and the Audience (use claims.client_id if verifying an access token)
                        if (claims.aud != app_client_id) {
                            //callback('Token was not issued for this audience', createErrorResponse('Token was not issued for this audience'));
                        }
                        console.log('Successfully verified. returning claims');
                        //callback(null, createSuccessResponse(claims));
                        response = createSuccessResponse(claims);
                    }).
                    catch(function(error) {
                        error = error;
                        response = createErrorResponse('Signature verification failed');
                        //callback(error, createErrorResponse('Signature verification failed'));
                    });
                });
            });
        }
    });

    return response;
}