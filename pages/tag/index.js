import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { isSiteDataUnavailable } from '@/lib/site/listState'
import { DynamicLayout } from '@/themes/theme'
import { useRouter } from 'next/router'

/**
 * 标签首页
 * @param {*} props
 * @returns
 */
const TagIndex = props => {
  const router = useRouter()
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='LayoutTagIndex' {...props} />
}

export async function getStaticProps(req) {
  const { locale } = req

  const from = 'tag-index-props'
  const props = await fetchGlobalAllData({ from, locale })
  // 同 /category：在删除 allPages 之前识别「数据源读取失败」的兜底数据
  props.dataUnavailable = isSiteDataUnavailable(props)
  delete props.allPages
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

export default TagIndex
