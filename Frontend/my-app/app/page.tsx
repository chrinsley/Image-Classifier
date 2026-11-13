
"use client";

import { API } from "@/api/api";
import { ChangeEvent, useState } from "react";
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
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle image selection
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    // Release the previous preview URL
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }

    setFileName(file.name);
    setSelectedFile(file);
    setSelectedImage(URL.createObjectURL(file));
  };

  // Upload image and get prediction
  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please select an image first.");
      return;
    }

    const formData = new FormData();

    formData.append("file", selectedFile);
    formData.append("name", selectedFile.name);

    try {
      setLoading(true);

      const response = await axios.post(
        `${API}imageclassifier/`,
        formData
      );

      setPrediction(response.data);

    } catch (error: unknown) {
      console.error("Upload failed:", error);

      if (axios.isAxiosError(error)) {
        console.error("Response error:", error.response?.data);

        alert(
          `Upload failed: ${
            JSON.stringify(error.response?.data) || error.message
          }`
        );
      } else if (error instanceof Error) {
        alert("Upload failed: " + error.message);
      } else {
        alert("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Remove selected image
  const handleRemove = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }

    setSelectedImage(null);
    setSelectedFile(null);
    setFileName(null);
  };

  // Start a new classification
  const handleClassifyAnother = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }

    setPrediction(null);
    setSelectedImage(null);
    setSelectedFile(null);
    setFileName(null);
  };

  // Build image URL returned by backend
  const getPredictionImage = () => {
    if (!prediction?.data?.image) return "";

    return new URL(prediction.data.image, API).toString();
  };

  // ============================
  // PREDICTION RESULTS PAGE
  // ============================

  if (prediction) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-12 sm:px-6">

        <div className="mx-auto max-w-5xl">

          {/* Header */}
          <div className="mb-10 text-center">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">

              <span className="h-2 w-2 rounded-full bg-emerald-400" />

              Classification completed

            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Analysis Results
            </h1>

            <p className="mt-3 text-slate-400">
              Your image has been successfully analyzed by our AI model.
            </p>

          </div>

          {/* Result Card */}
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl shadow-black/20">

            <div className="grid md:grid-cols-2">

              {/* Image Section */}
              <div className="bg-slate-100 p-5 sm:p-8">

                <div className="mb-4 flex items-center justify-between">

                  <h2 className="font-semibold text-slate-800">
                    Uploaded Image
                  </h2>

                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                    Image preview
                  </span>

                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">

                  <img
                    src={getPredictionImage()}
                    alt="Classified image"
                    className="h-72 w-full object-cover sm:h-96"
                  />

                </div>

                <p className="mt-4 text-sm text-slate-500">
                  Image processed successfully.
                </p>

              </div>

              {/* Prediction Information */}
              <div className="flex flex-col justify-center p-6 sm:p-10">

                <div className="mb-6">

                  {/* Icon */}
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                      className="h-7 w-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>

                  </div>

                  <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
                    AI Prediction
                  </p>

                  <h2 className="mt-3 break-words text-3xl font-bold text-slate-900 sm:text-4xl">
                    {prediction.prediction}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Our image classification model identified the uploaded
                    image as the category displayed above.
                  </p>

                </div>

                {/* Classification Status */}
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">

                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
                    Classification status
                  </p>

                  <div className="mt-2 flex items-center gap-2">

                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                    <span className="font-semibold text-slate-800">
                      Successfully classified
                    </span>

                  </div>

                </div>

                {/* New Classification Button */}
                <button
                  type="button"
                  onClick={handleClassifyAnother}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl"
                >

                  <span>Classify another image</span>

                  <span>→</span>

                </button>

                <p className="mt-4 text-center text-xs text-slate-400">
                  Powered by AI Image Classification
                </p>

              </div>

            </div>

          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-slate-500">
            AI Image Classification System · Analysis Results
          </p>

        </div>

      </main>
    );
  }

  // ============================
  // IMAGE UPLOAD PAGE
  // ============================

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-12">

      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="mb-8 text-center">

          <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/20 text-3xl text-indigo-300 ring-1 ring-indigo-400/30">
            ✦
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-300">
            AI Image Classifier
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Discover your image
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Upload an image and let artificial intelligence identify
            what is inside it.
          </p>

        </div>

        {/* Upload Card */}
        <div className="rounded-3xl border border-white/10 bg-white p-6 shadow-2xl shadow-black/20 sm:p-8">

          {/* Card Heading */}
          <div className="mb-6">

            <h2 className="text-lg font-bold text-slate-900">
              Upload an image
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select an image from your device to get started.
            </p>

          </div>

          {/* File Input */}
          <label
            htmlFor="image-upload"
            className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50 px-5 py-10 text-center transition hover:border-indigo-400 hover:bg-indigo-100"
          >

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl text-indigo-600 shadow-sm transition group-hover:scale-110">
              ↑
            </div>

            <span className="text-base font-semibold text-indigo-700">
              Choose an image
            </span>

            <span className="mt-2 text-xs text-slate-500">
              PNG, JPG, JPEG or other image formats
            </span>

            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />

          </label>

          {/* File Name */}
          {fileName && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-lg">
                🖼️
              </div>

              <div className="min-w-0 flex-1">

                <p className="truncate text-sm font-semibold text-slate-800">
                  {fileName}
                </p>

                <p className="text-xs text-emerald-600">
                  Image selected successfully
                </p>

              </div>

              <span className="text-emerald-500">✓</span>

            </div>
          )}

          {/* Image Preview */}
          {selectedImage ? (

            <div className="mt-6">

              <div className="mb-3 flex items-center justify-between">

                <h3 className="text-sm font-semibold text-slate-800">
                  Image Preview
                </h3>

                <span className="text-xs text-slate-400">
                  Ready for analysis
                </span>

              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

                <img
                  src={selectedImage}
                  alt="Selected image preview"
                  className="h-72 w-full object-cover"
                />

              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex gap-3">

                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={loading}
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Remove
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (
                    <span className="flex items-center justify-center gap-2">

                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Analyzing...

                    </span>
                  ) : (
                    "Analyze Image →"
                  )}

                </button>

              </div>

            </div>

          ) : (

            /* Empty Preview */
            <div className="mt-6 flex h-56 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-center">

              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-2xl text-slate-500">
                🖼️
              </div>

              <p className="text-sm font-semibold text-slate-600">
                No image selected
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Your image preview will appear here.
              </p>

            </div>

          )}

          {/* Footer Information */}
          <div className="mt-7 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-xs text-slate-400">

            <span>✦</span>

            <span>AI-powered image recognition</span>

          </div>

        </div>

        {/* Page Footer */}
        <p className="mt-7 text-center text-xs text-slate-500">
          Intelligent Image Classification System
        </p>

      </div>

    </main>
  );
}
