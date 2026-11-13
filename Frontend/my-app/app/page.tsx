
"use client";

import { API } from "@/api/api";
import { ChangeEvent, useEffect, useState } from "react";
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

  // Release preview URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);

  // Handle image selection
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    setPrediction(null);
    setFileName(file.name);
    setSelectedFile(file);
    setSelectedImage(URL.createObjectURL(file));

    // Allow selecting the same image again
    event.target.value = "";
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
    setSelectedImage(null);
    setSelectedFile(null);
    setFileName(null);
    setPrediction(null);
  };

  // Start a new classification
  const handleClassifyAnother = () => {
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
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#030712] via-[#0B1930] to-[#061D35] px-4 py-12 sm:px-6">

        {/* Background Glow Effects */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-5xl">

          {/* Header */}
          <div className="mb-10 text-center">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300 shadow-lg shadow-cyan-500/10">

              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />

              AI Analysis Completed

            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Classification{" "}
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Results
              </span>
            </h1>

            <p className="mt-4 text-sm text-slate-400 sm:text-base">
              Your image has been successfully analyzed by our AI model.
            </p>

          </div>

          {/* Result Card */}
          <div className="overflow-hidden rounded-3xl border border-cyan-400/20 bg-white shadow-2xl shadow-cyan-950/30">

            <div className="grid md:grid-cols-2">

              {/* Image Section */}
              <div className="bg-slate-50 p-5 sm:p-8">

                <div className="mb-4 flex items-center justify-between">

                  <h2 className="font-semibold text-slate-800">
                    Uploaded Image
                  </h2>

                  <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                    AI Input
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
                  Image successfully processed by the classification model.
                </p>

              </div>

              {/* Prediction Information */}
              <div className="flex flex-col justify-center p-6 sm:p-10">

                {/* AI Icon */}
                <div className="mb-6">

                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 text-cyan-700 shadow-lg shadow-cyan-100">

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                      className="h-8 w-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>

                  </div>

                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600">
                    AI Prediction
                  </p>

                  <h2 className="mt-3 break-words text-3xl font-bold text-slate-900 sm:text-4xl">
                    {prediction.prediction}
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    Our trained image classification model identified the
                    uploaded image as the category displayed above.
                  </p>

                </div>

                {/* Classification Status */}
                <div className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-blue-50 p-5">

                  <p className="text-xs font-bold uppercase tracking-wider text-cyan-700">
                    Classification Status
                  </p>

                  <div className="mt-3 flex items-center gap-3">

                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      ✓
                    </span>

                    <div>
                      <p className="font-semibold text-slate-800">
                        Successfully Classified
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        AI model completed the prediction.
                      </p>
                    </div>

                  </div>

                </div>

                {/* New Classification Button */}
                <button
                  type="button"
                  onClick={handleClassifyAnother}
                  className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-4 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-1 hover:from-cyan-500 hover:to-blue-500 hover:shadow-xl"
                >

                  <span>Classify Another Image</span>

                  <span className="text-xl">→</span>

                </button>

                <p className="mt-5 text-center text-xs text-slate-400">
                  Powered by AI Image Classification
                </p>

              </div>

            </div>

          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-slate-500">
            AI Image Classification System · Intelligent Image Recognition
          </p>

        </div>

      </main>
    );
  }

  // ============================
  // IMAGE UPLOAD PAGE
  // ============================

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#030712] via-[#0B1930] to-[#061D35] px-4 py-12">

      {/* Background Glow Effects */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="relative w-full max-w-xl">

        {/* Header */}
        <div className="mb-9 text-center">

          {/* AI Icon */}
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/30 bg-cyan-400/10 text-4xl text-cyan-300 shadow-xl shadow-cyan-500/10">

            ✦

          </div>

          <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">
            Artificial Intelligence
          </p>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">

            Image{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Classifier
            </span>

          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-400 sm:text-base">
            Upload an image and let our trained AI model intelligently
            recognize and classify its contents.
          </p>

          {/* AI Status */}
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-xs font-medium text-emerald-300">

            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

            AI Classification System Ready

          </div>

        </div>

        {/* Upload Card */}
        <div className="rounded-3xl border border-cyan-400/20 bg-white p-6 shadow-2xl shadow-cyan-950/30 sm:p-8">

          {/* Card Heading */}
          <div className="mb-7">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 text-xl text-cyan-700">
                ✧
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Upload Your Image
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Start your AI-powered image analysis.
                </p>
              </div>

            </div>

          </div>

          {/* File Input */}
          <label
            htmlFor="image-upload"
            className={`group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 px-5 py-10 text-center transition ${
              loading
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer hover:border-cyan-400 hover:from-cyan-100 hover:to-blue-100"
            }`}
          >

            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl text-cyan-600 shadow-md shadow-cyan-100 transition group-hover:scale-110">
              ↑
            </div>

            <span className="text-base font-bold text-slate-800">
              Choose an Image
            </span>

            <span className="mt-2 text-xs text-slate-500">
              Drag your imagination into AI recognition
            </span>

            <span className="mt-3 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-700 shadow-sm">
              PNG · JPG · JPEG · WEBP
            </span>

            <input
              id="image-upload"
              type="file"
              accept="image/*"
              disabled={loading}
              className="hidden"
              onChange={handleImageChange}
            />

          </label>

          {/* File Name */}
          {fileName && (

            <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                🖼️
              </div>

              <div className="min-w-0 flex-1">

                <p className="truncate text-sm font-semibold text-slate-800">
                  {fileName}
                </p>

                <p className="mt-1 text-xs font-medium text-emerald-600">
                  Image selected successfully
                </p>

              </div>

              <span className="text-lg text-emerald-500">✓</span>

            </div>

          )}

          {/* Image Preview */}
          {selectedImage ? (

            <div className="mt-7">

              <div className="mb-3 flex items-center justify-between">

                <h3 className="text-sm font-bold text-slate-800">
                  Image Preview
                </h3>

                <span className="flex items-center gap-2 text-xs font-medium text-cyan-600">

                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-500" />

                  Ready for AI Analysis

                </span>

              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-1">

                <img
                  src={selectedImage}
                  alt="Selected image preview"
                  className="h-72 w-full rounded-xl object-cover"
                />

              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex gap-3">

                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={loading}
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:from-cyan-500 hover:to-blue-500 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (

                    <span className="flex items-center justify-center gap-2">

                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Analyzing...

                    </span>

                  ) : (

                    <>
                      Analyze Image
                      <span className="text-lg">→</span>
                    </>

                  )}

                </button>

              </div>

            </div>

          ) : (

            /* Empty Preview */
            <div className="mt-7 flex h-52 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-center">

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 text-2xl text-cyan-600">
                🖼️
              </div>

              <p className="text-sm font-bold text-slate-700">
                No Image Selected
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Your image preview will appear here.
              </p>

            </div>

          )}

          {/* Footer Information */}
          <div className="mt-7 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-xs text-slate-400">

            <span className="text-cyan-500">✦</span>

            <span>Powered by Artificial Intelligence</span>

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
