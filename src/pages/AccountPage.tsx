import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { User, Mail, Lock, Phone, Sun, Moon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleTheme } from "@/store/themeSlice";
const Account: React.FC = () => {
  const [userData, setUserData] = useState({
    fullName: "زياد",
    email: "zyad@example.com",
    password: "",
    phone: "11111111",
  });
  const theme = useAppSelector((state) => state.theme);
  const dispatch = useAppDispatch();

  // useEffect(() => {
  //   const isDarkMode = localStorage.getItem("darkMode") === "true";
  //   setDarkMode(isDarkMode);
  //   if (isDarkMode) {
  //     document.documentElement.classList.add("dark");
  //   } else {
  //     document.documentElement.classList.remove("dark");
  //   }
  // }, []);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = () => {
    console.log("Updating user data:", userData);
    alert("تم تحديث بيانات المستخدم بنجاح!");
  };

  return (
    <div className="container mx-auto py-10 rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">الإعدادات</h1>
          <Button
            onClick={handleThemeToggle}
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full transition-all duration-300 ease-in-out"
          >
            {theme.darkMode ? (
              <Sun className="h-6 w-6 text-yellow-500 transition-transform duration-300 rotate-0 scale-100" />
            ) : (
              <Moon className="h-6 w-6 transition-transform duration-300 rotate-180 scale-100" />
            )}
            <span className="sr-only">تبديل الوضع الداكن</span>
          </Button>
        </div>

        <Card className="w-full shadow-xl">
          <CardHeader className="space-y-1 rounded-t-lg">
            <CardTitle className="text-3xl font-bold text-right">
              الملف الشخصي
            </CardTitle>
            <CardDescription className="text-right text-lg">
              قم بتحديث معلومات حسابك وتفضيلاتك
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <form className="space-y-6">
              <div className="flex flex-col space-y-2">
                <Label
                  htmlFor="fullName"
                  className="text-right text-lg font-medium"
                >
                  الاسم الكامل
                </Label>
                <div className="relative">
                  <Input
                    id="fullName"
                    name="fullName"
                    value={userData.fullName}
                    onChange={handleInputChange}
                    className="pl-12 text-right text-lg py-6"
                    dir="rtl"
                  />
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6" />
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Label
                  htmlFor="email"
                  className="text-right text-lg font-medium"
                >
                  البريد الإلكتروني
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    className="pl-12 text-right text-lg py-6"
                    dir="rtl"
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6" />
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Label
                  htmlFor="password"
                  className="text-right text-lg font-medium"
                >
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={userData.password}
                    onChange={handleInputChange}
                    className="pl-12 text-right text-lg py-6"
                    dir="rtl"
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6" />
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-right text-lg font-medium"
                >
                  رقم الهاتف
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    name="phone"
                    value={userData.phone}
                    onChange={handleInputChange}
                    className="pl-12 text-right text-lg py-6"
                    dir="rtl"
                  />
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6" />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSubmit}
              className="w-full text-lg py-6"
            >
              حفظ التغييرات
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Account;
