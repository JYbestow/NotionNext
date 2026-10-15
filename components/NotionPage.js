import { siteConfig } from '@/lib/config'
import { compressImage, mapImgUrl } from '@/lib/db/notion/mapImage'
import NotionEmbed from '@/components/NotionEmbed'
import NotionLink from '@/components/NotionLink'
import { isBrowser, loadExternalResource } from '@/lib/utils'
import mediumZoom from '@fisch0920/medium-zoom'
import 'katex/dist/katex.min.css'
import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
import { NotionRenderer } from 'react-notion-x'
import OriginalityProof from './OriginalityProof'

/**
 * 整个站点的核心组件
 * 将Notion数据渲染成网页
 * @param {*} param0
 * @returns
 */
const NotionPage = ({ post, className }) => {
  // 是否关闭数据库和画册的点击跳转
  const POST_DISABLE_GALLERY_CLICK = siteConfig('POST_DISABLE_GALLERY_CLICK')
  const POST_DISABLE_DATABASE_CLICK = siteConfig('POST_DISABLE_DATABASE_CLICK')
  const SPOILER_TEXT_TAG = siteConfig('SPOILER_TEXT_TAG')

  const zoomRef = useRef(null)
  const IMAGE_ZOOM_IN_WIDTH = siteConfig('IMAGE_ZOOM_IN_WIDTH', 1200)
  // 页面首次打开时执行的勾子
  useEffect(() => {
    // 检测当前的url并自动滚动到对应目标
    autoScrollToHash()
  }, [])

  // 页面文章发生变化时会执行的勾子
  useEffect(() => {
    // 相册视图点击禁止跳转，只能放大查看图片
    if (POST_DISABLE_GALLERY_CLICK) {
      if (!zoomRef.current && isBrowser) {
        zoomRef.current = mediumZoom({
          background: 'rgba(0, 0, 0, 0.2)',
          margin: getMediumZoomMargin()
        })
      }
      // 针对页面中的gallery视图，点击后是放大图片还是跳转到gallery的内部页面
      processGalleryImg(zoomRef?.current)
    }

    // 页内数据库点击禁止跳转，只能查看
    if (POST_DISABLE_DATABASE_CLICK) {
      processDisableDatabaseUrl()
    }

    /**
     * 放大查看图片时替换成高清图像
     */
    const articleRoot =
      document.getElementById('notion-article') || document.body
    const hasAnyImage = Boolean(articleRoot.querySelector('img'))
    if (!hasAnyImage) {
      return
    }

    const observer = new MutationObserver((mutationsList, observer) => {
      mutationsList.forEach(mutation => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          if (mutation.target.classList.contains('medium-zoom-image--opened')) {
            // 等待动画完成后替换为更高清的图像
            setTimeout(() => {
              // 获取该元素的 src 属性
              const src = mutation?.target?.getAttribute('src')
              //   替换为更高清的图像
              mutation?.target?.setAttribute(
                'src',
                compressImage(src, IMAGE_ZOOM_IN_WIDTH)
              )
            }, 800)
          }
        }
      })
    })

    // 监视正文容器，避免对整个 document.body 做高开销监听
    observer.observe(articleRoot, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class']
    })

    return () => {
      observer.disconnect()
    }
  }, [post])

  useEffect(() => {
    // Spoiler文本功能
    if (SPOILER_TEXT_TAG) {
      import('lodash/escapeRegExp').then(escapeRegExp => {
        Promise.all([
          loadExternalResource('/js/spoilerText.js', 'js'),
          loadExternalResource('/css/spoiler-text.css', 'css')
        ]).then(() => {
          window.textToSpoiler &&
            window.textToSpoiler(escapeRegExp.default(SPOILER_TEXT_TAG))
        })
      })
    }
  }, [post])

  // 渐进增强：图片替代文本 / 失效图片兜底 / 代码块与表格的横向溢出提示
  //
  // 为什么不覆盖 react-notion-x 的 components.Image：
  // 它自己的 Image 走 LazyImageFull + medium-zoom 管线（onLoad / zoom.attach 都挂在
  // 它内部的 ref 上）。直接替换组件会绕过模糊占位与点击放大，属于"为了 alt 破坏已有功能"。
  // 因此这里在挂载后只做属性级增强，不动 React 的组件树。
  useEffect(() => {
    const root = document.getElementById('notion-article')
    if (!root) return

    // 1) 替代文本：没有 caption 时 react-notion-x 会统一写 "notion image"，
    //    这对屏幕阅读器是纯噪音，改为空 alt（装饰性图像），保留有 caption 的真实 alt。
    const normalizeImgAlt = img => {
      const alt = img.getAttribute('alt')
      if (!alt || alt === 'notion image') {
        img.setAttribute('alt', '')
        img.setAttribute('data-eds-alt', 'decorative')
      }
    }

    // 2) 失效图片兜底：外部图床失效（例如友链头像源站改版后 404）时不再留破图，
    //    交给 CSS 渲染中性占位块，尺寸与布局保持不变。
    const markImgFailed = img => {
      if (img.dataset.edsImgFailed === '1') return
      img.dataset.edsImgFailed = '1'
      img.classList.add('eds-img-failed')
      const holder =
        img.closest('.notion-asset-wrapper, .notion-collection-card-cover') ||
        img.parentElement
      if (holder) holder.classList.add('eds-img-failed-holder')
    }

    // 错误事件不冒泡，但可以在捕获阶段拿到
    const onImgError = event => {
      const el = event.target
      if (el && el.tagName === 'IMG') markImgFailed(el)
    }

    // 3) 横向溢出提示：只有真的溢出才标记，滚到末尾后撤掉提示
    const markScrollable = () => {
      root.querySelectorAll('pre, table').forEach(el => {
        const overflow = el.scrollWidth - el.clientWidth
        if (overflow > 4) {
          el.setAttribute('data-eds-xscroll', '1')
        } else {
          el.removeAttribute('data-eds-xscroll')
          el.removeAttribute('data-eds-xscroll-end')
        }
      })
    }

    const onScrollCapture = event => {
      const el = event.target
      if (!el || typeof el.getAttribute !== 'function') return
      // 顺带复查（节流）：字体/图片/折叠面板到位后元素宽度会变，标记跟着自我修复
      scheduleRemeasure()
      if (el.getAttribute('data-eds-xscroll') !== '1') return
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
      if (atEnd) {
        el.setAttribute('data-eds-xscroll-end', '1')
      } else {
        el.removeAttribute('data-eds-xscroll-end')
      }
    }

    // 节流复查：滚动 / 点击（展开折叠面板）/ 改变窗口宽度后重新测量横向溢出
    let remeasureTimer = null
    const scheduleRemeasure = () => {
      if (remeasureTimer) return
      remeasureTimer = window.setTimeout(() => {
        remeasureTimer = null
        markScrollable()
      }, 400)
    }

    // 全量重挂（子树被 React 替换后使用）：alt、失效图片兜底、放大标记、横向溢出
    let enhanceTimer = null
    const scheduleEnhance = () => {
      if (enhanceTimer) return
      enhanceTimer = window.setTimeout(() => {
        enhanceTimer = null
        enhance()
      }, 150)
    }

    // 4) 被固定宽度压小的图片：Notion 源数据给图片块设了 block_width（例如摄影页
    //    44 张全部为 340px），而原图有 2 倍以上分辨率余量时，说明这个固定宽度
    //    把图片压小了。只标记"有分辨率余量"的图，避免把所有图片强行放大到同一尺寸。
    const markUpscalable = img => {
      if (!img.naturalWidth || !img.naturalHeight) return
      const rendered = img.getBoundingClientRect().width
      if (rendered < 8) return
      const holder = img.parentElement
      if (!holder || !/px$/.test(holder.style.width || '')) return
      if (img.naturalWidth >= rendered * 1.8) {
        holder.classList.add('eds-upscale')
      } else {
        holder.classList.remove('eds-upscale')
      }
    }

    const onImgLoad = event => {
      const el = event.target
      if (el && el.tagName === 'IMG') markUpscalable(el)
    }

    const enhance = () => {
      const images = root.querySelectorAll('img')
      images.forEach(img => {
        normalizeImgAlt(img)
        // 事件监听挂载前就已经失败的图片：complete 且 naturalWidth 为 0
        if (img.complete && img.naturalWidth === 0) {
          markImgFailed(img)
        } else {
          markUpscalable(img)
        }
      })
      markScrollable()
    }

    enhance()
    root.addEventListener('error', onImgError, true)
    root.addEventListener('load', onImgLoad, true)
    root.addEventListener('scroll', onScrollCapture, true)
    root.addEventListener('click', scheduleRemeasure, true)
    window.addEventListener('resize', scheduleRemeasure)

    // important：应用存在一次全站水合不匹配（见 themes/theme.js 的动态布局机制），
    // 结果 React 会在水合后把 #notion-article 的子树整体替换掉，本文件挂上的
    // alt / data-eds-* 标记会被清空。原来只靠 3 个定时器，属于撞运气。
    // 这里用 MutationObserver 监听子树变化后重新挂载，做到真正的自愈。
    // 注意：enhance() 只改属性、不插删节点，因此不会触发自身的 childList 回调形成循环。
    let observer = null
    if (typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver(scheduleEnhance)
      observer.observe(root, { childList: true, subtree: true })
    }

    // 图片与公式是异步到位/懒加载的，多补几次测量
    const timers = [400, 1500, 3500].map(delay =>
      window.setTimeout(enhance, delay)
    )

    return () => {
      root.removeEventListener('error', onImgError, true)
      root.removeEventListener('load', onImgLoad, true)
      root.removeEventListener('scroll', onScrollCapture, true)
      root.removeEventListener('click', scheduleRemeasure, true)
      window.removeEventListener('resize', scheduleRemeasure)
      if (observer) observer.disconnect()
      if (enhanceTimer) window.clearTimeout(enhanceTimer)
      if (remeasureTimer) window.clearTimeout(remeasureTimer)
      timers.forEach(timer => window.clearTimeout(timer))
    }
  }, [post])

  // const cleanBlockMap = cleanBlocksWithWarn(post?.blockMap);
  // console.log('NotionPage render with post:', post);

  return (
    <div
      id='notion-article'
      className={`mx-auto overflow-hidden ${className || ''}`}>
      {/* 友链画册：让整张卡片成为指向条目 URL 属性的主链接（react-notion-x 的
          isLinkCollectionToUrlProperty）。开启后卡片内可见的 URL 属性会被降级成
          非 <a> 元素，因此不会出现 <a> 嵌套；没有 URL 属性的卡片仍走原来的页面路由。 */}
      <NotionRenderer
        recordMap={post?.blockMap}
        mapPageUrl={mapPageUrl}
        mapImageUrl={mapImgUrl}
        isLinkCollectionToUrlProperty
        components={{
          Code,
          Collection,
          Embed: NotionEmbed,
          Equation,
          Link: NotionLink,
          Modal,
          Pdf,
          Quote: NotionQuote,
          Tweet
        }}
      />

      <AdEmbed />
      <OriginalityProof proof={post?.originalityProof} />
      {hasCodeBlock(post?.blockMap) && <PrismMac />}
    </div>
  )
}

