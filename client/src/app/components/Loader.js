import { LoadingOutlined } from "@ant-design/icons";

export function BtnLoader({ className = "" }) {
  return <LoadingOutlined spin className={`text-white ${className}`} />;
}

export function Loader() {
  return <LoadingOutlined spin className={`text-4xl text-white`} />;
}
