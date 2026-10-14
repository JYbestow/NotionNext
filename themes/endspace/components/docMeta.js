/**
 * 档案字段工具 —— 只把「真实存在的 Notion 字段」转成档案显示形式，
 * 不派生任何无法验证的状态（没有 CLASSIFIED / OFFLINE / 随机编号这类东西）。
 *
 * 字段来源（lib/db/notion/getPageProperties.js）：
 *   id / type / status / category / tags / tagItems / summary / title / slug
 *   publishDay / publishDate / lastEditedDay / lastEditedDate / pageCover
 * 详情页额外有 wordCount / readTime —— lib/utils/post.js 从正文真实字数算出，
 * 列表页没有这两个字段，所以卡片上不显示，避免出现 '-' 这种占位。
 */

/**
 * DOC 编号：直接用真实 page id 去掉连字符后的前 6 位，
 * 与文章页 PostMeta 里既有的 `DOC_ID // ${post.id.slice(0,6)}` 同一套规则。
 * 纯字符串运算 —— 服务端和客户端结果必然一致，不存在 hydration 不一致。
 * 用 id 而不是「列表里的第几张」，是因为分页第 2 页序号会从 01 重新开始，
 * 那种编号是假的；id 前缀跨页、跨语言站点都稳定。
 */
export function docCode(post) {
  const hex = String(post?.id || '').replace(/-/g, '')
  return hex ? hex.slice(0, 6).toUpperCase() : null
}

/** 文档类型：Notion 的 type 字段（Post / Page / Notice / Menu …） */
export function docType(post) {
  const type = String(post?.type || '').trim()
  return type ? type.toUpperCase() : null
}

/** 文档状态：Notion 的 status 字段（Published / Invisible …） */
export function docStatus(post) {
  const status = String(post?.status || '').trim()
  return status ? status.toUpperCase() : null
}
