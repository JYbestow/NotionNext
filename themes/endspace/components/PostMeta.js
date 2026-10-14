import { docCode, docStatus, docType } from './docMeta'

/**
 * PostMeta —— 文章页的「档案数据字段」块
 *
 * 字段全部来自真实 Notion 数据，缺失就整格不渲染：
 *   DOC_ID   page id（去掉连字符前 6 位，与卡片上的 DOC 编号同一规则）
 *   TYPE     Notion type 字段
 *   CATEGORY Notion category 字段
 *   STATUS   Notion status 字段（Published / Invisible …）
 *   CREATED  publishDay（Notion date 或页面创建时间）
 *   UPDATED  lastEditedDay（Notion last_edited_time）
 *   CHARS    wordCount（lib/utils/post.js 从正文真实字数算出，列表页没有此字段）
 *   READ     readTime（同上，按 400 字/分钟）
 *
 * 注意：原先这里有一个 `● ONLINE` 的呼吸灯。那类「看起来很系统、实际没有任何数据支撑」
 * 的指示属于假状态，已换成真实的 STATUS 字段值。
 */
export const PostMeta = ({ post }) => {
  if (!post) return null

  const code = docCode(post)
  const type = docType(post)
  const status = docStatus(post)
  const tags = post.tags || []

  const fields = []
  if (code) fields.push({ k: 'DOC_ID', v: code })
  if (type) fields.push({ k: 'TYPE', v: type })
  if (post.category) {
    fields.push({ k: 'CATEGORY', v: String(post.category).toUpperCase() })
  }
  if (status) fields.push({ k: 'STATUS', v: status })
  if (post.publishDay) fields.push({ k: 'CREATED', v: post.publishDay })
  if (post.lastEditedDay) fields.push({ k: 'UPDATED', v: post.lastEditedDay })
  if (post.wordCount) fields.push({ k: 'CHARS', v: String(post.wordCount) })
  if (post.readTime) fields.push({ k: 'READ', v: `${post.readTime} MIN` })

  return (
    <div className='eds-meta'>
      {/* 顶部标识行：DOC_ID + 真实状态 */}
      <div className='eds-meta__bar eds-mono'>
        <span className='eds-meta__id'>
          DOC_ID // {code || post.id?.slice(0, 6) || 'UNKNOWN'}
        </span>
        <span className='eds-meta__line' aria-hidden='true' />
        {status && <span className='eds-meta__status'>{status}</span>}
      </div>

      <h1 className='eds-meta__title'>{post.title}</h1>

      {fields.length > 0 && (
        <dl className='eds-meta__fields eds-mono'>
          {fields.map(field => (
            <div key={field.k} className='eds-meta__field'>
              <dt>{field.k}</dt>
              <dd>{field.v}</dd>
            </div>
          ))}
        </dl>
      )}

      {tags.length > 0 && (
        <div className='eds-meta__tags'>
          {tags.map(tag => (
            <span key={tag} className='eds-tag'>
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default PostMeta
