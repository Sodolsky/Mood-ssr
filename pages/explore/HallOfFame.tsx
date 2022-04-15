import { NextPage } from "next/types";
import { HallOfFame } from "../../components/HallOfFame";
import { useLoginRedirect } from "../../components/hooks/useLoginRedirect";
import { UIWrapper } from "../../components/UIWrapper";

export const HallOfFamePage: NextPage = () => {
  const { authStatus } = useLoginRedirect();

  return authStatus ? (
    <UIWrapper>
      <HallOfFame />
    </UIWrapper>
  ) : null;
};
export default HallOfFamePage;
