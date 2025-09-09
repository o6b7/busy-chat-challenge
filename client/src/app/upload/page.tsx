"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadResumeFile } from "../../lib/api";
import { DocumentArrowUpIcon, CloudArrowUpIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; message: string }>({ 
    type: "idle", 
    message: "" 
  });
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      setStatus({ type: "error", message: "❌ Please select a file first." });
      return;
    }
    
    try {
      setStatus({ type: "loading", message: "Uploading..." });
      const res = await uploadResumeFile(file);
      setStatus({ type: "success", message: `✅ Successfully uploaded: ${res.originalName}` });
      setFile(null);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "❌ Upload failed. Please try again." });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.name.endsWith(".docx"))) {
      setFile(droppedFile);
      setStatus({ type: "idle", message: "" });
    } else {
      setStatus({ type: "error", message: "❌ Please upload only PDF or DOCX files." });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus({ type: "idle", message: "" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <motion.div 
            className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <DocumentArrowUpIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Resume</h1>
          <p className="text-gray-600">
            Upload resumes in <span className="font-semibold text-blue-600">PDF</span> or{" "}
            <span className="font-semibold text-blue-600">Word (DOCX)</span> format for AI-powered analysis.
          </p>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            dragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 bg-white"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-input")?.click()}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <motion.div
            animate={{ 
              y: dragOver ? [-5, 5, -5] : 0 
            }}
            transition={{ 
              duration: 0.5, 
              repeat: dragOver ? Infinity : 0 
            }}
          >
            <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          </motion.div>
          <p className="text-lg font-medium text-gray-700 mb-2">
            {file ? file.name : "Drag & drop your file here"}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            or click to browse your files
          </p>
          <input
            id="file-input"
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          {/* Animated background when dragging over */}
          <AnimatePresence>
            {dragOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-blue-100 rounded-2xl -z-10"
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* File Info */}
        <AnimatePresence>
          {file && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <DocumentArrowUpIcon className="w-5 h-5 text-blue-600" />
                  </motion.div>
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setFile(null)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-red-600 hover:text-red-700 text-sm font-medium p-1 rounded-full hover:bg-red-100"
                >
                  <XMarkIcon className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onClick={handleUpload}
          disabled={status.type === "loading" || !file}
          className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 relative overflow-hidden"
        >
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700"
            initial={{ x: "-100%" }}
            whileHover={{ x: 0 }}
            transition={{ duration: 0.5 }}
            style={{ zIndex: -1 }}
          />
          
          {status.type === "loading" ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              ></motion.div>
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <CloudArrowUpIcon className="w-5 h-5" />
              <span>Upload Resume</span>
            </>
          )}
        </motion.button>

        {/* Status Message */}
        <AnimatePresence>
          {status.message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={`mt-4 rounded-lg p-4 ${
                status.type === "success" 
                  ? "bg-green-50 text-green-700 border border-green-200" 
                  : status.type === "error"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              <div className="flex items-center">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="mr-2"
                >
                  {status.type === "success" ? "✅" : status.type === "error" ? "❌" : "⏳"}
                </motion.span>
                <p className="text-sm font-medium">{status.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-200"
        >
          <h3 className="font-semibold text-gray-900 mb-3">💡 Upload Tips</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <motion.li 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >• Ensure the resume is in PDF or DOCX format</motion.li>
            <motion.li 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >• Maximum file size: 10MB</motion.li>
            <motion.li 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >• For best results, use resumes with clear formatting</motion.li>
            <motion.li 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.8 }}
            >• The AI will automatically parse and analyze the content</motion.li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}