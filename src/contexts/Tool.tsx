import { useState, createContext, useEffect, ReactNode } from "react";
import type { ISbStoryData } from "storyblok-js-client";
import { APP_ORIGIN, TOOL_ID } from "@/config";
import { SchemaOptions } from "@/types";

type ToolContextType = {
  story: ISbStoryData;
  schema: SchemaOptions;
  currentStory: ISbStoryData;
};

export const ToolContext = createContext<ToolContextType>(
  {} as ToolContextType
);

type Props = {
  story: ISbStoryData;
  schema: SchemaOptions;
  children: ReactNode;
};

export const ToolProvider = ({ story, schema, children }: Props) => {
  const [currentStory, setCurrentStory] = useState();

  useEffect(() => {
    window.addEventListener(
      "message",
      (event) => {
        if (event.data.action === "get-context") {
          setCurrentStory(event.data.story);
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

  return currentStory ? (
    <ToolContext.Provider value={{ story, currentStory, schema }}>
      {children}
    </ToolContext.Provider>
  ) : null;
};
