import { NotFoundState } from "@/components/shared/not-found-state";
import { SerifAccent } from "@/components/shared/serif-accent";

export default function PropertyNotFound() {
  return (
    <NotFoundState
      title={
        <>
          This home isn&apos;t <SerifAccent>on the market</SerifAccent>
        </>
      }
      description="The listing may have been removed, or the link is incorrect."
    />
  );
}
