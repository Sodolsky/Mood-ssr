import { Empty } from "antd";
import Link from "next/link";
export const NotFoundComponent = () => {
  return (
    <div className="EmptyContainer">
      <Empty
        description={"Nie znaleźliśmy podanej strony 😥"}
        style={{ fontSize: "2rem" }}
      />
      <Link href={"/home"}>
        <button>Przejdź na stronę główną</button>
      </Link>
    </div>
  );
};
