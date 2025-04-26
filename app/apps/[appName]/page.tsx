import { getAppNames } from "@/lib/imagekit";
import { AppsPageClient } from "./AppsPageClient";

type Params = Promise<{ appName: string }>

export default async function AppImagesPage(props: {
  params: Params
}) {
  const params = await props.params
  const appName = decodeURIComponent(params.appName);
  return <AppsPageClient appName={appName} />;
}

// Static generation of appName params for export
export async function generateStaticParams() {
  try {
    const appNames = await getAppNames(); // use your utility
    return appNames.map((appName) => ({
      appName: encodeURIComponent(appName),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}
