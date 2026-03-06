const rawApi = (import.meta as any)?.env?.VITE_API_URL || "";
const API = rawApi.replace(/\/$/, "");

const parseJson = async (res: Response) => {
  const raw = await res.text();
  let data: any = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    const fallback = raw ? raw.slice(0, 200) : "Request failed";
    throw new Error(
      (data && (data.message || data.error)) || `HTTP ${res.status}: ${fallback}`
    );
  }
  return data;
};

// upload excel
export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API}/upload`, {
    method: "POST",
    body: formData,
  });

  return parseJson(res);
};

// get list of files
export const getFiles = async () => {
  const res = await fetch(`${API}/files`);
  return parseJson(res);
};

// read specific file
export const readFile = async (name: string) => {
  const res = await fetch(`${API}/file/${name}`);
  return parseJson(res);
};

// save updated data
export const saveFile = async (data: any[]) => {
  const res = await fetch(`${API}/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data }),
  });

  return parseJson(res);
};
