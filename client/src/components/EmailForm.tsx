"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";
import { useSearchParams } from "next/navigation";
import { PaperAirplaneIcon, EnvelopeIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { sendEmail as logEmail } from "../lib/api"; 

export default function EmailForm() {
  const [form, setForm] = useState({ to: "", subject: "", body: "" });
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; message: string }>({ 
    type: "idle", 
    message: "" 
  });
  const [isFocused, setIsFocused] = useState({ to: false, subject: false, body: false });
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  useEffect(() => {
    const emailFromUrl = searchParams.get('to');
    if (emailFromUrl) {
      setForm(prev => ({ ...prev, to: emailFromUrl }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFocus = (field: string) => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: string) => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceId || !templateId || !publicKey) {
        setStatus({ type: "error", message: "Email service not configured properly" });
        return;
    }

    setStatus({ type: "loading", message: "Sending email..." });

    try {
        // 1. Send email via EmailJS
        await emailjs.send(
        serviceId,   // now guaranteed string
        templateId,
        {
            to_email: form.to,
            subject: form.subject,
            message: form.body,
        },
        publicKey
        );

        // 2. Log email via your backend
        await logEmail(form.to, form.subject, form.body);

        setStatus({ type: "success", message: "✅ Email sent & logged successfully!" });
        setForm({ to: "", subject: "", body: "" });

        setTimeout(() => {
        setStatus({ type: "idle", message: "" });
        }, 3000);
    } catch (err: any) {
        console.error("Error while sending/logging email:", err);
        setStatus({ type: "error", message: `❌ ${err.message || "Failed to send or log email"}` });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

    const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
        type: "spring" as const, // Add 'as const' here
        stiffness: 100,
        damping: 12
        }
    }
    };

  const buttonVariants = {
    initial: { scale: 1 },
    tap: { scale: 0.97 },
    hover: { 
      scale: 1.02,
      boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4), 0 8px 10px -6px rgba(59, 130, 246, 0.4)",
      transition: {
        duration: 0.2
      }
    }
  };

  const statusVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 }
  };

  const iconVariants = {
    hover: { rotate: 15, transition: { duration: 0.3 } }
  };

  return (
      <motion.form
        ref={formRef}
        onSubmit={handleSubmit}
        className="bg-white shadow-2xl rounded-2xl p-8 space-y-6 max-w-2xl w-full border border-gray-100"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div 
          className="text-center"
          variants={itemVariants}
        >
          <motion.div 
            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
            whileHover={{ 
              scale: 1.05,
              rotate: 5,
              transition: { duration: 0.3 }
            }}
          >
            <EnvelopeIcon className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Send Professional Email
          </h2>
          <p className="text-gray-600 mt-2">Reach out to candidates directly</p>
        </motion.div>

        {/* Form Fields */}
        <motion.div 
          className="space-y-6"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <motion.input
                type="email"
                id="to"
                name="to"
                value={form.to}
                onChange={handleChange}
                onFocus={() => handleFocus("to")}
                onBlur={() => handleBlur("to")}
                placeholder="candidate@example.com"
                required
                className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                whileFocus={{ 
                  boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                  scale: 1.01
                }}
              />
              <AnimatePresence>
                {isFocused.to && (
                  <motion.div 
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-600"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={{ scaleX: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ originX: 0 }}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <div className="relative">
              <motion.input
                type="text"
                id="subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                onFocus={() => handleFocus("subject")}
                onBlur={() => handleBlur("subject")}
                placeholder="Regarding your application"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                whileFocus={{ 
                  boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                  scale: 1.01
                }}
              />
              <AnimatePresence>
                {isFocused.subject && (
                  <motion.div 
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-600"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={{ scaleX: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ originX: 0 }}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <DocumentTextIcon className="h-5 w-5 text-gray-400" />
              </div>
              <motion.textarea
                id="body"
                name="body"
                value={form.body}
                onChange={handleChange}
                onFocus={() => handleFocus("body")}
                onBlur={() => handleBlur("body")}
                placeholder="Write your message here..."
                required
                rows={6}
                className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 resize-none"
                whileFocus={{ 
                  boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                  scale: 1.01
                }}
              />
              <AnimatePresence>
                {isFocused.body && (
                  <motion.div 
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-600"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={{ scaleX: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ originX: 0 }}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>

        {/* Status Message */}
        <AnimatePresence>
          {status.message && (
            <motion.div 
              className={`rounded-lg p-4 ${
                status.type === "success" 
                  ? "bg-green-50 text-green-700 border border-green-200" 
                  : status.type === "error"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
              variants={statusVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              key={status.message}
            >
              <p className="text-sm font-medium flex items-center">
                {status.type === "loading" && (
                  <motion.div 
                    className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                )}
                {status.message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={status.type === "loading"}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 relative overflow-hidden"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          initial="initial"
        >
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0"
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          
          {status.type === "loading" ? (
            <>
              <motion.div 
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span className="relative z-10">Sending...</span>
            </>
          ) : (
            <>
              <motion.span variants={iconVariants} whileHover="hover" className="relative z-10">
                <PaperAirplaneIcon className="w-5 h-5" />
              </motion.span>
              <span className="relative z-10">Send Email</span>
            </>
          )}
        </motion.button>
      </motion.form>
  );
}