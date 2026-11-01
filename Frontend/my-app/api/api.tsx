const API = `${(process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "")}/`;

async function parseJson<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    if (data.detail) {
      throw new Error(String(data.detail));
    }

    const firstValue = Object.values(data)[0];

    if (Array.isArray(firstValue)) {
      throw new Error(String(firstValue[0]));
    }

    throw new Error("Request failed");
  }

  return response.json() as Promise<T>;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const shouldSetJsonHeader =
    options.body && !(options.body instanceof FormData) && !headers.has("Content-Type");

  if (shouldSetJsonHeader) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers,
  });

  return parseJson<T>(response);
}

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);
  

  return request<{ message?: string }>("image/", {
    method: "POST",
    body: formData,
  });
}

export { API, request };