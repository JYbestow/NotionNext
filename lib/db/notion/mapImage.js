import BLOG from '@/blog.config'
import { convertFileCdnUrl } from '@/lib/db/notion/convertFileCdnUrl'
import { siteConfig } from '../../config'

/**
 * 图片映射
 *
 * @param {*} img 图片地址，可能是相对路径，可能是外链
 * @param {*} block 数据块，可能是单个内容块，可能是Page
 * @param {*} type block 单个内容块 ； collection 集合列表
 * @param {*} from 来自
 * @returns
 */
/**
 * 已知失效的随机图源主机。
 *
 * source.unsplash.com 是 Unsplash 早已下线的随机图接口，实测上游返回
 * HTTP 503；而 Notion 页面的 page_cover 里常残留这类地址（模板示例页尤其
 * 常见），经 Notion 图床代理后只会变成一张永远加载不出的封面。
 *
 * 只按「主机名」精确匹配，避免误伤 images.unsplash.com（正常图床）等地址。
 */
const DEAD_IMAGE_HOSTS = ['source.unsplash.com']

/** 去掉 query / hash，便于做主机边界匹配 */
const stripUrlSuffix = value => String(value).split('#')[0].split('?')[0]

/**
 * 判断地址是否指向已知失效的随机图源。
 *
 * 需要同时覆盖三种常见形态：
 * 1. 直链：https://source.unsplash.com/random
 * 2. Notion 图床代理（原地址被编码进 path）：
 *    https://www.notion.so/image/https%3A%2F%2Fsource.unsplash.com%2Frandom...
 * 3. Notion CDN 外链代理：
 *    https://img.notionusercontent.com/ext/https://source.unsplash.com/random/.../size/
 *
 * 因此先按原样、再按 decodeURIComponent 后的结果，用「//主机」边界匹配，
 * 不使用裸子串（避免 ?ref=source.unsplash.com 这类误判）。
 */
export const isKnownDeadImageUrl = url => {
  if (typeof url !== 'string' || url === '') {
    return false
  }
  const candidates = [url]
  try {
    const decoded = decodeURIComponent(url)
    if (decoded !== url) {
      candidates.push(decoded)
    }
  } catch {
    // 非法编码：只用原样判断
  }
  return candidates.some(candidate => {
    const normalized = stripUrlSuffix(candidate)
    return DEAD_IMAGE_HOSTS.some(
      host =>
        normalized.includes(`//${host}`) ||
        normalized.toLowerCase().startsWith(host)
    )
  })
}

/**
 * 纯函数：对已知失效图源做确定性的 URL 规范化。
 *
 * 命中失效图源时返回项目自带的中性底板（与 SiteDataApi 的 defaultPageCover
 * 一致），其余情况原样返回。空值返回空串，不做任何补图。
 *
 * 由于规范化发生在「读取/消费」环节，旧缓存中遗留的失效地址同样会被改写，
 * 不依赖数据重新抓取。
 */
export const normalizeDeadImageUrl = (url, fallbackUrl) => {
  if (!url || typeof url !== 'string') {
    return url || ''
  }
  if (!isKnownDeadImageUrl(url)) {
    return url
  }
  // 注意：底板本身也可能是失效地址 —— HOME_BANNER_IMAGE 取自 Notion 站点封面
  // （lib/config.js 的 HOME_BANNER_IMAGE -> siteInfo.pageCover），当站点封面
  // 恰好就是这个随机图源时，直接把它当底板等于"回退到死链"，规范化变成空操作。
  // 因此这里校验底板有效性，无效则退回项目内置的中性图 /bg_image.jpg。
  const configured = fallbackUrl ?? BLOG.HOME_BANNER_IMAGE
  return configured && !isKnownDeadImageUrl(configured)
    ? configured
    : '/bg_image.jpg'
}

