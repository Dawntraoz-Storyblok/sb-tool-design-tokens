import { NextApiHandler } from 'next'
import { authParams } from '@/auth'
import type { ISbStoryData } from "storyblok-js-client";
import StoryblokClient from 'storyblok-js-client'
import {
  isAppSessionQuery,
  Region,
  sessionCookieStore,
} from '@storyblok/app-extension-auth'

const fetchStory = (
  accessToken: string,
  region: Region,
  spaceId: number,
): Promise<ISbStoryData | Error> =>
  new StoryblokClient({
    oauthToken: `Bearer ${accessToken}`,
    region,
  })
    .get(`spaces/${spaceId}/stories`, { "with_slug": "site-config" }) // ToDo: Get slug from Space Settings Options
    .then((res) => res.data.stories[0] as ISbStoryData)
    .catch((error) => error)

const handle: NextApiHandler<ISbStoryData> = async (req, res) => {
  try {
    const { query } = req

    if (!isAppSessionQuery(query)) {
      // spaceId and userId are not specified, so it is impossible to know from which space and user the request came from
      res.status(401).end()
      return
    }

    const sessionStore = sessionCookieStore(authParams)({ req, res })
    const appSession = await sessionStore.get(query)
    if (!appSession) {
      res.status(401).end()
      return
    }

    const { accessToken, region, spaceId } = appSession

    const story = await fetchStory(accessToken, region, spaceId)

    if (story instanceof Error) {
      console.error(story)
      res.status(500).end()
      return
    }

    res.json(story)
    return
  } catch (error) {
    // Should not happen
    res.status(500).end()
  }
}

export default handle