import { idToUuid } from 'notion-utils'
import { checkStrIsNotionId, getLastPartOfUrl, isBrowser } from '../../utils'

/**
 * 处理页面内连接跳转:
 * 1.若是本站域名，则在当前窗口打开、不开新窗口
 * 2.url是notion-id，转成站内文章链接
 */
export const convertInnerUrl = ({
  allPages,
  lang,
  innerPageUrlParentPath = false
}) => {
  if (!isBrowser) {
    return
  }
  const allAnchorTags = document
    ?.getElementById('notion-article')
    ?.querySelectorAll('a.notion-link, a.notion-collection-card, a.notion-page-link')

  if (!allAnchorTags) {
    return
  }
  const { origin, pathname } = window.location
  const currentURL = origin + pathname
  const currentPathLang = pathname.split('/').filter(Boolean)[0]
  const langPrefix = lang === currentPathLang ? '/' + lang : ''
  const currentPath = pathname.replace(/\/$/, '') || '/'
  for (const anchorTag of allAnchorTags) {
    // url替换成slug
    if (anchorTag?.href) {
      // 如果url是一个Notion_id，尝试匹配成博客的文章内链
      // 先去除查询参数和 hash，避免 ?pvs=4 等后缀干扰 ID 提取
      let hrefPath = anchorTag.href
      try {
        hrefPath = new URL(anchorTag.href).pathname
      } catch (_) {
        // 非标准 URL，回退到手动去 query/hash
        hrefPath = anchorTag.href.split('?')[0].split('#')[0]
      }
      const slug = getLastPartOfUrl(hrefPath)
      if (checkStrIsNotionId(slug)) {
        const slugPage = allPages?.find(page => {
          return idToUuid(slug).indexOf(page.short_id) === 14
        })
        if (slugPage) {
          anchorTag.href = langPrefix + slugPage?.href
        } else if (
          innerPageUrlParentPath &&
          anchorTag.classList?.contains('notion-page-link')
        ) {
          anchorTag.href =
            currentPath === '/' ? `/${slug}` : `${currentPath}/${slug}`
        }
      }
    }
    // 链接在当前页面打开（仅限「指向当前页」的链接）
    if (anchorTag?.target === '_blank') {
      // 修复运算符优先级缺陷：原写法
      //   currentURL.split('#')[0] || '' + anchorTag.href.split('#')[1] || ''
      // 因 `+` 优先于 `||`，实际等价于
      //   currentURL.split('#')[0] || (('' + anchorTag.href.split('#')[1]) || '')
      // 而左侧（当前页 URL）恒为真，于是下面的第二个比较恒成立，
      // 结果 #notion-article 内所有 target="_blank" 的链接都被改成 _self
      // —— 这正是「服务端 _blank、水合后被重置为 _self」的根因
      // （友链画册的外链卡片首当其冲）。
      // 现在按原意比较：链接指向当前页（可带 hash）时才在当前窗口打开。
      const hrefWithoutQueryHash = anchorTag.href.split('?')[0].split('#')[0]
      const hrefWithoutHash = anchorTag.href.split('#')[0]
      if (
        currentURL === hrefWithoutQueryHash ||
        currentURL === hrefWithoutHash
      ) {
        anchorTag.target = '_self'
      }
    }

    // 如果链接以#号结尾，则强制在新窗口打开
    if (anchorTag.href.endsWith('#')) {
      anchorTag.target = '_blank'
    }
  }
}
