import { NextPage } from "next";
import Explore from "../../components/Explore";
import { useLoginRedirect } from "../../components/hooks/useLoginRedirect";
import { UIWrapper } from "../../components/UIWrapper";

const ExplorePage: NextPage = () => {
  const { authStatus } = useLoginRedirect();
  return authStatus ? (
    <UIWrapper>
      <Explore />
    </UIWrapper>
  ) : null;
};
export default ExplorePage;
