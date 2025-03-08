import ChangePasswordForm from "./ChangePasswordForm";

export default function ChangePasswordAlert() {
  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[1000]">
      <ChangePasswordForm />
    </div>
  );
}
