import RNFS from 'react-native-fs2';

import { createLocalId } from '../storage/types';
import type { RecoveryChunk, RecoveryEnvelope } from './crypto';
import type {
  RecoveryAttestation,
  RecoveryPlatform,
} from './nativeAttestation';

export type RecoveryJobStatus = {
  id: string;
  status: 'processing' | 'ready' | 'not_found' | 'failed';
  createdAt: string;
  expiresAt: string;
  summary: {
    recordCount: number;
    mediaCount: number;
    missingMediaCount: number;
    reminderCount: number;
    communityPostCount: number;
  } | null;
  envelope: RecoveryEnvelope | null;
  error: string | null;
};

type Challenge = {
  challengeId: string;
  challenge: string;
  expiresAt: string;
};

const requestJson = async <T>(url: string, init: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof body?.error === 'string' ? body.error : 'RECOVERY_NETWORK_FAILED',
    );
  }
  return body as T;
};

const jsonHeaders = { 'Content-Type': 'application/json' };

export class RecoveryApi {
  constructor(private readonly baseUrl: string) {}

  createChallenge = async (binding: {
    platform: RecoveryPlatform;
    deviceIdHash: string;
    devicePublicKey: string;
  }): Promise<Challenge> =>
    requestJson(`${this.baseUrl}/v1/recovery/challenges`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(binding),
    });

  createJob = async (request: {
    platform: RecoveryPlatform;
    deviceId: string;
    deviceIdHash: string;
    devicePublicKey: string;
    challengeId: string;
    challenge: string;
    attestation: RecoveryAttestation;
  }): Promise<RecoveryJobStatus & { token: string }> =>
    requestJson(`${this.baseUrl}/v1/recovery/requests`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(request),
    });

  getJob = (id: string, token: string): Promise<RecoveryJobStatus> =>
    requestJson(`${this.baseUrl}/v1/recovery/jobs/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

  downloadChunk = async (
    id: string,
    token: string,
    chunk: RecoveryChunk,
  ): Promise<string> => {
    const path = `${RNFS.CachesDirectoryPath}/matchdiary/${createLocalId(
      'recovery-chunk',
    )}.bin`;
    const result = await RNFS.downloadFile({
      fromUrl: `${this.baseUrl}/v1/recovery/jobs/${id}/chunks/${chunk.index}`,
      toFile: path,
      headers: { Authorization: `Bearer ${token}` },
      background: false,
      discretionary: false,
    }).promise;
    if (
      result.statusCode !== 200 ||
      result.bytesWritten !== chunk.encryptedBytes
    ) {
      await RNFS.unlink(path).catch(() => undefined);
      throw new Error('RECOVERY_CHUNK_DOWNLOAD_FAILED');
    }
    return path;
  };

  confirm = async (id: string, token: string): Promise<void> => {
    const response = await fetch(
      `${this.baseUrl}/v1/recovery/jobs/${id}/confirm`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!response.ok) throw new Error('RECOVERY_CONFIRM_FAILED');
  };
}
