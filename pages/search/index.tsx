import { NextPage } from "next";
import { useLoginRedirect } from "../../components/hooks/useLoginRedirect";
import { SearchComponent } from "../../components/SearchComponent";
import { UIWrapper } from "../../components/UIWrapper";

const Search: NextPage = () => {
  const { authStatus } = useLoginRedirect();
  return authStatus ? (
    <UIWrapper>
      <SearchComponent />
    </UIWrapper>
  ) : null;
};
export default Search;
