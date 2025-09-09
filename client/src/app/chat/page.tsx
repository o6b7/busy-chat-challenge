import ChatBox from "../../components/ChatBox";

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">Chat with MCP</h1>
        <p className="text-gray-600 mb-6">
          Select a resume and ask questions to get AI-powered insights.
        </p>
        <ChatBox />
      </div>
    </div>
  );
}
