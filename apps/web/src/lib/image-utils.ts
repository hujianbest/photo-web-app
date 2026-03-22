/** 远程 URL 不走 Next 图片优化，避免开发/内网环境下拉取外链证书失败导致 500 */
export function shouldUnoptimizeImageSrc(src: string | null | undefined): boolean {
  if (!src || typeof src !== 'string') return false;
  return src.startsWith('http://') || src.startsWith('https://');
}
