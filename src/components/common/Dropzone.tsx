import { cn } from "@/lib/utils";
import { File } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface Props {
  onDrop: (acceptedFiles: File[]) => void;
  accept?: string;
  file: File | null;
}

export default function Dropzone({ accept, onDrop, file }: Props) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed border-gray-300 bg-muted rounded-md p-6 space-y-2",
        file && "border-primary/60",
        isDragActive && "border-primary",
      )}
    >
      <input {...getInputProps()} accept={accept} />
      <File className="mx-auto w-10 h-10" />
      {file ? (
        <p className="text-center">تم اختيار {file.name}</p>
      ) : (
        <p className="text-center">قم بسحب الملفات هنا أو انقر للاختيار</p>
      )}
    </div>
  );
}
