import { GetServerSideProps } from "next";
import { isAppSessionQuery } from "@storyblok/app-extension-auth";
import { appSessionCookies } from "@/auth";
import { useAutoHeight } from "@/hooks";
import { isAdmin } from "@/utils";

import { ToolProvider } from "@/contexts";
import SbStoryShowcase from "@/components/SbStoryShowcase";

type User = {
  id: number;
  friendly_name: string;
};

type UserInfo = {
  user: User;
};

type HomeProps = {
  userInfo: UserInfo;
  accessToken: string;
  spaceId: string;
  userId: string;
  isAdmin: boolean;
};

export default function Home(props: HomeProps) {
  useAutoHeight();
  const { accessToken } = props;

  return (
    <ToolProvider accessToken={accessToken}>
      <main>
        {props.userInfo && (
          <span>Hello {props.userInfo.user.friendly_name}</span>
        )}
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

  const { accessToken, spaceId, userId } = appSession;

  const userInfo = await fetchUserInfo(accessToken);

  return {
    props: { userInfo, spaceId, userId, isAdmin: isAdmin(appSession) },
  };
};

const fetchUserInfo = async (accessToken: string) => {
  try {
    const response = await fetch(`https://api.storyblok.com/oauth/user_info`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch user information:", error);
  }

  return null;
};
