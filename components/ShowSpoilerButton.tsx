import { Button } from "antd";

interface ShowSpoilerButtonProps {
  setWasShowSpoilerClicked: React.Dispatch<React.SetStateAction<boolean>>;
}
export const ShowSpoilerButton: React.FC<ShowSpoilerButtonProps> = ({
  setWasShowSpoilerClicked,
}) => {
  return (
    <Button type="dashed" onClick={() => setWasShowSpoilerClicked(true)}>
      Show Spoiler
    </Button>
  );
};
