const messages: Record<string, string> = {
  RECOVERY_NOT_CONFIGURED: '복구 서비스 운영 전입니다.',
  RECOVERY_ATTESTATION_UNSUPPORTED:
    '기존 앱을 사용하던 실제 기기에서만 자동 복구할 수 있어요.',
  RECOVERY_AUTHORIZATION_FAILED:
    '이 기기가 기존 기록의 원래 기기인지 확인하지 못했어요.',
  RECOVERY_WINDOW_CLOSED: '기존 기록 자동 복구 기간이 종료됐어요.',
  RECOVERY_PREPARATION_FAILED:
    '복구 파일을 준비하지 못했어요. 기존 데이터는 변경하지 않았습니다.',
};

export const recoveryErrorMessage = (error: unknown): string => {
  const code = error instanceof Error ? error.message : '';
  return (
    messages[code] ||
    '기존 기록을 가져오지 못했어요. 현재 기기 데이터는 그대로 보존했습니다.'
  );
};
