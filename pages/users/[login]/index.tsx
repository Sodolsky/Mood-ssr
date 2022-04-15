import { NextPage } from "next";
import { useLoginRedirect } from "../../../components/hooks/useLoginRedirect";
import { UIWrapper } from "../../../components/UIWrapper";
import UserProfile from "../../../components/UserProfile";

const UserProfilePage: NextPage = () => {
  const { authStatus } = useLoginRedirect();

  return authStatus ? (
    <UIWrapper>
      <UserProfile />
    </UIWrapper>
  ) : null;
};
export default UserProfilePage;
