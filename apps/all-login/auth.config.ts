
import GitHub from '@auth/core/providers/github'
import Atlassian from '@auth/core/providers/atlassian'
import { defineConfig } from 'auth-astro'

export default defineConfig({
  providers: [
    GitHub({
      clientId: import.meta.env.GITHUB_CLIENT_ID,
      clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
    }),
    Atlassian({
      clientId: import.meta.env.ATLASSIAN_CLIENT_ID,
      clientSecret: import.meta.env.ATLASSIAN_CLIENT_SECRET,
      authorization: { params: { scope: "read:me" } },
      profile(profile) {
        console.log(profile)
        return {
          id: profile.account_id,
          name: profile.name,
          image: profile.picture,
          email: profile.email,
        }
      }
    }),
  ],
});
