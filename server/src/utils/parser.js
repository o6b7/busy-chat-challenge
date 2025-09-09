import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import mammoth from "mammoth"; // for DOCX

/**
 * Parse PDF buffer into text
 */
async function parsePDF(fileBuffer) {
  try {
    const uint8Array = new Uint8Array(fileBuffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;

    let fullText = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";
      } catch (err) {
        console.error(`[parsePDF] Failed to parse page ${pageNum}:`, err.message);
        continue; // skip page but continue parsing others
      }
    }

    return fullText.trim();
  } catch (err) {
    console.error("[parsePDF] Error parsing PDF:", err.message);
    throw new Error("Failed to parse PDF file");
  }
}

/**
 * Parse DOCX buffer into text
 */
async function parseDOCX(fileBuffer) {
  try {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value?.trim() || "";
  } catch (err) {
    console.error("[parseDOCX] Error parsing DOCX:", err.message);
    throw new Error("Failed to parse DOCX file");
  }
}

/**
 * Split raw text into paragraphs
 */
function splitToParagraphs(text) {
  try {
    return text
      .split(/\n\s*\n/) // empty lines
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  } catch (err) {
    console.error("[splitToParagraphs] Error splitting text:", err.message);
    return [text]; // fallback: return entire text as one paragraph
  }
}

/**
 * Main function: detect file type and parse accordingly
 */
export async function parseFile(file) {
  const { buffer, mimetype } = file;

  try {
    if (mimetype === "application/pdf") {
      return await parsePDF(buffer);
    } else if (
      mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return await parseDOCX(buffer);
    } else {
      throw new Error(`Unsupported file type: ${mimetype}`);
    }
  } catch (err) {
    console.error("[parseFile] Error:", err.message);
    throw err; 
  }
}

export { splitToParagraphs };
