import { NextApiHandler } from 'next';
import { authParams } from '@/auth';
import { APP_ID } from "@/config";
import { SchemaOptions, ToolSpaceSettings } from '@/types';

import StoryblokClient from 'storyblok-js-client';
import {
  isAppSessionQuery,
  Region,
  sessionCookieStore,
} from '@storyblok/app-extension-auth';

const handle: NextApiHandler<SchemaOptions> = async (req, res) => {
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

    // Fetch the content type schema that contains the entire site configuration
    const contentTypeSchema = await getContentTypeSchema(accessToken, region, spaceId, toolSpaceSettings.content_type)

    if (contentTypeSchema instanceof Error) {
      console.error(contentTypeSchema)
      res.status(500).end()
      return
    }

    const brandColors = contentTypeSchema.schema.color.options.filter((option: any) => option.name === "colors")[0].value;

    res.json({
      colors: brandColors,
    })
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

type ContentTypeSchema = {
  name: string,
  display_name?: string,
  created_at: string,
  updated_at: string,
  id: number,
  schema: any,
  image?: string,
  preview_field?: string,
  is_root: boolean,
  preview_tmpl?: string,
  is_nestable: boolean,
  all_presets: any[],
  real_name: string,
  component_group_uuid?: string
};

const getContentTypeSchema = (
  accessToken: string,
  region: Region,
  spaceId: number,
  contentType: string
): Promise<ContentTypeSchema | Error> =>
  new StoryblokClient({
    oauthToken: `Bearer ${accessToken}`,
    region,
  })
    .get(`spaces/${spaceId}/components`)
    .then((res) => res.data.components.filter((component: ContentTypeSchema) => component.name === contentType)[0])
    .catch((error) => error)

export default handle