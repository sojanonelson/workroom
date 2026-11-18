import axios from 'axios';
import { WorkspaceData, Project, ProjectUpdate, ProjectDocument, Transaction, User } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
});

// Intercept requests to inject bearer token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('workroom_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses for auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: don't auto-redirect if already on login/invite page
      const path = window.location.pathname;
      if (!path.startsWith('/login') && !path.startsWith('/register') && !path.startsWith('/invite')) {
        localStorage.removeItem('workroom_token');
        localStorage.removeItem('workroom_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authApi = {
  login: async (credentials: { email: string; password: string; expected_role?: string }) => {
    const res = await apiClient.post<{ message: string; token: string; user: User }>('/auth/login', credentials);
    return res.data;
  },
  register: async (payload: {
    name: string;
    email: string;
    password: string;
    role?: string;
    company_name?: string;
    phone?: string;
    admin_secret?: string;
    invite_token?: string;
  }) => {
    const res = await apiClient.post<{ message: string; token: string; user: User }>('/auth/register', payload);
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get<{ user: User }>('/auth/me');
    return res.data.user;
  },
};

// Projects Endpoints
export const projectApi = {
  getAll: async () => {
    const res = await apiClient.get<{ projects: Project[] }>('/projects');
    return res.data.projects;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<WorkspaceData>(`/projects/${id}`);
    return res.data;
  },
  create: async (formData: FormData) => {
    const res = await apiClient.post<{ message: string; project: Project }>('/projects', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  update: async (id: string, formData: FormData) => {
    const res = await apiClient.put<{ message: string; project: Project }>(`/projects/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  updateStatus: async (id: string, status: string, note?: string) => {
    const res = await apiClient.patch<{ message: string; project: Project }>(`/projects/${id}/status`, {
      status,
      note,
    });
    return res.data;
  },
  updateBuildLink: async (id: string, build_link: string, note?: string) => {
    const res = await apiClient.patch<{ message: string; project: Project }>(`/projects/${id}/build-link`, {
      build_link,
      note,
    });
    return res.data;
  },
  acceptDeclaration: async (id: string, signee_name: string) => {
    const res = await apiClient.post<{ message: string; project: Project }>(`/projects/${id}/accept-declaration`, {
      signee_name,
    });
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<{ message: string }>(`/projects/${id}`);
    return res.data;
  },
};

// Updates / Milestones Endpoints
export const updateApi = {
  create: async (projectId: string, payload: { title: string; content: string; status_snapshot?: string }) => {
    const res = await apiClient.post<{ message: string; update: ProjectUpdate }>(`/updates/project/${projectId}`, payload);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<{ message: string }>(`/updates/${id}`);
    return res.data;
  },
};

// Documents Endpoints
export const documentApi = {
  upload: async (projectId: string, formData: FormData) => {
    const res = await apiClient.post<{ message: string; document: ProjectDocument }>(
      `/documents/project/${projectId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<{ message: string }>(`/documents/${id}`);
    return res.data;
  },
};

// Transactions Endpoints
export const transactionApi = {
  recordManual: async (projectId: string, formData: FormData) => {
    const res = await apiClient.post<{ message: string; transaction: Transaction }>(
      `/transactions/project/${projectId}/manual`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data;
  },
  updateStatus: async (id: string, status: string, notes?: string) => {
    const res = await apiClient.patch<{ message: string; transaction: Transaction }>(`/transactions/${id}/status`, {
      status,
      notes,
    });
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<{ message: string }>(`/transactions/${id}`);
    return res.data;
  },
};

// Public Invite Endpoints
export const publicApi = {
  getByInviteToken: async (token: string) => {
    const res = await apiClient.get<{ project: Project }>(`/public/invite/${token}`);
    return res.data.project;
  },
  acceptDeclaration: async (token: string, signee_name: string) => {
    const res = await apiClient.post<{ message: string; project: Project }>(`/public/invite/${token}/accept-declaration`, {
      signee_name,
    });
    return res.data;
  },
};