const hasCodeBlock = blockMap => {
  const blocks = blockMap?.block
  if (!blocks) return false
  return Object.values(blocks).some(
    item => item?.value?.type === 'code'
  )
}

/**
 * 页面的数据库链接禁止跳转，只能查看
 */
const processDisableDatabaseUrl = () => {
  if (isBrowser) {
    const links = document.querySelectorAll('.notion-table a')
    for (const e of links) {
      e.removeAttribute('href')
    }
  }
}

/**
 * gallery视图，点击后是放大图片还是跳转到gallery的内部页面
 */
const processGalleryImg = zoom => {
  setTimeout(() => {
    if (isBrowser) {
      const imgList = document?.querySelectorAll(
        '.notion-collection-card-cover img'
      )
      if (imgList && zoom) {
        for (let i = 0; i < imgList.length; i++) {
          zoom.attach(imgList[i])
        }
      }

      const cards = document.getElementsByClassName('notion-collection-card')
      for (const e of cards) {
        e.removeAttribute('href')
      }
    }
  }, 800)
}

/**
 * 根据url参数自动滚动到锚位置
 */
const autoScrollToHash = () => {
  setTimeout(() => {
    // 跳转到指定标题
    const hash = window?.location?.hash
    const needToJumpToTitle = hash && hash.length > 0
    if (needToJumpToTitle) {
      console.log('jump to hash', hash)
      const tocNode = document.getElementById(hash.substring(1))
      if (tocNode && tocNode?.className?.indexOf('notion') > -1) {
        tocNode.scrollIntoView({ block: 'start', behavior: 'smooth' })
      }
    }
  }, 180)
}

