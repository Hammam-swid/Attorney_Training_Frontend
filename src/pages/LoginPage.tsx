import { LoginForm } from "@/components/login-form";
import { useAppSelector } from "@/store/hooks";
import { useEffect } from "react";

export default function LoginPage() {
  const theme = useAppSelector((state) => state.theme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme.darkMode) {
      root?.classList.add("dark");
    } else {
      root?.classList.remove("dark");
    }
  }, [theme]);
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-primary lg:block">
        <img
          src="/center-logo.png"
          alt="logo image"
          className="absolute p-16 2xl:p-60 inset-0 h-full w-full dark:brightness-[0.7] object-cover"
        />
      </div>
    </div>
  );
}
