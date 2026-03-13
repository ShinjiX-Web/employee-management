import { CircleAlert, CircleCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function NoticeBanner({ notice }) {
  if (!notice?.message) {
    return null;
  }

  const isError = notice.type === "error";

  return (
    <Alert className={isError ? "border-rose-200 bg-rose-50/90" : "border-emerald-200 bg-emerald-50/90"}>
      {isError ? <CircleAlert className="text-rose-600" /> : <CircleCheck className="text-emerald-600" />}
      <div>
        <AlertTitle className={isError ? "text-rose-800" : "text-emerald-800"}>
          {isError ? "Action failed" : "Action complete"}
        </AlertTitle>
        <AlertDescription className={isError ? "text-rose-700" : "text-emerald-700"}>
          {notice.message}
        </AlertDescription>
      </div>
    </Alert>
  );
}

export default NoticeBanner;
