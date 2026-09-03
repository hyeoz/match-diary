import RNFS from 'react-native-fs2';
import nacl from 'tweetnacl';
import { decodeBase64, encodeBase64 } from 'tweetnacl-util';

import type { RecoveryDeviceKey } from './deviceKey';

export type RecoveryChunk = {
  index: number;
  nonce: string;
  encryptedBytes: number;
  plainBytes: number;
  sha256: string;
};

export type RecoveryEnvelope = {
  format: 'com.matchdiary.recovery-encrypted';
  version: 1;
  algorithm: 'x25519-xsalsa20-poly1305/chunked-secretbox';
  ephemeralPublicKey: string;
  wrapNonce: string;
  wrappedKey: string;
  archiveBytes: number;
  archiveSha256: string;
  chunks: RecoveryChunk[];
};

const assertEnvelope = (value: RecoveryEnvelope): void => {
  if (
    value?.format !== 'com.matchdiary.recovery-encrypted' ||
    value.version !== 1 ||
    value.algorithm !== 'x25519-xsalsa20-poly1305/chunked-secretbox' ||
    !Array.isArray(value.chunks) ||
    !/^[a-f0-9]{64}$/i.test(value.archiveSha256)
  ) {
    throw new Error('RECOVERY_ENVELOPE_INVALID');
  }
};

export const decryptRecoveryChunks = async ({
  envelope,
  deviceKey,
  destination,
  downloadChunk,
}: {
  envelope: RecoveryEnvelope;
  deviceKey: RecoveryDeviceKey;
  destination: string;
  downloadChunk: (chunk: RecoveryChunk) => Promise<string>;
}): Promise<void> => {
  assertEnvelope(envelope);
  const fileKey = nacl.box.open(
    decodeBase64(envelope.wrappedKey),
    decodeBase64(envelope.wrapNonce),
    decodeBase64(envelope.ephemeralPublicKey),
    deviceKey.secretKey,
  );
  if (!fileKey) throw new Error('RECOVERY_DEVICE_KEY_MISMATCH');
  await RNFS.unlink(destination).catch(() => undefined);
  let written = 0;
  try {
    for (const [position, chunk] of envelope.chunks.entries()) {
      if (chunk.index !== position || chunk.plainBytes <= 0) {
        throw new Error('RECOVERY_ENVELOPE_INVALID');
      }
      const encryptedPath = await downloadChunk(chunk);
      try {
        const checksum = await RNFS.hash(encryptedPath, 'sha256');
        if (checksum.toLowerCase() !== chunk.sha256.toLowerCase()) {
          throw new Error('RECOVERY_CHUNK_CORRUPTED');
        }
        const encrypted = decodeBase64(
          await RNFS.readFile(encryptedPath, 'base64'),
        );
        const plaintext = nacl.secretbox.open(
          encrypted,
          decodeBase64(chunk.nonce),
          fileKey,
        );
        if (!plaintext || plaintext.length !== chunk.plainBytes) {
          throw new Error('RECOVERY_CHUNK_DECRYPTION_FAILED');
        }
        const encoded = encodeBase64(plaintext);
        if (position === 0) {
          await RNFS.writeFile(destination, encoded, 'base64');
        } else {
          await RNFS.appendFile(destination, encoded, 'base64');
        }
        written += plaintext.length;
        plaintext.fill(0);
      } finally {
        await RNFS.unlink(encryptedPath).catch(() => undefined);
      }
    }
    if (written !== envelope.archiveBytes) {
      throw new Error('RECOVERY_ARCHIVE_SIZE_INVALID');
    }
    const archiveChecksum = await RNFS.hash(destination, 'sha256');
    if (
      archiveChecksum.toLowerCase() !== envelope.archiveSha256.toLowerCase()
    ) {
      throw new Error('RECOVERY_ARCHIVE_CORRUPTED');
    }
  } catch (error) {
    await RNFS.unlink(destination).catch(() => undefined);
    throw error;
  } finally {
    fileKey.fill(0);
  }
};
