import { NextApiHandler } from 'next';
import { authParams } from '@/auth';
import { APP_ID } from "@/config";
import { ToolSpaceSettings } from '@/types';

import type { ISbStoryData } from "storyblok-js-client";
import StoryblokClient from 'storyblok-js-client';
import {
  isAppSessionQuery,
  Region,
  sessionCookieStore,
} from '@storyblok/app-extension-auth';

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

    // Fetch the space settings for this tool
    const toolSpaceSettings = await getSpaceSettings(accessToken, region, spaceId)

    if (toolSpaceSettings instanceof Error) {
      console.error(toolSpaceSettings)
      res.status(500).end()
      return
    }

    // Fetch the story that contains the entire site configuration
    const story = await fetchStory(accessToken, region, spaceId, toolSpaceSettings.story_id)

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

const getSpaceSettings = (
  accessToken: string,
  region: Region,
  spaceId: number
): Promise<ToolSpaceSettings | Error> =>
  new StoryblokClient({
    oauthToken: `Bearer ${accessToken}`,
    region,
  })
    .get(`spaces/${spaceId}/app_provisions/${APP_ID}`)
    .then((res) => res.data.app_provision.space_level_settings)
    .catch((error) => error)

const fetchStory = (
  accessToken: string,
  region: Region,
  spaceId: number,
  storyId: string
): Promise<ISbStoryData | Error> =>
  new StoryblokClient({
    oauthToken: `Bearer ${accessToken}`,
    region,
  })
    .get(`spaces/${spaceId}/stories/${storyId}`)
    .then((res) => res.data.story as ISbStoryData)
    .catch((error) => error)

export default handle