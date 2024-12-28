"use client";

import React, { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";

const Settings: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [userData, setUserData] = useState({
    fullName: "زياد",
    email: "zyad@example.com",
    password: "",
    phone: "11111111",
  });

  useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleThemeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            الإعدادات
          </h1>
          <Button
            onClick={handleThemeToggle}
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full transition-all duration-300 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {darkMode ? (
              <Sun className="h-6 w-6 text-yellow-500 transition-transform duration-300 rotate-0 scale-100" />
            ) : (
              <Moon className="h-6 w-6 text-slate-900 dark:text-white transition-transform duration-300 rotate-180 scale-100" />
            )}
            <span className="sr-only">تبديل الوضع الداكن</span>
          </Button>
        </div>

        <Card className="w-full shadow-xl bg-white dark:bg-gray-800">
          <CardHeader className="space-y-1 bg-gray-50 dark:bg-gray-700 rounded-t-lg">
            <CardTitle className="text-3xl font-bold text-right text-gray-900 dark:text-white">
              الملف الشخصي
            </CardTitle>
            <CardDescription className="text-right text-lg text-gray-600 dark:text-gray-300">
              قم بتحديث معلومات حسابك وتفضيلاتك
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <form className="space-y-6">
              <div className="flex flex-col space-y-2">
                <Label
                  htmlFor="fullName"
                  className="text-right text-lg font-medium text-gray-700 dark:text-gray-200"
                >
                  الاسم الكامل
                </Label>
                <div className="relative">
                  <Input
                    id="fullName"
                    name="fullName"
                    value={userData.fullName}
                    onChange={handleInputChange}
                    className="pl-12 text-right text-lg py-6 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    dir="rtl"
                  />
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Label
                  htmlFor="email"
                  className="text-right text-lg font-medium text-gray-700 dark:text-gray-200"
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
                    className="pl-12 text-right text-lg py-6 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    dir="rtl"
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Label
                  htmlFor="password"
                  className="text-right text-lg font-medium text-gray-700 dark:text-gray-200"
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
                    className="pl-12 text-right text-lg py-6 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    dir="rtl"
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-right text-lg font-medium text-gray-700 dark:text-gray-200"
                >
                  رقم الهاتف
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    name="phone"
                    value={userData.phone}
                    onChange={handleInputChange}
                    className="pl-12 text-right text-lg py-6 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    dir="rtl"
                  />
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="bg-gray-50 dark:bg-gray-700 rounded-b-lg">
            <Button
              onClick={handleSubmit}
              className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300"
            >
              حفظ التغييرات
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
