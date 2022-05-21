import { useContext } from "react";
import { StoryType } from "../types";
import { AppContext } from "../App";
import { useNavigate } from "react-router-dom";

type ItemProps = {
  item: StoryType;
};

const Item = ({
  item: { title, url, author, num_comments, objectID, ...props },
}: ItemProps) => {
  const ctx = useContext(AppContext);
  const item = { title, url, author, num_comments, objectID, ...props };
  const navigate = useNavigate();

  function handleClick() {
    navigate("/RawContent", { state: { item: item } });
  }

  return (
    <tr>
      <td className="itemTitle" onClick={handleClick} style={{cursor:"pointer"}}>
        {title}
      </td>
      <td className="itemUrl">{url}</td>
      <td>{author}</td>
      <td>{num_comments}</td>
      <td className="deleteButton" onClick={() => ctx?.onClickDelete(objectID)}>
        Delete
      </td>
    </tr>
  );
};

export default Item;
