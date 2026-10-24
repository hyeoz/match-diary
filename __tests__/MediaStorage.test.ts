import RNFS from 'react-native-fs2';

import { AppMediaStorage } from '../src/revival/storage/mediaStorage';

const fileSystem = RNFS as jest.Mocked<typeof RNFS>;

describe('AppMediaStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fileSystem.getFSInfo.mockResolvedValue({
      freeSpace: 1024 * 1024 * 1024,
      totalSpace: 1024 * 1024 * 1024,
    });
    fileSystem.stat.mockResolvedValue({ size: 4096 } as never);
    fileSystem.hash.mockResolvedValue('sha256-copy');
  });

  it('선택한 원본을 앱 전용 상대 경로로 복사하고 체크섬을 저장한다', async () => {
    const storage = new AppMediaStorage();

    const stored = await storage.persist(
      {
        uri: 'file:///tmp/source.jpg',
        fileName: 'source.jpg',
        mimeType: 'image/jpeg',
        fileSize: 4096,
      },
      'photo',
    );

    expect(stored.relativePath).toMatch(/^media\/photos\/photo_.+\.jpg$/);
    expect(stored.relativePath).not.toContain('/tmp/source.jpg');
    expect(stored.checksumSha256).toBe('sha256-copy');
    expect(fileSystem.copyFile).toHaveBeenCalledWith(
      '/tmp/source.jpg',
      expect.stringMatching(
        /^\/documents\/matchdiary\/media\/photos\/photo_.+\.jpg$/,
      ),
    );
  });

  it('저장 공간이 부족하면 복사를 시작하지 않는다', async () => {
    fileSystem.getFSInfo.mockResolvedValue({
      freeSpace: 1024,
      totalSpace: 1024,
    });
    const storage = new AppMediaStorage();

    await expect(
      storage.persist(
        { uri: 'file:///tmp/source.jpg', fileSize: 4096 },
        'photo',
      ),
    ).rejects.toThrow('STORAGE_SPACE_INSUFFICIENT');
    expect(fileSystem.copyFile).not.toHaveBeenCalled();
  });
});
