import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import { isAppSessionQuery } from "@storyblok/app-extension-auth";
import { appSessionCookies } from "@/auth";

import { ToolProvider } from "@/contexts";
import { useAutoHeight } from "@/hooks";

import type { ISbStoryData } from "storyblok-js-client";

import SbStoryShowcase from "@/components/SbStoryShowcase";

type HomeProps = {
  spaceId: number;
  userId: number;
};

const fetchStory = (spaceId: number, userId: number): Promise<ISbStoryData> =>
  fetch(`api/config-story?spaceId=${spaceId}&userId=${userId}`)
    .then((res) => res.json())
    .catch((error) => {
      console.error("Failed to fetch story", error);
      return {};
    });

const fetchSchema = (spaceId: number, userId: number): Promise<ISbStoryData> =>
  fetch(`api/config-story-schema-options?spaceId=${spaceId}&userId=${userId}`)
    .then((res) => res.json())
    .catch((error) => {
      console.error("Failed to fetch Content Type", error);
      return {};
    });

export default function Home(props: HomeProps) {
  useAutoHeight();
  const [story, setStory] = useState<ISbStoryData>();
  const [schemaOptions, setSchemaOptions] = useState<ISbStoryData>();

  useEffect(() => {
    fetchStory(props.spaceId, props.userId).then((story) => setStory(story));
    fetchSchema(props.spaceId, props.userId).then((options) =>
      setSchemaOptions(options)
    );
  }, [props.spaceId, props.userId]);

  return (
    <ToolProvider story={story} schema={schemaOptions}>
      <main>
        <SbStoryShowcase />
      </main>
    </ToolProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;

  if (!isAppSessionQuery(query)) {
    return {
      redirect: {
        permanent: false,
        destination: process.env.BASE_URL + "/api/connect/storyblok",
      },
    };
  }

  const sessionStore = appSessionCookies(context);
  const appSession = await sessionStore.get(query);

  if (!appSession) {
    return {
      redirect: {
        permanent: false,
        destination: process.env.BASE_URL + "/api/connect/storyblok",
      },
    };
  }

  const { spaceId, userId } = appSession;

  return {
    props: { spaceId, userId },
  };
};
