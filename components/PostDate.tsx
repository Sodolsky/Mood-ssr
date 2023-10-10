import moment from "moment";
import React, { useState } from "react";
interface PostDateI {
  date: string;
}
export const PostDate: React.FC<PostDateI> = ({ date }) => {
  const myDate = moment(date, "DD-MM-YYYY  HH:mm:ss").toDate();

  const [displayRawDate, setDisplayRawDate] = useState<boolean>(false);
  return (
    <span
      className="WhenPostWasAdded"
      onClick={() => setDisplayRawDate((prev) => !prev)}
    >
      {!displayRawDate
        ? moment(myDate).fromNow()
        : moment(myDate).toLocaleString()}
    </span>
  );
};
