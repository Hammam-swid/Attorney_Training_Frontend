export function parseActivityStatusClassName(status: string) {
  switch (status) {
    case "قيد التجهيز":
      return "bg-yellow-500/20 text-yellow-500";
    case "نشطة":
      return "bg-primary/20 text-primary";
    case "مكتملة":
      return "bg-green-500/20 text-green-500";
    default:
      return "bg-gray-500/20 text-gray-500";
  }
}
