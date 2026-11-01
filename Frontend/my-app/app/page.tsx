"use client";

import { API } from "@/api/api";
import { ChangeEvent, useState } from "react";
import { ImageType } from "../image";
import axios from "axios";

type Prediction = {
  message: string;
  prediction: string;
  data: {
    id: string;
    name: string;
    image: string;
  };
};
export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState< ImageType | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log("Selected file:", file);
    
    if (!file) {
      return;
    }

    
    

    

    setFileName(file ? { name: file.name, image: "" } : null);
    setSelectedFile(file);
    setSelectedImage(URL.createObjectURL(file));

  }

  
  const handlesubmit = async () => {
    if (!selectedFile) {
      console.log("No file selected");
      return;
    }
    const data = new FormData()
    
    data.append('file', selectedFile)
    data.append('name', selectedFile.name)

    try {
      const response = await axios.post(`${API}imageclassifier/`, data)
      const d = response.data
      console.log("Upload successful:", d)
      setPrediction(response.data)
      alert("Image uploaded successfully!")
    } catch (error:unknown) {
      console.error("Upload failed:", error)
      if (axios.isAxiosError(error)) {
        console.error("Response error:", error.response?.data)
        alert(`Upload failed: ${JSON.stringify(error.response?.data)}`)
      } else {
        if(error instanceof Error)
        alert("Upload failed: " + error.message)
      }
    }
  };

  if(prediction){
    return(
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900">Prediction:</h2>
        <p className="text-lg text-indigo-600">{prediction.prediction}</p>
        <img src={new URL(prediction.data.image, API).toString()} alt="Predicted image" className="mx-auto mt-4 h-48 w-48 object-cover rounded-lg border border-slate-200" />
      </div>
    )
  }

  

  const handleRemove = () => {
    setSelectedImage(null);
    setFileName(null);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-indigo-50 p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
            Image Upload
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            Upload your image
          </h1>
        </div>

        <label
          htmlFor="image-upload"
          className="mt-8 flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50 px-4 py-5 text-center transition hover:border-indigo-400 hover:bg-indigo-100"
        >
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <span className="text-base font-medium text-indigo-700">
            Choose image
          </span>
        </label>

        <p className="mt-3 text-sm text-slate-500">{fileName?.name}</p>

        {selectedImage ? (
          <div className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <img
                src={selectedImage}
                alt="Selected preview"
                className="h-72 w-full object-cover"
              />
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={handleRemove}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Remove
              </button>
              <button
                type="button"
                onClick={handlesubmit}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
              >
                Upload
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex h-72 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-center text-slate-400">
            <div>
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-2xl">
                ⤴
              </div>
              <p className="text-sm">No image selected yet</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
