"use client";

import { uploadToS3 } from "@/lib/s3";
import { CircleArrowDown, Loader2, RocketIcon } from "lucide-react";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

function FileUploader() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      return response.data;
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    //bigger than 10mb s3 me upload nhi krna
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large");
      return;
    }

    try {
      setUploading(true);
      const data = await uploadToS3(file);
      if (!data?.file_key || !data?.file_name) {
        toast.error("Something went wrong.");
        return;
      }

      mutate(data, {
        onSuccess: ({ chat_id }) => {
          toast.success("Chat created!");
          router.push(`/chat/${chat_id}`);
        },
        onError: (error) => {
          toast.error("Something went wrong.");
          console.error(error);
        },
      });
    } catch (error) {
      console.log(error);
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isFocused, isDragAccept } =
    useDropzone({
      accept: { "application/pdf": [".pdf"] },
      maxFiles: 1,
      onDrop,
    });

  return (
    <div className="flex flex-col items-center max-w-7xl mx-auto">
      <div
        {...getRootProps()}
        className={`p-10 border-2 border-dashed mt-10 w-[90%] border-indigo-600 text-indigo-600 rounded-lg h-96 flex justify-center items-center ${
          isFocused || isDragAccept ? "bg-indigo-300" : "bg-indigo-100"
        } cursor-pointer`}
      >
        <input {...getInputProps()} />
        {uploading || isPending ? (
          <div className="flex flex-col gap-3 justify-center items-center">
            <Loader2 className="size-10 text-indigo-600 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">
              Spilling tea to GPT...
            </p>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center">
            {isDragActive ? (
              <>
                <RocketIcon className="h-20 w-20 animate-ping" />
                <p>Drop the files here ...</p>
              </>
            ) : (
              <>
                <CircleArrowDown className="h-20 w-20 animate-bounce" />
                <p>Drag 'n' drop some files here, or click to select files</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUploader;
