import { metadata } from "../../utils/constants"
import Gallery from "../../views/Gallery"


export async function generateMetadata() {
  return metadata
}

function page() {
  return (
    <Gallery />
  )
}

export default page