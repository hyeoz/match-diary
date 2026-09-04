import {
  LEGACY_RECOVERY_EMAIL_URL,
  SUPPORT_EMAIL,
} from '../src/revival/appInfo';

describe('app support links', () => {
  it('opens a prefilled email for legacy record recovery', () => {
    expect(LEGACY_RECOVERY_EMAIL_URL).toContain(`mailto:${SUPPORT_EMAIL}`);
    expect(decodeURIComponent(LEGACY_RECOVERY_EMAIL_URL)).toContain(
      '직관일기 기존 기록 복구 문의',
    );
    expect(decodeURIComponent(LEGACY_RECOVERY_EMAIL_URL)).toContain(
      '본인 확인과 안전한 데이터 전달 절차',
    );
  });
});
