import { createKindeServerClient, GrantType } from '@kinde-oss/kinde-typescript-sdk';

export const kindeAuthClient = createKindeServerClient(GrantType.AUTHORIZATION_CODE, {
  authDomain: process.env.KINDE_DOMAIN,
  clientId: process.env.KINDE_CLIENT_ID,
  clientSecret: process.env.KINDE_CLIENT_SECRET,
  redirectURL: process.env.KINDE_REDIRECT_URI,
  logoutRedirectURL: process.env.KINDE_LOGOUT_REDIRECT_URI,
});
