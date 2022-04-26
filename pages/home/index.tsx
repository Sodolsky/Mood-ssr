import { NextPage } from "next";
import React from "react";
import { useLoginRedirect } from "../../components/hooks/useLoginRedirect";
import { MainContent } from "../../components/MainContent";
import { UIWrapper } from "../../components/UIWrapper";

const Home: NextPage = () => {
  const { authStatus } = useLoginRedirect();
  return authStatus ? (
    <UIWrapper>
      <MainContent />
    </UIWrapper>
  ) : null;
};
export default Home;
