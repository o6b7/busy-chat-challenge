"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadResumeFile, listResumes, deleteResume } from "../../lib/api";
import { 
  DocumentArrowUpIcon, 
  CloudArrowUpIcon, 
  XMarkIcon, 
  TrashIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import { Resume } from "../../types";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  interface Status {
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }

  const [status, setStatus] = useState<Status>({ 
    type: "idle", 
    message: "" 
  });
  const [dragOver, setDragOver] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const data = await listResumes();
      setResumes(data);
    } catch (err) {
      console.error("Failed to load resumes:", err);
      setStatus({ type: "error", message: "Failed to load resumes" });
    }
  };

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
      await loadResumes(); // Refresh the list
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "❌ Upload failed. Please try again." });
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    setIsDeleting(resumeId);
    try {
      await deleteResume(resumeId);
      setStatus({ type: "success", message: "✅ Resume deleted successfully" });
      await loadResumes(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete resume:", err);
      setStatus({ type: "error", message: "❌ Failed to delete resume" });
    } finally {
      setIsDeleting(null);
      setShowDeleteModal(null);
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
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
          <span className="font-semibold text-blue-600">PDF</span> or{` `}
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
                      {formatFileSize(file.size)}
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

        {/* Resume List */}
        {resumes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-600" />
              Uploaded Resumes
            </h2>
            
            <div className="grid gap-4 max-h-96 overflow-y-auto p-1">
              {resumes.map((resume) => (
                <motion.div
                  key={resume.resumeId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 truncate">{resume.originalName}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 text-sm text-gray-500 mt-1">
                          <div className="flex items-center">
                            <UserIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{resume.candidateName || "Unknown"}</span>
                          </div>
                          <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{formatDate(resume.uploadedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowDeleteModal(resume.resumeId)}
                      disabled={isDeleting === resume.resumeId}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0 ml-2"
                      title="Delete resume"
                    >
                      {isDeleting === resume.resumeId ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full"
                        />
                      ) : (
                        <TrashIcon className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-200"
        >
          <h3 className="font-semibold text-gray-900 mb-3">💡 Upload Tips</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <motion.li 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >• Ensure the resume is in PDF or DOCX format</motion.li>
            <motion.li 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >• Maximum file size: 10MB</motion.li>
            <motion.li 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.8 }}
            >• For best results, use resumes with clear formatting</motion.li>
            <motion.li 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.9 }}
            >• The AI will automatically parse and analyze the content</motion.li>
          </ul>
        </motion.div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TrashIcon className="w-5 h-5 text-red-500 mr-2" />
                  Confirm Delete
                </h3>
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isDeleting !== null}
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the resume &quot;{resumes.find(r => r.resumeId === showDeleteModal)?.originalName}&quot;? 
                This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  disabled={isDeleting !== null}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteResume(showDeleteModal)}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  disabled={isDeleting !== null}
                >
                  {isDeleting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <TrashIcon className="w-4 h-4" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}