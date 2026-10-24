import { NativeModules } from 'react-native';

export type RecoveryPlatform = 'ios' | 'android';

export type RecoveryIdentity = {
  platform: RecoveryPlatform;
  deviceId: string;
};

export type RecoveryAttestation = {
  platform: RecoveryPlatform;
  token: string;
  keyId?: string;
  attestationType?: 'attestation' | 'assertion' | 'integrity';
};

type NativeRecoveryAttestation = {
  apiBaseUrl?: string;
  getIdentity: () => Promise<RecoveryIdentity>;
  isSupported: () => Promise<boolean>;
  attest: (challenge: string) => Promise<RecoveryAttestation>;
  reset: () => Promise<void>;
};

const nativeModule = NativeModules.MatchDiaryRecoveryAttestation as
  | NativeRecoveryAttestation
  | undefined;

export const recoveryApiBaseUrl = (nativeModule?.apiBaseUrl ?? '').replace(
  /\/$/,
  '',
);

export const recoveryAttestation = {
  getIdentity: async (): Promise<RecoveryIdentity> => {
    if (!nativeModule) throw new Error('RECOVERY_ATTESTATION_UNSUPPORTED');
    return nativeModule.getIdentity();
  },
  isSupported: async (): Promise<boolean> =>
    nativeModule ? nativeModule.isSupported() : false,
  attest: async (challenge: string): Promise<RecoveryAttestation> => {
    if (!nativeModule) throw new Error('RECOVERY_ATTESTATION_UNSUPPORTED');
    return nativeModule.attest(challenge);
  },
  reset: async (): Promise<void> => {
    if (nativeModule) await nativeModule.reset();
  },
};
