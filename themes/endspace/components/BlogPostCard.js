import SmartLink from '@/components/SmartLink'
import { siteConfig } from '@/lib/config'
import { IconArrowRight } from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import CONFIG from '../config'
import { docCode, docType, seqNo } from './docMeta'
import { getPostCover } from './getCover'

/**
 * BlogPostCard —— 工业档案卡（DOCUMENT）
 *
 * 与「普通博客卡片」的区别在于信息层级被改成档案的读法：
 *   DOC 编号 / 文档类型  →  缩略图  →  标题  →  DATE · CAT  →  标签 + ACCESS
 * 所有字段都取自真实 Notion 数据（见 docMeta.js），缺字段就整格不渲染，
 * 不会出现空标签或占位符。
 *
 * 尺寸约束（首页密度的关键，原实现没有这些约束所以卡片被撑到 650–780px 高）：
 * 1. 封面高度只由「卡片宽度 × ENDSPACE_CARD_THUMB_RATIO」决定，
 *    原图再大也撑不大卡片。
 * 2. 标题 / 摘要按配置行数截断；footer 用 margin-top:auto 贴底，
 *    同一行的卡片高度由 grid 自动拉平，不会出现参差。
 * 3. 封面适配 auto：图片加载后按真实比例判断 —— 比例贴合封面框才用 cover
 *    （裁切可忽略），否则用 contain，保证技术示意图 / 公式截图 / 文字密集图
 *    完整可读，不会被裁掉关键部分。
 */
export const BlogPostCard = ({ post, showSummary = true, index }) => {
  const showCover = siteConfig('ENDSPACE_POST_LIST_COVER', true, CONFIG)
  const showPreview = siteConfig('ENDSPACE_POST_LIST_PREVIEW', true, CONFIG)
  const showDocHead = siteConfig('ENDSPACE_CARD_DOC_HEAD', true, CONFIG)
  const fitMode = siteConfig('ENDSPACE_CARD_THUMB_FIT', 'auto', CONFIG)
  const maxTags = siteConfig('ENDSPACE_CARD_TAGS', 3, CONFIG)

  const cover = getPostCover(post)

  const [autoFit, setAutoFit] = useState(null)
  const [imgFailed, setImgFailed] = useState(false)
  const fit = fitMode === 'auto' ? autoFit || 'contain' : fitMode
  const imgRef = useRef(null)

  const applyFit = useCallback(
    img => {
      if (fitMode !== 'auto' || !img) return
      const box = img.parentElement
      if (!img.naturalWidth || !img.naturalHeight || !box) return
      const boxRatio = box.clientWidth / box.clientHeight
      const imgRatio = img.naturalWidth / img.naturalHeight
      if (!boxRatio || !imgRatio) return

      // 阈值来自线上真实封面比例分布（12 张：最小 1.33 / 中位 1.78 / 最大 3.97）：
      //   控制工程基础 600x151 (3.97) → cover 要裁掉 55%  ← 技术图，必须 contain
      //   理论力学     902x309 (2.92) → 裁掉 39%          ← 同上
      //   设计与制造II 640x480 (1.33) → 裁掉 25%          ← 方图，宁可留白不裁内容
      //   摄影构图技巧 1080x720(1.50) → 裁掉 16%          ← 照片，cover 更好看
      // 放宽到「任一维裁切 ≤20%」才铺满，即归一化比例落在 [0.80, 1.25]；
      // 这样线上 10 张里 7 张 cover、3 张（恰好是最宽和最方的）contain。
      const relative = imgRatio / boxRatio
      setAutoFit(relative >= 0.8 && relative <= 1.25 ? 'cover' : 'contain')
    },
    [fitMode]
  )

  // 图片命中缓存时，load 事件可能在 React 挂上监听之前就已触发，
  // 那样 fit 会永久停在 contain。挂载后再兜一次。
  useEffect(() => {
    const img = imgRef.current
    if (img?.complete && img.naturalWidth) applyFit(img)
  }, [applyFit, cover])

  const tags = (post?.tags || []).slice(0, maxTags)
  const code = docCode(post)
  const type = docType(post)

  return (
    <SmartLink href={`/${post.slug}`}>
      <article className='eds-card'>
        {/* 档案页眉：DOC 编号 + 文档类型。两者任一缺失就整条不渲染 */}
        {showDocHead && (code || type) && (
          <div className='eds-doc__head eds-mono'>
            {code && <span className='eds-doc__code'>{`DOC·${code}`}</span>}
            <span className='eds-doc__head-line' aria-hidden='true' />
            {type && (
              <span className='eds-doc__type' aria-hidden='true'>
                {type}
              </span>
            )}
          </div>
        )}

        {showCover &&
          (cover && !imgFailed ? (
            <div className='eds-card__thumb' data-fit={fit}>
              <img
                ref={imgRef}
                src={cover}
                alt={post?.title || ''}
                loading='lazy'
                decoding='async'
                onLoad={event => applyFit(event.currentTarget)}
                // 图源失效（被删 / 防盗链 / 拒绝抓取）时不留一个空框，
                // 换成主题自绘的工业档案底板。
                onError={() => setImgFailed(true)}
                className='eds-card__img'
                style={{ objectFit: fit }}
              />
              {typeof index === 'number' && (
                <span className='eds-card__idx' aria-hidden='true'>
                  {seqNo(index)}
                </span>
              )}
            </div>
          ) : (
            <div className='eds-card__thumb eds-card__thumb--blank'>
              <span className='eds-blank__mesh' aria-hidden='true' />
              <span className='eds-blank__mk' aria-hidden='true' />
              <span className='eds-blank__cat eds-mono'>
                {post?.category || 'NO COVER'}
              </span>
              <span className='eds-blank__num eds-mono' aria-hidden='true'>
                {String((typeof index === 'number' ? index : 0) + 1).padStart(
                  3,
                  '0'
                )}
              </span>
            </div>
          ))}

        <div className='eds-card__body'>
          {/* 标题 */}
          <h2 className='eds-card__title'>{post?.title}</h2>

          {/* 摘要（Notion 未填 summary 时不占位、不产生空白） */}
          {showSummary && showPreview && post?.summary && (
            <p className='eds-card__summary'>{post.summary}</p>
          )}

          {/* 档案字段：日期 / 分类。真实字段缺失时整格不渲染 */}
          {(post?.publishDay || post?.category) && (
            <div className='eds-doc__fields eds-mono'>
              {post?.publishDay && (
                <span className='eds-doc__f'>
                  <i>DATE</i>
                  <b>{post.publishDay}</b>
                </span>
              )}
              {post?.category && (
                <span className='eds-doc__f'>
                  <i>CAT</i>
                  <b>{post.category}</b>
                </span>
              )}
            </div>
          )}

          {/* 标签 + ACCESS 入口 */}
          <div className='eds-card__foot'>
            <div className='eds-card__tags'>
              {tags.map(tag => (
                <span key={tag} className='eds-tag'>
                  #{tag}
                </span>
              ))}
            </div>
            <span className='eds-card__go'>
              <i className='eds-card__go-txt'>ACCESS</i>
              <span className='eds-card__go-mk' aria-hidden='true'>
                <IconArrowRight size={10} stroke={2.2} />
              </span>
            </span>
          </div>
        </div>
      </article>
    </SmartLink>
  )
}
