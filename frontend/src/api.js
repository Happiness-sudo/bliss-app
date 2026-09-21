const BASE_URL = "/api";

function authHeaders() {
  const token = localStorage.getItem("bliss_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) Object.assign(headers, authHeaders());

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Something went wrong.");
  }
  return data;
}

async function uploadRequest(path, file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Upload failed.");
  }
  return data;
}

export const api = {
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),

  listTeam: () => request("/team", { auth: true }),
  addTeamMember: (payload) => request("/team", { method: "POST", body: payload, auth: true }),
  removeTeamMember: (userId) => request(`/team/${userId}`, { method: "DELETE", auth: true }),

  createOrder: (payload) => request("/orders", { method: "POST", body: payload, auth: true }),
  getOrder: (orderId) => request(`/orders/${orderId}`, { auth: true }),
  editOrder: (orderId, payload) => request(`/orders/${orderId}`, { method: "PATCH", body: payload, auth: true }),
  assignWriter: (orderId, writerId) =>
    request(`/orders/${orderId}/assign`, { method: "POST", body: { writer_id: writerId }, auth: true }),
  submitWork: (orderId, submissionText) =>
    request(`/orders/${orderId}/submit`, {
      method: "POST",
      body: { submission_text: submissionText },
      auth: true,
    }),
  updateOrderStatus: (orderId, status, notes) =>
    request(`/orders/${orderId}/status`, {
      method: "POST",
      body: { status, submission_notes: notes },
      auth: true,
    }),

  writerDashboard: () => request("/dashboard/writer", { auth: true }),
  bidderDashboard: () => request("/dashboard/bidder", { auth: true }),
  employerDashboard: () => request("/dashboard/employer", { auth: true }),

  listNotifications: () => request("/notifications", { auth: true }),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: "POST", auth: true }),
  markAllNotificationsRead: () => request("/notifications/read-all", { method: "POST", auth: true }),

  listFiles: (orderId) => request(`/orders/${orderId}/files`, { auth: true }),
  uploadFile: (orderId, file) => uploadRequest(`/orders/${orderId}/files`, file),
  downloadFile: async (fileId, filename) => {
    const res = await fetch(`${BASE_URL}/files/${fileId}/download`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      throw new Error("Download failed.");
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
  deleteFile: (fileId) => request(`/files/${fileId}`, { method: "DELETE", auth: true }),

  listComments: (orderId) => request(`/orders/${orderId}/comments`, { auth: true }),
  addComment: (orderId, body) =>
    request(`/orders/${orderId}/comments`, { method: "POST", body: { body }, auth: true }),
};
