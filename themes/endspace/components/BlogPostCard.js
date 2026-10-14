import SmartLink from '@/components/SmartLink'
import { siteConfig } from '@/lib/config'
import { IconArrowRight } from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import CONFIG from '../config'

/**
 * BlogPostCard —— 紧凑工业档案卡片
 *
 * 尺寸约束（首页密度的关键，原实现没有这些约束所以卡片被撑到 650–780px 高）：
 * 1. 封面高度只由「卡片宽度 × ENDSPACE_CARD_THUMB_RATIO」决定。
 *    原实现用 `w-full aspect-video` 且容器宽 896–1075px，封面单张就 503–604px 高，
 *    占掉卡片 77% 的高度；现在封面永远是固定比例的窄条，原图再大也撑不大卡片。
 * 2. 标题 / 摘要按配置行数截断；footer 用 margin-top:auto 贴底，
 *    同一行的卡片高度由 grid 自动拉平，不会出现参差。
 * 3. 封面适配 auto：图片加载后按真实比例判断 —— 比例贴合封面框才用 cover
 *    （裁切可忽略），否则用 contain，保证技术示意图 / 公式截图 / 文字密集图
 *    完整可读，不会被裁掉关键部分。
 */
export const BlogPostCard = ({ post, showSummary = true, index }) => {
  const showCover = siteConfig('ENDSPACE_POST_LIST_COVER', true, CONFIG)
  const showPreview = siteConfig('ENDSPACE_POST_LIST_PREVIEW', true, CONFIG)
  const fitMode = siteConfig('ENDSPACE_CARD_THUMB_FIT', 'auto', CONFIG)
  const maxTags = siteConfig('ENDSPACE_CARD_TAGS', 3, CONFIG)

  const cover = post?.pageCoverThumbnail
  const hasCover = showCover && !!cover

  const [autoFit, setAutoFit] = useState(null)
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

  return (
    <SmartLink href={`/${post.slug}`}>
      <article className='eds-card'>
        {hasCover && (
          <div className='eds-card__thumb' data-fit={fit}>
            <img
              ref={imgRef}
              src={cover}
              alt={post?.title || ''}
              loading='lazy'
              decoding='async'
              onLoad={event => applyFit(event.currentTarget)}
              className='eds-card__img'
              style={{ objectFit: fit }}
            />
            {typeof index === 'number' && (
              <span className='eds-card__idx'>
                {String(index + 1).padStart(2, '0')}
              </span>
            )}
          </div>
        )}

        <div className='eds-card__body'>
          {/* 元信息：日期 · 分类 */}
          <div className='eds-card__meta eds-mono'>
            {post?.publishDay && <span>{post.publishDay}</span>}
            {post?.publishDay && post?.category && (
              <span className='eds-card__sep' />
            )}
            {post?.category && (
              <span className='eds-card__cat'>{post.category}</span>
            )}
          </div>

          {/* 标题 */}
          <h2 className='eds-card__title'>{post?.title}</h2>

          {/* 摘要（Notion 未填 summary 时不占位、不产生空白） */}
          {showSummary && showPreview && post?.summary && (
            <p className='eds-card__summary'>{post.summary}</p>
          )}

          {/* 标签 + 进入标记 */}
          <div className='eds-card__foot'>
            <div className='eds-card__tags'>
              {tags.map(tag => (
                <span key={tag} className='eds-tag'>
                  #{tag}
                </span>
              ))}
            </div>
            <span className='eds-card__go' aria-hidden='true'>
              <span className='eds-card__go-mk'>
                <IconArrowRight size={10} stroke={2.2} />
              </span>
            </span>
          </div>
        </div>
      </article>
    </SmartLink>
  )
}
