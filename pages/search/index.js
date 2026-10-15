import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { isSiteDataUnavailable } from '@/lib/site/listState'
import { DynamicLayout } from '@/themes/theme'
import { useRouter } from 'next/router'

/**
 * 搜索路由
 * @param {*} props
 * @returns
 */
const Search = props => {
  const { posts } = props

  const router = useRouter()
  const rawKeyword = router?.query?.s
  // ?s=a&s=b 会得到数组，取第一个；其余情况保持字符串/undefined
  const keyword = Array.isArray(rawKeyword) ? rawKeyword[0] : rawKeyword

  // posts 可能因数据源不可用而为 undefined，这里兜底为空数组，
  // 否则带关键词访问 /search?s=xxx 时会直接抛错并渲染成错误页。
  const safePosts = Array.isArray(posts) ? posts : []
  const asText = value => {
    if (Array.isArray(value)) return value.join(' ')
    return value ? String(value) : ''
  }

  let filteredPosts
  // 静态过滤
  if (keyword) {
    const needle = String(keyword).toLowerCase()
    filteredPosts = safePosts.filter(post => {
      if (!post) return false
      const searchContent =
        asText(post.title) +
        asText(post.summary) +
        asText(post.tags) +
        asText(post.category)
      return searchContent.toLowerCase().includes(needle)
    })
  } else {
    filteredPosts = []
  }

  props = {
    ...props,
    posts: filteredPosts,
    postCount: filteredPosts.length,
    keyword: keyword || ''
  }

  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='LayoutSearch' {...props} />
}

/**
 * 浏览器前端搜索
 */
export async function getStaticProps({ locale }) {
  const props = await fetchGlobalAllData({
    from: 'search-props',
    locale
  })
  const { allPages } = props
  props.posts = allPages?.filter(
    page => page.type === 'Post' && page.status === 'Published'
  )
  // 数据源读取失败（兜底数据）与「搜索无结果」必须分开报
  props.dataUnavailable = isSiteDataUnavailable(props)
  return {
    props,
    revalidate: process.env.EXPORT
      ? undefined
      : siteConfig(
          'NEXT_REVALIDATE_SECOND',
          BLOG.NEXT_REVALIDATE_SECOND,
          props.NOTION_CONFIG
        )
  }
}

export default Search
