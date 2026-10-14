import { siteConfig } from '@/lib/config'
import CONFIG from '../config'

/**
 * 取文章封面地址。
 *
 * 顺序：
 *   1. ENDSPACE_COVER_OVERRIDES 里按 post.id 命中（Notion page id，最稳）
 *   2. 再按 post.slug 命中（方便手写可读的键）
 *   3. 回落到 Notion 的 pageCoverThumbnail
 *
 * 覆盖表的存在是因为 Notion 里的封面可能指向已失效的图源：
 * 代码改不了 Notion，但至少能在这里换掉，详见 config.js 的说明。
 * 返回空串表示既没有覆盖、Notion 也没有封面；调用方据此渲染自绘底板。
 */
export const getPostCover = post => {
  if (!post) return ''
  const overrides =
    siteConfig('ENDSPACE_COVER_OVERRIDES', {}, CONFIG) || {}
  return (
    overrides[post.id] ||
    overrides[post.slug] ||
    post.pageCoverThumbnail ||
    ''
  )
}

export default getPostCover
