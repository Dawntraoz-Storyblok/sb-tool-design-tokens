import { useContext } from "react";
import { ToolContext } from "@/contexts";

const SbStoryShowcase = () => {
  const { story } = useContext(ToolContext);

  return (
    story && (
      <>
        <h2>Story Information</h2>
        <div>
          <p>Story: {story.name}</p>
          <p>Slug: {story.slug}</p>
        </div>
      </>
    )
  );
};

export default SbStoryShowcase;
