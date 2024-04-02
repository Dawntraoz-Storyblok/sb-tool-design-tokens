import { useContext } from "react";
import { ToolContext } from "@/contexts";

import ColorSelector from "@/components/ui-elements/ColorSelector";

const SbStoryShowcase = () => {
  const { story } = useContext(ToolContext);

  return (
    story && (
      <>
        <div>
          <strong>Brand color</strong>
          <ColorSelector current={story.content.color.value} />
        </div>
      </>
    )
  );
};

export default SbStoryShowcase;