/**
 * 将id映射成博文内部链接。
 * @param {*} id
 * @returns
 */
const mapPageUrl = id => {
  // return 'https://www.notion.so/' + id.replace(/-/g, '')
  return '/' + id.replace(/-/g, '')
}

/**
 * 缩放
 * @returns
 */
function getMediumZoomMargin() {
  const width = window.innerWidth

  if (width < 500) {
    return 8
  } else if (width < 800) {
    return 20
  } else if (width < 1280) {
    return 30
  } else if (width < 1600) {
    return 40
  } else if (width < 1920) {
    return 48
  } else {
    return 72
  }
}

// 代码
const Code = dynamic(
  () =>
    import('react-notion-x/build/third-party/code').then(m => {
      return m.Code
    }),
  { ssr: false }
)

// 公式
const Equation = dynamic(
  () =>
    import('@/components/Equation').then(async m => {
      // 化学方程式
      await import('@/lib/plugins/mhchem')
      return m.Equation
    }),
  { ssr: true }
)

// 原版文档
// const Pdf = dynamic(
//   () => import('react-notion-x/build/third-party/pdf').then(m => m.Pdf),
//   {
//     ssr: false
//   }
// )
const Pdf = dynamic(() => import('@/components/Pdf').then(m => m.Pdf), {
  ssr: false
})

