import { ReactElement } from "react";
import { useAccordionButton } from "react-bootstrap";
interface CustomToggleInterface {
  eventKey: string;
  children: ReactElement;
}
export const CustomToggle: React.FC<CustomToggleInterface> = ({
  children,
  eventKey,
}) => {
  const openAccordion = useAccordionButton(eventKey);
  return (
    <button onClick={openAccordion} className="CustomToggle">
      {children}
    </button>
  );
};
