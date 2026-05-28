/**
 * External System Integration Service
 *
 * Manages connections to external Student Information Systems (SIS)
 * and proxies data requests through IdenVault's backend.
 *
 * NOTE: api_key is stored as plain text in Supabase for now (acceptable for FYP).
 *
 * Requires the following table to be created in Supabase:
 *
 *   CREATE TABLE external_system_connections (
 *     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *     issuer_wallet text NOT NULL,
 *     system_name text NOT NULL DEFAULT 'Student Information System',
 *     endpoint_url text NOT NULL,
 *     api_key text NOT NULL,
 *     status text NOT NULL DEFAULT 'connected',
 *     connected_at timestamptz DEFAULT now(),
 *     updated_at timestamptz DEFAULT now()
 *   );
 *
 *   CREATE INDEX idx_esc_issuer_wallet ON external_system_connections(issuer_wallet);
 */

import { supabase } from '../config/supabase';
import { AppError } from '../utils/AppError';

interface ConnectionRow {
  id: string;
  issuer_wallet: string;
  system_name: string;
  endpoint_url: string;
  api_key: string;
  status: string;
  connected_at: string;
  updated_at: string;
}

interface CreateConnectionInput {
  system_name?: string;
  endpoint_url: string;
  api_key: string;
}

// ---------------------------------------------------------------------------
// Connection management (Supabase CRUD)
// ---------------------------------------------------------------------------

async function createConnection(wallet: string, input: CreateConnectionInput): Promise<ConnectionRow> {
  const row = {
    issuer_wallet: wallet.toLowerCase(),
    system_name: input.system_name ?? 'Student Information System',
    endpoint_url: input.endpoint_url,
    api_key: input.api_key,
    status: 'connected',
    connected_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('external_system_connections')
    .insert(row)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ConnectionRow;
}

async function listConnections(wallet: string): Promise<ConnectionRow[]> {
  const { data, error } = await supabase
    .from('external_system_connections')
    .select('*')
    .eq('issuer_wallet', wallet.toLowerCase())
    .order('connected_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ConnectionRow[];
}

async function getConnection(connectionId: string): Promise<ConnectionRow | null> {
  const { data, error } = await supabase
    .from('external_system_connections')
    .select('*')
    .eq('id', connectionId)
    .single();

  if (error && error.code === 'PGRST116') return null;
  if (error) throw new Error(error.message);
  return data as ConnectionRow;
}

async function deleteConnection(connectionId: string, wallet: string): Promise<void> {
  const { data, error } = await supabase
    .from('external_system_connections')
    .delete()
    .eq('id', connectionId)
    .eq('issuer_wallet', wallet.toLowerCase())
    .select();

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new AppError('Connection not found or not owned by this wallet', 404);
  }
}

// ---------------------------------------------------------------------------
// Helper — resolve + verify ownership in one call
// ---------------------------------------------------------------------------

async function getConnectionForIssuer(connectionId: string, wallet: string): Promise<ConnectionRow> {
  const connection = await getConnection(connectionId);
  if (!connection || connection.issuer_wallet !== wallet.toLowerCase()) {
    throw new AppError('Connection not found', 404);
  }
  return connection;
}

// ---------------------------------------------------------------------------
// Connectivity test
// ---------------------------------------------------------------------------

async function testConnection(
  endpoint_url: string,
  api_key: string,
): Promise<{ success: true; data: any } | { success: false; error: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const res = await fetch(`${endpoint_url}/api/health`, {
      method: 'GET',
      headers: { 'x-api-key': api_key },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const body = await res.text();
      return { success: false, error: `Health check failed (${res.status}): ${body}` };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { success: false, error: 'Connection timed out (10s)' };
    }
    return { success: false, error: err.message ?? 'Network error' };
  }
}

// ---------------------------------------------------------------------------
// Data proxy methods
// ---------------------------------------------------------------------------

async function proxyFetch(url: string, api_key: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: { 'x-api-key': api_key },
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw new AppError('External system not reachable', 502);
    }
    throw new AppError('External system not reachable', 502);
  }

  clearTimeout(timeout);

  if (!res.ok) {
    const body = await res.text().catch(() => 'Unknown error');
    throw new AppError(`External system returned error: ${body}`, res.status);
  }

  return res;
}

async function fetchStudents(endpoint_url: string, api_key: string): Promise<any> {
  const res = await proxyFetch(`${endpoint_url}/api/students`, api_key);
  return res.json();
}

async function fetchStudent(endpoint_url: string, api_key: string, studentId: string): Promise<any> {
  const res = await proxyFetch(`${endpoint_url}/api/students/${studentId}`, api_key);
  return res.json();
}

async function fetchCertificateBuffer(
  endpoint_url: string,
  api_key: string,
  studentId: string,
): Promise<{ buffer: Buffer; contentType: string; contentDisposition: string }> {
  const res = await proxyFetch(`${endpoint_url}/api/students/${studentId}/certificate`, api_key);
  const arrayBuf = await res.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuf),
    contentType: res.headers.get('content-type') ?? 'application/pdf',
    contentDisposition: res.headers.get('content-disposition') ?? `attachment; filename="certificate-${studentId}.pdf"`,
  };
}

async function fetchCertificateUrl(
  endpoint_url: string,
  api_key: string,
  studentId: string,
): Promise<{ url: string; filename: string }> {
  const res = await proxyFetch(`${endpoint_url}/api/students/${studentId}/certificate-url`, api_key);
  return res.json();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const externalSystemService = {
  createConnection,
  listConnections,
  getConnection,
  deleteConnection,
  getConnectionForIssuer,
  testConnection,
  fetchStudents,
  fetchStudent,
  fetchCertificateBuffer,
  fetchCertificateUrl,
};
