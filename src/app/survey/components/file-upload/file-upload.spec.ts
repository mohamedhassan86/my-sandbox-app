import { describe, expect, it } from 'vitest';
import { FileUploadComponent } from './file-upload';

describe('FileUploadComponent', () => {
  it('classifies file rows by kind', () => {
    expect(
      FileUploadComponent.kindForFile({ fileName: 'proof.pdf', mediaType: 'application/pdf' }),
    ).toBe('pdf');
    expect(
      FileUploadComponent.kindForFile({ fileName: 'photo.JPG', mediaType: 'image/jpeg' }),
    ).toBe('image');
    expect(FileUploadComponent.kindForFile({ fileName: 'notes.txt', mediaType: '' })).toBe(
      'file',
    );
  });

  it('labels byte sizes compactly', () => {
    expect(FileUploadComponent.sizeLabel(512)).toBe('512 B');
    expect(FileUploadComponent.sizeLabel(2048)).toBe('2.0 KB');
    expect(FileUploadComponent.sizeLabel(5 * 1024 * 1024)).toBe('5.0 MB');
    expect(FileUploadComponent.sizeLabel(Number.NaN)).toBe('0 KB');
  });
});
