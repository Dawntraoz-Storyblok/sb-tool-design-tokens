import { APP_ORIGIN, TOOL_ID } from "@/config";
import type { ISbStoryData } from "storyblok-js-client";
import { useState, createContext, useEffect, ReactNode } from "react";

type ToolContextType = {
  story: ISbStoryData;
  accessToken: string;
};

export const ToolContext = createContext<ToolContextType>(
  {} as ToolContextType
);

type Props = {
  accessToken: string;
  children: ReactNode;
};

export const ToolProvider = ({ accessToken, children }: Props) => {
  const [story, setStory] = useState();

  useEffect(() => {
    window.addEventListener(
      "message",
      (event) => {
        if (event.data.action === "get-context") {
          setStory(event.data.story);
        }
      },
      false
    );

    window.parent.postMessage(
      {
        action: "tool-changed",
        tool: TOOL_ID,
        event: "getContext",
      },
      APP_ORIGIN
    );
  }, []);

  return story ? (
    <ToolContext.Provider value={{ story, accessToken }}>
      {children}
    </ToolContext.Provider>
  ) : null;
};
