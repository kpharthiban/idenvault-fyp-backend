import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { externalSystemService } from '../services/externalSystem.service';

/**
 * Strip the api_key from a connection row before sending to the client.
 */
function sanitize(row: Record<string, any>) {
  const { api_key, ...safe } = row;
  return safe;
}

// POST /api/external-system/connections
export const connectSystem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = (req as any).wallet as string;
    const { system_name, endpoint_url, api_key } = req.body;

    // --- validation ---
    if (!endpoint_url || typeof endpoint_url !== 'string') {
      throw new AppError('endpoint_url is required', 400);
    }
    if (!/^https?:\/\//i.test(endpoint_url)) {
      throw new AppError('endpoint_url must start with http:// or https://', 400);
    }
    if (!api_key || typeof api_key !== 'string') {
      throw new AppError('api_key is required', 400);
    }

    // Step 1: verify connectivity
    const test = await externalSystemService.testConnection(endpoint_url, api_key);
    if (!test.success) {
      return res.status(400).json({ error: `Connection failed: ${test.error}` });
    }

    // Step 2: persist
    const connection = await externalSystemService.createConnection(wallet, {
      system_name,
      endpoint_url,
      api_key,
    });

    res.status(201).json({
      message: 'Connected successfully',
      connection: sanitize(connection),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/external-system/connections
export const listConnections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = (req as any).wallet as string;
    const rows = await externalSystemService.listConnections(wallet);
    res.json({ connections: rows.map(sanitize) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/external-system/connections/:connectionId
export const disconnectSystem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = (req as any).wallet as string;
    const connectionId = req.params.connectionId as string;

    await externalSystemService.deleteConnection(connectionId, wallet);
    res.json({ message: 'Disconnected successfully' });
  } catch (err) {
    next(err);
  }
};

// GET /api/external-system/connections/:connectionId/students
export const getStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = (req as any).wallet as string;
    const connectionId = req.params.connectionId as string;

    const connection = await externalSystemService.getConnectionForIssuer(connectionId, wallet);
    const data = await externalSystemService.fetchStudents(connection.endpoint_url, connection.api_key);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// GET /api/external-system/connections/:connectionId/students/:studentId
export const getStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = (req as any).wallet as string;
    const connectionId = req.params.connectionId as string;
    const studentId = req.params.studentId as string;

    const connection = await externalSystemService.getConnectionForIssuer(connectionId, wallet);
    const data = await externalSystemService.fetchStudent(connection.endpoint_url, connection.api_key, studentId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// GET /api/external-system/connections/:connectionId/students/:studentId/certificate
export const getCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = (req as any).wallet as string;
    const connectionId = req.params.connectionId as string;
    const studentId = req.params.studentId as string;

    const connection = await externalSystemService.getConnectionForIssuer(connectionId, wallet);
    const { buffer, contentType, contentDisposition } = await externalSystemService.fetchCertificateBuffer(
      connection.endpoint_url,
      connection.api_key,
      studentId,
    );

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', contentDisposition);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

// GET /api/external-system/connections/:connectionId/students/:studentId/certificate-url
export const getCertificateUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = (req as any).wallet as string;
    const connectionId = req.params.connectionId as string;
    const studentId = req.params.studentId as string;

    const connection = await externalSystemService.getConnectionForIssuer(connectionId, wallet);
    const data = await externalSystemService.fetchCertificateUrl(
      connection.endpoint_url,
      connection.api_key,
      studentId,
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
};
