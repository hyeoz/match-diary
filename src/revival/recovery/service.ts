import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs2';
import { encodeBase64 } from 'tweetnacl-util';

import { sha256Hex } from '../scheduleSync';
import { LocalDataService } from '../storage/service';
import type { BackupRestoreResult } from '../storage/types';
import { RecoveryApi, RecoveryJobStatus } from './api';
import { decryptRecoveryChunks } from './crypto';
import {
  clearPendingRecoveryJob,
  clearRecoveryDeviceKey,
  getOrCreateRecoveryDeviceKey,
  loadPendingRecoveryJob,
  savePendingRecoveryJob,
} from './deviceKey';
import { recoveryApiBaseUrl, recoveryAttestation } from './nativeAttestation';

const COMPLETED_KEY = 'REVIVAL_SERVER_RECOVERY_V1';
const MAX_POLLS = 600;

const wait = (milliseconds: number) =>
  new Promise(resolve => setTimeout(resolve, milliseconds));

const readyJob = async (
  api: RecoveryApi,
  initial: RecoveryJobStatus,
  token: string,
): Promise<RecoveryJobStatus> => {
  let job = initial;
  for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
    if (job.status !== 'processing') return job;
    await wait(1000);
    job = await api.getJob(job.id, token);
  }
  throw new Error('RECOVERY_PREPARATION_TIMEOUT');
};

export class LegacyRecoveryService {
  constructor(
    private readonly localData: LocalDataService,
    private readonly baseUrl = recoveryApiBaseUrl,
  ) {}

  isConfigured = (): boolean => /^https:\/\//.test(this.baseUrl);

  getCompletionStatus = async (): Promise<'completed' | 'no_data' | null> => {
    const value = await AsyncStorage.getItem(COMPLETED_KEY);
    if (value === 'user_deleted') return 'completed';
    return value === 'completed' || value === 'no_data' ? value : null;
  };

  disableAfterUserDeletion = async (): Promise<void> => {
    await Promise.all([
      clearPendingRecoveryJob(),
      clearRecoveryDeviceKey(),
      recoveryAttestation.reset().catch(() => undefined),
    ]);
    await AsyncStorage.setItem(COMPLETED_KEY, 'user_deleted');
  };

  resetNoDataMarker = async (): Promise<void> => {
    if ((await AsyncStorage.getItem(COMPLETED_KEY)) === 'no_data') {
      await AsyncStorage.removeItem(COMPLETED_KEY);
    }
  };

  recover = async (): Promise<BackupRestoreResult | null> => {
    if (!this.isConfigured()) throw new Error('RECOVERY_NOT_CONFIGURED');
    if (await this.getCompletionStatus()) return null;
    if (!(await recoveryAttestation.isSupported())) {
      throw new Error('RECOVERY_ATTESTATION_UNSUPPORTED');
    }

    const deviceKey = await getOrCreateRecoveryDeviceKey();
    try {
      const pending = await loadPendingRecoveryJob();
      if (pending) {
        return await this.finishJob(
          new RecoveryApi(this.baseUrl),
          pending.id,
          pending.token,
          deviceKey,
        );
      }
      return await this.requestAndRestore(deviceKey);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'RECOVERY_ATTESTATION_KEY_UNKNOWN'
      ) {
        await recoveryAttestation.reset();
        return this.requestAndRestore(deviceKey);
      }
      throw error;
    } finally {
      deviceKey.secretKey.fill(0);
    }
  };

  private requestAndRestore = async (
    deviceKey: Awaited<ReturnType<typeof getOrCreateRecoveryDeviceKey>>,
  ): Promise<BackupRestoreResult | null> => {
    const api = new RecoveryApi(this.baseUrl);
    const identity = await recoveryAttestation.getIdentity();
    const binding = {
      platform: identity.platform,
      deviceIdHash: sha256Hex(identity.deviceId),
      devicePublicKey: encodeBase64(deviceKey.publicKey),
    };
    const challenge = await api.createChallenge(binding);
    const attestationPayload = JSON.stringify({
      challenge: challenge.challenge,
      ...binding,
    });
    const attestation = await recoveryAttestation.attest(attestationPayload);
    const created = await api.createJob({
      ...binding,
      deviceId: identity.deviceId,
      challengeId: challenge.challengeId,
      challenge: challenge.challenge,
      attestation,
    });
    await savePendingRecoveryJob({ id: created.id, token: created.token });
    return this.finishJob(api, created.id, created.token, deviceKey, created);
  };

  private finishJob = async (
    api: RecoveryApi,
    id: string,
    token: string,
    deviceKey: Awaited<ReturnType<typeof getOrCreateRecoveryDeviceKey>>,
    initial?: RecoveryJobStatus,
  ): Promise<BackupRestoreResult | null> => {
    const job = await readyJob(
      api,
      initial ?? (await api.getJob(id, token)),
      token,
    );
    if (job.status === 'not_found') {
      await api.confirm(job.id, token).catch(() => undefined);
      await clearPendingRecoveryJob();
      await AsyncStorage.setItem(COMPLETED_KEY, 'no_data');
      return null;
    }
    if (job.status !== 'ready' || !job.envelope) {
      throw new Error(job.error || 'RECOVERY_PREPARATION_FAILED');
    }

    const archivePath = `${RNFS.CachesDirectoryPath}/matchdiary/recovery-${job.id}.matchdiary`;
    await RNFS.mkdir(`${RNFS.CachesDirectoryPath}/matchdiary`);
    await decryptRecoveryChunks({
      envelope: job.envelope,
      deviceKey,
      destination: archivePath,
      downloadChunk: chunk => api.downloadChunk(job.id, token, chunk),
    });
    let result: BackupRestoreResult;
    try {
      result = await this.localData.restoreBackupFromFile(archivePath);
    } finally {
      await RNFS.unlink(archivePath).catch(() => undefined);
    }
    await api.confirm(job.id, token);
    await clearPendingRecoveryJob();
    await AsyncStorage.setItem(COMPLETED_KEY, 'completed');
    return result;
  };
}
