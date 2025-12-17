export const openChatBoxPopup = (
  roomId: string,
  roomName: string,
  roomAvatar?: string
) => {
  const event = new CustomEvent("openChatBox", {
    detail: { roomId, roomName, roomAvatar },
  });
  window.dispatchEvent(event);
};
