'use strict';
import { corsSuccessResponse } from './lambda-response';
import Authorizer from './authorizer';

module.exports.getUsers = async (event: any, context: any) => {
  return corsSuccessResponse("OK");
}

module.exports.authorizeAction = async (event: any, context: any) => {
  const authorizer = new Authorizer();
  return authorizer.authorize(event);
}


