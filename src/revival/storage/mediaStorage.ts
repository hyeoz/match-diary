import RNFS from 'react-native-fs2';

import { createLocalId, MediaKind, MediaSource, StoredMedia } from './types';

const ROOT_FOLDER = 'matchdiary';
const MEDIA_FOLDER = 'media';
const MINIMUM_FREE_SPACE = 20 * 1024 * 1024;

const MIME_EXTENSIONS: Record<string, string> = {
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const normalizeSourcePath = (uri: string): string => {
  if (uri.startsWith('file://')) {
    return decodeURI(uri.slice('file://'.length));
  }
  return uri;
};

const safeExtension = (source: MediaSource): string => {
  const fromMime = source.mimeType
    ? MIME_EXTENSIONS[source.mimeType.toLowerCase()]
    : undefined;
  if (fromMime) return fromMime;

  const extension = source.fileName?.split('.').pop()?.toLowerCase();
  return extension?.match(/^[a-z0-9]{2,5}$/) ? extension : 'jpg';
};

const safeOriginalName = (source: MediaSource, extension: string): string => {
  const value = source.fileName?.split(/[\\/]/).pop();
  return value?.trim() || `image.${extension}`;
};

export type MediaStorage = {
  initialize: () => Promise<void>;
  persist: (source: MediaSource, kind: MediaKind) => Promise<StoredMedia>;
  remove: (relativePath: string) => Promise<void>;
  removeMany: (relativePaths: string[]) => Promise<void>;
  cleanupOrphans: (referencedPaths: string[]) => Promise<void>;
  resolveUri: (relativePath: string) => string;
};

export class AppMediaStorage implements MediaStorage {
  private readonly rootPath = `${RNFS.DocumentDirectoryPath}/${ROOT_FOLDER}`;
  private readonly mediaPath = `${this.rootPath}/${MEDIA_FOLDER}`;

  initialize = async (): Promise<void> => {
    await RNFS.mkdir(`${this.mediaPath}/photos`);
    await RNFS.mkdir(`${this.mediaPath}/tickets`);
  };

  private absolutePath = (relativePath: string): string => {
    if (
      !relativePath.startsWith(`${MEDIA_FOLDER}/`) ||
      relativePath.includes('..')
    ) {
      throw new Error('Invalid app media path');
    }
    return `${this.rootPath}/${relativePath}`;
  };

  resolveUri = (relativePath: string): string =>
    `file://${this.absolutePath(relativePath)}`;

  persist = async (
    source: MediaSource,
    kind: MediaKind,
  ): Promise<StoredMedia> => {
    await this.initialize();
    const extension = safeExtension(source);
    const id = createLocalId(kind);
    const folder = kind === 'photo' ? 'photos' : 'tickets';
    const relativePath = `${MEDIA_FOLDER}/${folder}/${id}.${extension}`;
    const destination = this.absolutePath(relativePath);
    const sourcePath = normalizeSourcePath(source.uri);
    const fileSystem = await RNFS.getFSInfo();
    const expectedSize = source.fileSize ?? 0;

    if (fileSystem.freeSpace < expectedSize + MINIMUM_FREE_SPACE) {
      throw new Error('STORAGE_SPACE_INSUFFICIENT');
    }

    try {
      await RNFS.copyFile(sourcePath, destination);
      const [stats, checksumSha256] = await Promise.all([
        RNFS.stat(destination),
        RNFS.hash(destination, 'sha256'),
      ]);
      return {
        id,
        kind,
        relativePath,
        mimeType: source.mimeType || `image/${extension}`,
        originalName: safeOriginalName(source, extension),
        byteSize: stats.size,
        checksumSha256,
        width: source.width ?? null,
        height: source.height ?? null,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      if (await RNFS.exists(destination)) {
        await RNFS.unlink(destination).catch(() => undefined);
      }
      throw error;
    }
  };

  remove = async (relativePath: string): Promise<void> => {
    const path = this.absolutePath(relativePath);
    if (await RNFS.exists(path)) {
      await RNFS.unlink(path);
    }
  };

  removeMany = async (relativePaths: string[]): Promise<void> => {
    const uniquePaths = [...new Set(relativePaths)];
    await Promise.all(
      uniquePaths.map(path => this.remove(path).catch(() => undefined)),
    );
  };

  cleanupOrphans = async (referencedPaths: string[]): Promise<void> => {
    await this.initialize();
    const referenced = new Set(referencedPaths);
    for (const folder of ['photos', 'tickets']) {
      const folderPath = `${this.mediaPath}/${folder}`;
      const entries = await RNFS.readDir(folderPath);
      for (const entry of entries) {
        if (!entry.isFile()) continue;
        const relativePath = `${MEDIA_FOLDER}/${folder}/${entry.name}`;
        if (!referenced.has(relativePath)) {
          await RNFS.unlink(entry.path).catch(() => undefined);
        }
      }
    }
  };
}
