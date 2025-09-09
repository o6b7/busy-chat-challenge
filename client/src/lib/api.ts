const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse(res: Response) {
  const text = await res.text();
  
  if (!res.ok) {
    let errorMessage = "API request failed";
    
    try {
      const json = JSON.parse(text);
      errorMessage = json.message || json.error || text;
    } catch {
      errorMessage = text || "Unknown error occurred";
    }
    
    throw new ApiError(errorMessage, res.status);
  }
  
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return text;
  }
}

export async function listResumes(): Promise<any[]> {
  try {
    const response = await fetch(`${BASE_URL}/resume/list`, {
      headers: {
        "Cache-Control": "no-cache",
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Failed to fetch resumes:", error);
    throw error;
  }
}

export async function uploadResume(payload: { text: string; originalName: string; mimeType: string }) {
  return handleResponse(await fetch(`${BASE_URL}/resume/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }));
}

export async function askResume(resumeId: string, question: string) {
  return handleResponse(await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeId, question }),
  }));
}

export async function sendEmail(to: string, subject: string, body: string) {
  return handleResponse(await fetch(`${BASE_URL}/email/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, subject, body }),
  }));
}

export async function getEmailLogs() {
  try {
    const response = await fetch(`${BASE_URL}/email/logs`, {
      headers: {
        "Cache-Control": "no-cache",
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Failed to fetch email logs:", error);
    throw error;
  }
}

export async function uploadResumeFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  
  return handleResponse(await fetch(`${BASE_URL}/resume/upload`, {
    method: "POST",
    body: formData,
  }));
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function deleteResume(resumeId: string) {
  const res = await fetch(`${BASE_URL}/resume/${resumeId}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete resume");
  return res.json();
}
