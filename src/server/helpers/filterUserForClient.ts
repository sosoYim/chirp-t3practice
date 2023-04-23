import { type User } from "@clerk/nextjs/dist/api";

export const filterUserForClient = (user: User) => {
  // id, username, profilePicture 필요한 데이터만 가져오기
  return {
    id: user.id,
    profilePicture: user.profileImageUrl,
    username: user.username,
  };
};
