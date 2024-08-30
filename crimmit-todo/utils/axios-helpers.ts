import { ROOT_API } from "../api";
async function verifyToken(token: string) {
  return (
    await ROOT_API.post(
      "/auth/verify-token",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
  ).data?.user;
}

export { verifyToken };
