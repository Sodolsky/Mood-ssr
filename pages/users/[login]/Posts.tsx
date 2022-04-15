import { NextPage } from "next";
import { useLoginRedirect } from "../../../components/hooks/useLoginRedirect";
import { UIWrapper } from "../../../components/UIWrapper";
import { UserProfilePosts } from "../../../components/UserProfilePosts";

export const UserProfilePostsPage: NextPage = () => {
  const { authStatus } = useLoginRedirect();
  return authStatus ? (
    <UIWrapper>
      <UserProfilePosts />
    </UIWrapper>
  ) : null;
};
export default UserProfilePostsPage;
