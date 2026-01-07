export async function createPeerConnection() {
  const res = await fetch(
    `https://bondy.metered.live/api/v1/turn/credentials?apiKey=${process.env.NEXT_PUBLIC_METERED_API_KEY}`
  );
  const iceServers = await res.json();

  return new RTCPeerConnection({ iceServers });
}
