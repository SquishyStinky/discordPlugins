import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { React } from "@vendetta/metro/common";

const MessageContent = findByProps("MessageContent");

let patch;

export default {
  onLoad() {
    patch = after("default", MessageContent, ([args], res) => {
      const channel = args?.channel;
      const isNSFW = channel?.nsfw;

      if (!isNSFW) return;

      // Find image elements and wrap with blur
      const elements = React.Children.toArray(res?.props?.content);
      res.props.content = elements.map(child => {
        if (child?.type?.displayName === "MessageAttachment" && child.props?.attachment?.content_type?.startsWith("image")) {
          return React.cloneElement(child, {
            style: {
              ...child.props.style,
              filter: "blur(12px)",
              cursor: "pointer"
            },
            onClick: () => {
              child.props.style.filter = "none";
            }
          });
        }
        return child;
      });
    });
  },

  onUnload() {
    patch();
  }
};
