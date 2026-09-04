export const APP_VERSION = '2.4.0';

export const PRIVACY_POLICY_URL = 'https://hyeoz.github.io/privacy/matchdiary/';
export const SUPPORT_URL = 'https://hyeoz.github.io/privacy/support/';
export const SUPPORT_EMAIL = 'match.diary24@gmail.com';

const legacyRecoverySubject = '직관일기 기존 기록 복구 문의';
const legacyRecoveryBody = `안녕하세요. 직관일기 기존 기록 복구를 요청합니다.

본인 확인과 안전한 데이터 전달 절차를 안내해주세요.`;

export const LEGACY_RECOVERY_EMAIL_URL = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
  legacyRecoverySubject,
)}&body=${encodeURIComponent(legacyRecoveryBody)}`;
