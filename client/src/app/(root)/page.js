import { metadata } from '../utils/constants';
import Home from '../views/Home';


export async function generateMetadata() {
  return metadata
}

export default function Page() {
  return <Home />;
}
