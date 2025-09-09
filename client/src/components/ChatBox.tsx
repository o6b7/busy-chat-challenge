"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { askResume, listResumes } from "../lib/api";
import Link from "next/link";
import { PaperAirplaneIcon, UserCircleIcon, ChatBubbleLeftRightIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

interface Message {
  role: string;
  text: string;
  timestamp: Date;
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResume, setSelectedResume] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadResumes();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadResumes = async () => {
    try {
      const data = await listResumes();
      setResumes(data);
      if (data.length > 0) setSelectedResume(data[0]);
    } catch (err) {
      console.error("Failed to load resumes:", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedResume || isLoading) return;

    const userMessage: Message = {
      role: "user",
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await askResume(selectedResume.resumeId, input.trim());
      const assistantMessage: Message = {
        role: "mcp",
        text: response.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Failed to get response:", err);
      const errorMessage: Message = {
        role: "mcp",
        text: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05
      }
    }
  };

  const messageVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95 
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        damping: 15,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2
      }
    }
  };

  const inputVariants = {
    focus: {
      scale: 1.01,
      boxShadow: "0 4px 14px 0 rgba(0, 118, 255, 0.1)",
      transition: { duration: 0.2 }
    },
    blur: {
      scale: 1,
      boxShadow: "none",
      transition: { duration: 0.2 }
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    tap: { scale: 0.97 },
    hover: { 
      scale: 1.03,
      transition: { duration: 0.2 }
    }
  };

const loadingDotVariants = {
  initial: { y: 0 },
  animate: {
    y: -8,
    transition: {
      duration: 0.4,
      repeat: Infinity,
      repeatType: "reverse" as const, 
      ease: "easeInOut" as const 
    }
  }
};

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-[600px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
            </motion.div>
            <h2 className="text-xl font-semibold">Chat with Resume</h2>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={clearChat}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              title="Clear chat"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </motion.button>
            {selectedResume?.email && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={`/email?to=${encodeURIComponent(selectedResume.email)}`}
                  className="flex items-center space-x-2 bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors duration-200"
                >
                  <span>📧</span>
                  <span>Contact Candidate</span>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Resume Selector */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="px-6 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200"
      >
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Selected Resume:
          </label>
          <motion.select
            whileFocus={{ scale: 1.01 }}
            value={selectedResume?.resumeId || ""}
            onChange={(e) =>
              setSelectedResume(resumes.find((r) => r.resumeId === e.target.value))
            }
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            {resumes.map((r) => (
              <option key={r.resumeId} value={r.resumeId}>
                {r.originalName} ({new Date(r.uploadedAt).toLocaleDateString()})
              </option>
            ))}
          </motion.select>
        </div>
      </motion.div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center text-gray-500 py-12"
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              >
                <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              </motion.div>
              <p className="text-lg font-medium mb-1">Start a conversation</p>
              <p className="text-sm">Ask questions about the selected resume</p>
            </motion.div>
          )}

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                layout
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <motion.div whileHover={{ scale: 1.1 }}>
                      {msg.role === "user" ? (
                        <UserCircleIcon className="w-4 h-4" />
                      ) : (
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      )}
                    </motion.div>
                    <span className="text-xs font-medium">
                      {msg.role === "user" ? "You" : "Assistant"}
                    </span>
                    <span className="text-xs opacity-70">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{msg.text}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start mt-4"
            >
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 max-w-[75%] shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">Assistant</span>
                </div>
                <div className="flex space-x-1.5 pl-5">
                  <motion.div
                    variants={loadingDotVariants}
                    initial="initial"
                    animate="animate"
                    className="w-2 h-2 bg-blue-500 rounded-full"
                  />
                  <motion.div
                    variants={loadingDotVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.1 }}
                    className="w-2 h-2 bg-blue-500 rounded-full"
                  />
                  <motion.div
                    variants={loadingDotVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.2 }}
                    className="w-2 h-2 bg-blue-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 bg-white border-t border-gray-200"
      >
        <div className="flex space-x-3">
          <motion.input
            variants={inputVariants}
            whileFocus="focus"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about this resume..."
            disabled={isLoading}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50"
          />
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !selectedResume}
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-3 rounded-xl hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center shadow-md"
          >
            <motion.div
              animate={{ rotate: isLoading ? 360 : 0 }}
              transition={{ duration: 0.5, repeat: isLoading ? Infinity : 0 }}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </motion.div>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}