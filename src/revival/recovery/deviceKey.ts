import * as Keychain from 'react-native-keychain';
import nacl from 'tweetnacl';
import { decodeBase64, encodeBase64 } from 'tweetnacl-util';

const DEVICE_KEY_SERVICE = 'com.matchdiary.recovery.device-key.v1';
const PENDING_JOB_SERVICE = 'com.matchdiary.recovery.pending-job.v1';

export type RecoveryDeviceKey = {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
};

export type PendingRecoveryJob = {
  id: string;
  token: string;
};

export const getOrCreateRecoveryDeviceKey =
  async (): Promise<RecoveryDeviceKey> => {
    const stored = await Keychain.getGenericPassword({
      service: DEVICE_KEY_SERVICE,
    });
    if (stored) {
      const secretKey = decodeBase64(stored.password);
      if (secretKey.length === nacl.box.secretKeyLength) {
        return {
          secretKey,
          publicKey: nacl.box.keyPair.fromSecretKey(secretKey).publicKey,
        };
      }
      await Keychain.resetGenericPassword({ service: DEVICE_KEY_SERVICE });
    }

    const pair = nacl.box.keyPair();
    await Keychain.setGenericPassword(
      'device-key',
      encodeBase64(pair.secretKey),
      {
        service: DEVICE_KEY_SERVICE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      },
    );
    return pair;
  };

export const savePendingRecoveryJob = async (
  job: PendingRecoveryJob,
): Promise<void> => {
  await Keychain.setGenericPassword('pending-job', JSON.stringify(job), {
    service: PENDING_JOB_SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
};

export const loadPendingRecoveryJob =
  async (): Promise<PendingRecoveryJob | null> => {
    const stored = await Keychain.getGenericPassword({
      service: PENDING_JOB_SERVICE,
    });
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored.password) as Partial<PendingRecoveryJob>;
      return typeof parsed.id === 'string' && typeof parsed.token === 'string'
        ? { id: parsed.id, token: parsed.token }
        : null;
    } catch {
      await Keychain.resetGenericPassword({ service: PENDING_JOB_SERVICE });
      return null;
    }
  };

export const clearPendingRecoveryJob = (): Promise<boolean> =>
  Keychain.resetGenericPassword({ service: PENDING_JOB_SERVICE });

export const clearRecoveryDeviceKey = (): Promise<boolean> =>
  Keychain.resetGenericPassword({ service: DEVICE_KEY_SERVICE });
