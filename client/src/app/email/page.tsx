import EmailForm from "../../components/EmailForm";

export default function EmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">Send an Email</h1>
        <p className="text-gray-600 mb-6">
          Compose and send emails directly to candidates.
        </p>
        <EmailForm />
      </div>
    </div>
  );
}
