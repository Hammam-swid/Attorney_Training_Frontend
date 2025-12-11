import React from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleTheme } from "@/store/themeSlice";
import ProfileForm from "@/components/ProfileForm";
import ChangePasswordForm from "@/components/ChangePasswordForm";

const Account: React.FC = () => {
  const theme = useAppSelector((state) => state.theme);
  const dispatch = useAppDispatch();

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <div className="">
      <div className="">
        <div className="flex justify-between items-center mb-8">
          <Button
            onClick={handleThemeToggle}
            variant="outline"
            size="icon"
            className="rounded-full transition-all duration-300 ease-in-out"
          >
            {theme.darkMode ? (
              <Moon className="transition-transform duration-300 rotate-180 scale-100" />
            ) : (
              <Sun className="transition-transform duration-300 rotate-0 scale-100" />
            )}
            <span className="sr-only">تبديل الوضع الداكن</span>
          </Button>
        </div>

        <ProfileForm />
        <ChangePasswordForm />
        {/* {user?.role === "admin" && <AddUserForm />} */}
      </div>
    </div>
  );
};

export default Account;