// 美化代码 from: https://github.com/txs
const PrismMac = dynamic(() => import('@/components/PrismMac'), {
  ssr: false
})

/**
 * tweet嵌入
 */
const TweetEmbed = dynamic(() => import('react-tweet-embed'), {
  ssr: false
})

/**
 * 文内google广告
 */
const AdEmbed = dynamic(
  () => import('@/components/GoogleAdsense').then(m => m.AdEmbed),
  { ssr: true }
)

const Collection = dynamic(
  () => import('@/components/NotionCollection'),
  {
    ssr: true
  }
)

const Modal = dynamic(
  () => import('react-notion-x/build/third-party/modal').then(m => m.Modal),
  { ssr: false }
)

const Tweet = ({ id }) => {
  return <TweetEmbed tweetId={id} />
}

// Custom Quote override: react-notion-x drops quotes without properties.title
// (returns null from early guard). This renders them correctly — fixes #4140.
const NotionQuote = ({ block, children }) => {
  const title = block?.properties?.title
  return (
    <blockquote className='notion-quote'>
      {title && <NotionText value={title} />}
      {children}
    </blockquote>
  )
}

// Minimal inline text renderer for Notion rich-text arrays.
// Each segment is [plainText, [[formatType, optionalValue], ...]].
const NotionText = ({ value }) => {
  if (!Array.isArray(value)) return null
  return value.map((segment, i) => {
    if (!Array.isArray(segment) || !segment[0]) return null
    const [text, formats] = segment
    let element = <>{text}</>
    if (Array.isArray(formats)) {
      for (const fmt of formats) {
        const type = Array.isArray(fmt) ? fmt[0] : fmt
        if (type === 'b') element = <strong>{element}</strong>
        else if (type === 'i') element = <em>{element}</em>
        else if (type === 's') element = <s>{element}</s>
        else if (type === 'c') element = <code>{element}</code>
        else if (type === 'a') element = <a href={Array.isArray(fmt) ? fmt[1] : '#'}>{element}</a>
      }
    }
    return <span key={i}>{element}</span>
  })
}

export default NotionPage
