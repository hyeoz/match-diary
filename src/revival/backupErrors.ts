export const backupErrorMessage = (error: unknown): string => {
  const code = error instanceof Error ? error.message : '';
  if (code.includes('STORAGE_SPACE_INSUFFICIENT')) {
    return '기기 저장 공간이 부족합니다. 공간을 확보한 뒤 다시 시도해주세요.';
  }
  if (code === 'BACKUP_VERSION_NEWER') {
    return '더 새로운 직관일기에서 만든 백업입니다. 앱을 업데이트한 뒤 다시 시도해주세요.';
  }
  if (code.includes('CHECKSUM') || code.includes('CORRUPT')) {
    return '백업 파일이 손상되었거나 내용이 변경되었습니다. 다른 백업 파일을 사용해주세요.';
  }
  if (code.startsWith('BACKUP_')) {
    return '올바른 직관일기 백업 파일이 아닙니다. 기존 데이터는 변경되지 않았습니다.';
  }
  return '작업을 완료하지 못했습니다. 기존 기록과 사진은 그대로 보존했습니다.';
};
