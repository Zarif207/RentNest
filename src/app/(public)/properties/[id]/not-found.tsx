import { PageShell } from "@/components/layout/page-shell";
import { NotFoundState } from "@/components/shared/not-found-state";
import { SerifAccent } from "@/components/shared/serif-accent";

export default function PropertyNotFound() {
  return (
    <PageShell>
      <NotFoundState
        className="py-0"
        title={
          <>
            This home isn&apos;t <SerifAccent>on the market</SerifAccent>
          </>
        }
        description="The listing may have been removed, or the link is incorrect."
      />
    </PageShell>
  );
}
