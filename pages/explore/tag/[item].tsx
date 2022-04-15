import { NextPage } from "next";
import { useLoginRedirect } from "../../../components/hooks/useLoginRedirect";
import { Tags } from "../../../components/Tags";
import { UIWrapper } from "../../../components/UIWrapper";

const TagPage: NextPage = () => {
  const { authStatus } = useLoginRedirect();

  return authStatus ? (
    <UIWrapper>
      <Tags />
    </UIWrapper>
  ) : null;
};
export default TagPage;