const mapImgUrl = (img, block, type = 'block', needCompress = true) => {
  if (!img) {
    return null
  }

  let ret = null
  // 相对目录，则视为notion的自带图片
  if (img.startsWith('/')) {
    ret = BLOG.NOTION_HOST + img
  } else {
    ret = img
  }
  const sourceUrl = ret

  // 新抓取 / 旧缓存进来的失效随机图地址，统一在映射入口规范化，
  // 既不引入新的远程图源，也不影响 images.unsplash.com 等其它图床地址。
  if (isKnownDeadImageUrl(sourceUrl)) {
    return normalizeDeadImageUrl(sourceUrl)
  }

  // 新CDN签名直链还原为 attachment: 标识，复用旧图床的转换逻辑（不受签名过期影响）
  const attachmentUrl = convertFileCdnUrl(ret)
  if (attachmentUrl) {
    ret = attachmentUrl
  }

  const hasConverted =
    ret.indexOf('https://www.notion.so/image') === 0 ||
    // 已转换的反代链接不再二次包装
    ret.indexOf(BLOG.NOTION_HOST + '/image/') === 0 ||
    ret.includes('notion.site/images/page-cover/')

  // 需要转化的URL ; 识别aws图床地址，或者bookmark类型的外链图片
  // Notion新图床资源 格式为 attachment:${id}:${name}
  // 外链 http(s) 图片也走 Notion /image/ 中转：直出时浏览器会带上本站
  // Referer，部分图床（如 smzdm）的 Referer 防盗链会直接拒绝（HTTP 567），
  // 而 Notion 原站经 img.notionusercontent.com 服务端转发不受影响。
  const isExternalHttpImage = /^https?:\/\//i.test(ret)
  const needConvert =
    !hasConverted &&
    (block.type === 'bookmark' ||
      isExternalHttpImage ||
      ret.includes('secure.notion-static.com') ||
      ret.includes('prod-files-secure') ||
      ret.indexOf('attachment') === 0)

  // 先应用源站压缩参数再交给 Notion 代理；放大时可再次调整源图尺寸。
  if (isExternalHttpImage && needCompress) {
    ret = compressImage(ret, block?.format?.block_width)
  }

  // Notion旧图床
  if (needConvert) {
    ret =
      BLOG.NOTION_HOST +
      '/image/' +
      encodeURIComponent(ret) +
      '?table=' +
      type +
      '&id=' +
      block.id
  }

  if (!isEmoji(ret) && ret.indexOf('notion.so/images/page-cover') < 0) {
    if (BLOG.RANDOM_IMAGE_URL) {
      // 只有配置了随机图片接口，才会替换图片
      const texts = BLOG.RANDOM_IMAGE_REPLACE_TEXT
      let isReplace = false
      if (texts) {
        const textArr = texts.split(',')
        // 原图地址尚未被代理编码，同时兼容既有的代理地址匹配规则。
        textArr.forEach(text => {
          if (sourceUrl.includes(text) || ret.includes(text)) {
            isReplace = true
          }
        })
      } else {
        isReplace = true
      }
      if (isReplace) {
        ret = BLOG.RANDOM_IMAGE_URL
      }
    }

    // 图片url优化，确保每一篇文章的图片url唯一
    if (
      ret &&
      ret.length > 4 &&
      !ret.includes('https://www.notion.so/images/')
    ) {
      // 图片接口拼接唯一识别参数，防止请求的图片被缓，而导致随机结果相同
      const separator = ret.includes('?') ? '&' : '?'
      ret = `${ret.trim()}${separator}t=${block.id}`
    }
  }

  // 统一压缩图片
  if (needCompress) {
    const width = block?.format?.block_width
    ret = compressImage(ret, width)
  }

  return ret
}

/**
 * 是否是emoji图标
 * @param {*} str
 * @returns
 */
function isEmoji(str) {
  const emojiRegex =
    /[\u{1F300}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}\u{238C}\u{2B06}\u{2B07}\u{2B05}\u{27A1}\u{2194}-\u{2199}\u{2194}\u{21A9}\u{21AA}\u{2934}\u{2935}\u{25AA}\u{25AB}\u{25FE}\u{25FD}\u{25FB}\u{25FC}\u{25B6}\u{25C0}\u{1F200}-\u{1F251}]/u
  return emojiRegex.test(str)
}

/**
 * 压缩图片
 * 1. Notion图床可以通过指定url-query参数来压缩裁剪图片 例如 ?xx=xx&width=400
 * 2. UnPlash 图片可以通过api q=50 控制压缩质量 width=400 控制图片尺寸
 * @param {*} image
 */
const compressImage = (image, width, quality = 50, fmt = 'webp') => {
  if (!image || image.indexOf('http') !== 0) {
    return image
  }

  if (image.includes('.svg')) return image

  if (!width || width === 0) {
    width = siteConfig('IMAGE_COMPRESS_WIDTH')
  }

  let urlObj
  let params
  try {
    urlObj = new URL(image)
    params = new URLSearchParams(urlObj.search)
  } catch (err) {
    // 如果解析失败，尝试 decodeURIComponent 再解析
    try {
      const decoded = decodeURIComponent(image)
      urlObj = new URL(decoded)
      params = new URLSearchParams(urlObj.search)
    } catch (e) {
      console.error('compressImage: Invalid URL:', image, err)
      return image
    }
  }

  // 放大图片时更新代理路径内的源图参数，保留外层 table、id 等代理信息。
  const proxyPrefix = [
    `${BLOG.NOTION_HOST}/image/`,
    'https://www.notion.so/image/'
  ].find(prefix => image.startsWith(prefix))
  if (proxyPrefix) {
    const proxyPath = new URL(proxyPrefix).pathname
    let sourceUrl
    try {
      sourceUrl = decodeURIComponent(urlObj.pathname.slice(proxyPath.length))
    } catch {
      return image
    }
    if (sourceUrl.startsWith('https://images.unsplash.com/')) {
      urlObj.pathname =
        proxyPath +
        encodeURIComponent(compressImage(sourceUrl, width, quality, fmt))
      return urlObj.toString()
    }
  }

  // Notion图床
  if (
    image.indexOf(BLOG.NOTION_HOST) === 0 &&
    image.indexOf('amazonaws.com') > 0
  ) {
    params.set('width', width)
    params.set('cache', 'v2')
    // 生成新的URL
    urlObj.search = params.toString()
    return urlObj.toString()
  } else if (image.indexOf('https://images.unsplash.com/') === 0) {
    // 压缩unsplash图片
    // 将q参数的值替换
    params.set('q', quality)
    // 尺寸
    params.set('width', width)
    // 格式
    params.set('fmt', fmt)
    params.set('fm', fmt)
    // 生成新的URL
    urlObj.search = params.toString()
    return urlObj.toString()
  } else if (image.indexOf('https://your_picture_bed') === 0) {
    // 此处还可以添加您的自定义图传的封面图压缩参数。
    // .e.g
    return 'do_somethin_here'
  }

  return image
}

export { compressImage, mapImgUrl }
