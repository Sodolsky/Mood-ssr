import algoliasearch from "algoliasearch";
import { BackTop } from "antd";
import { useContext } from "react";
import { InstantSearch, SearchBox, Hits } from "react-instantsearch-dom";
import { themeContext } from "../utils/interfaces";
import { PostPropsInteface } from "./Post";
import { SinglePost } from "./SinglePost";

const searchClient = algoliasearch(
  "OCOXGRBZTS",
  "d294f98170a1844e7a08d96897664b1e"
);
export const SearchComponent: React.FC = () => {
  const currentTheme = useContext(themeContext).theme;
  return (
    <div className="SearchDiv">
      <InstantSearch searchClient={searchClient} indexName="MOOD Posts">
        <SearchBox
          className={`${currentTheme === "dark" && "purpleBorders"}`}
        />
        <div className="searchList">
          <Hits hitComponent={HitComp} />
        </div>
        <BackTop />
      </InstantSearch>
    </div>
  );
};
interface HitInterface {
  hit: PostPropsInteface;
}
const HitComp = (hit: HitInterface) => {
  return <SinglePost {...hit.hit} />;
};
