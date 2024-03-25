import { UnauthorizedPage } from "@storyblok/mui";
import { Box } from "@mui/material";
import { useEffect } from "react";

export default function Error401() {
  useEffect(() => {
    /**
     * When initially approving the Tool having access to storyblok, the user is navigated outside Storyblok.
     * This piece of code redirects the user back to the Storyblok Application.
     **/
    if (typeof window !== "undefined" && window.top === window.self) {
      window.location.assign("https://app.storyblok.com/oauth/tool_redirect");
    }
  }, []);

  return (
    <UnauthorizedPage
      message={
        <Box
          component={"span"}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            alignItems: "center",
          }}
        >
          Could not sign into the app.
        </Box>
      }
    />
  );
}
