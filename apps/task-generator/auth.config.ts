import Atlassian from "@auth/core/providers/atlassian";
import { defineConfig } from "auth-astro";

// import NextAuth from "next-auth"
//
// declare module "next-auth" {
//   interface User {
//     /** The user's postal address. */
//     address: string
//   }
// }

// declare module "auth-astro" {
//   interface User {
//     siteId: string
//   }
// }

export default defineConfig({
  debug: false,
  providers: [
    Atlassian({
      clientId: import.meta.env.ATLASSIAN_CLIENT_ID,
      clientSecret: import.meta.env.ATLASSIAN_CLIENT_SECRET,
      authorization: { params: { scope: "read:me read:account read:jira-work" } },
      async profile(profile, account) {
        const accessToken = account.access_token
        const data = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json'
          }
        })
        const [dataSite] = await data.json()
        const {id, url, name} = dataSite

        return {
          id: profile.account_id,
          name: profile.name,
          image: profile.picture,
          email: profile.email,
          siteId: id,
          siteUrl: url,
          siteName: name,
          accessToken
        };
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if(user) {
        // @ts-ignore
        token.siteId = user.siteId
        // @ts-ignore
        token.siteUrl = user.siteUrl
        // @ts-ignore
        token.siteName = user.siteName
        // @ts-ignore
        token.accessToken = user.accessToken
      }
      return token
    },
    session({ session, token }) {
      if(session.user) {
        // @ts-ignore
        session.site = {}
        // @ts-ignore
        session.site.id = token.siteId
        // @ts-ignore
        session.site.url = token.siteUrl
        // @ts-ignore
        session.site.name = token.siteName
        // @ts-ignore
        session.site.accessToken = token.accessToken
      }
      return session
    }
  }
});
