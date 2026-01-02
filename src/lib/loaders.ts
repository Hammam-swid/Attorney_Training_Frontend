import { store } from "@/store";
import { Role } from "@/types";
import { roleChecker } from "./roleChecker";
import { redirect } from "react-router";

export function roleLoader(...roles: Role[]) {
  const user = store.getState().auth.user;

  if (!roleChecker(user, ...roles)) {
    return redirect("/");
  }

  return null;
}
