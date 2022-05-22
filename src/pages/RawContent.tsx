import { useLocation } from "react-router-dom";

const RawContent = () => {
  const location: any = useLocation();
  console.log("Location is", location);

  return (
    <div>
      <pre>{JSON.stringify(location.state?.item, null, 2)}</pre>
    </div>
  );
};

export default RawContent;
