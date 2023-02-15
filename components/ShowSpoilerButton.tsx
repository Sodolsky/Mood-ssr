import { Button } from "antd";

interface ShowSpoilerButtonProps {
  showSpoiler: () => void;
}
export const ShowSpoilerButton: React.FC<ShowSpoilerButtonProps> = ({
  showSpoiler,
}) => {
  return (
    <Button type="dashed" onClick={showSpoiler}>
      Show Spoiler
    </Button>
  );
};
