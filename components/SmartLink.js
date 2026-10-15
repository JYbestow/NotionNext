import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { siteConfig } from '@/lib/config'

/**
 * 读取需要沿站内链接保留的当前页查询串（例如 ?theme=hexo、?target=comment）。
 *
 * 为什么必须等水合完成（本轮修复）：
 * 服务端渲染时没有 window.location，而客户端【首次水合渲染】时 window 已经存在。
 * 若首渲染直接读 window.location.search，同一个 <a> 的 href 就会变成
 * “/about?theme=hexo”，而服务端输出的是 “/about”，React 会报
 * `Prop href did not match. Server: "/about" Client: "/about?theme=hexo"`
 * （在主题预览页面上实测每页 3 条）。
 * 因此：首渲染一律返回空对象（与服务端一致），水合完成后由 effect 填入真实查询串，
 * 并在路由变化时重新计算。功能（跨页保留 query）保持不变，只是延后到水合之后。
 */
const usePersistedQuery = () => {
  const router = useRouter()
  const [persistedQuery, setPersistedQuery] = useState({})

  useEffect(() => {
    const next = {}
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search?.slice(1) || '')
      for (const [key, value] of params.entries()) {
        if (value !== '') next[key] = value
      }
    }
    setPersistedQuery(prev => {
      const prevKeys = Object.keys(prev)
      const nextKeys = Object.keys(next)
      const same =
        prevKeys.length === nextKeys.length &&
        nextKeys.every(key => prev[key] === next[key])
      return same ? prev : next
    })
  }, [router?.asPath])

  return persistedQuery
}

// 过滤 <a> 标签不能识别的 props
const filterDOMProps = props => {
  const {
    passHref,
    legacyBehavior,
    placeholderSrc,
    fallbackSrc,
    ...rest
  } = props
  return rest
}

// 过滤不应该透传给 next/link 的非链接属性
const filterLinkProps = props => {
  const {
    placeholderSrc,
    fallbackSrc,
    src,
    alt,
    width,
    height,
    loading,
    decoding,
    onLoad,
    onError,
    ...rest
  } = props
  return rest
}

const SmartLink = ({ href, children, ...rest }) => {
  const LINK = siteConfig('LINK')
  // 水合安全：首渲染为空对象（与服务端一致），水合后才带上真实查询串
  const persistedQuery = usePersistedQuery()

  // 获取 URL 字符串用于判断是否是外链
  let urlString = ''

  if (typeof href === 'string') {
    urlString = href
  } else if (
    typeof href === 'object' &&
    href !== null &&
    typeof href.pathname === 'string'
  ) {
    urlString = href.pathname
  }

  const isExternal = urlString.startsWith('http') && !urlString.startsWith(LINK)

  const mergePreservedQueryForStringHref = value => {
    if (typeof value !== 'string' || !value || value.startsWith('#')) return value
    if (Object.keys(persistedQuery).length === 0) return value

    const isAbsolute = value.startsWith('http://') || value.startsWith('https://')
    const url = new URL(value, LINK)
    Object.entries(persistedQuery).forEach(([key, paramValue]) => {
      if (!url.searchParams.has(key)) {
        url.searchParams.set(key, paramValue)
      }
    })

    if (isAbsolute) return url.toString()
    return `${url.pathname}${url.search}${url.hash}`
  }

  const mergePreservedQueryForObjectHref = value => {
    if (!value || typeof value !== 'object') return value
    if (Object.keys(persistedQuery).length === 0) return value
    return {
      ...value,
      query: {
        ...persistedQuery,
        ...(value.query || {})
      }
    }
  }

  if (isExternal) {
    // 对于外部链接，必须是 string 类型
    const externalUrl =
      typeof href === 'string' ? href : new URL(href.pathname, LINK).toString()

    return (
      <a
        href={externalUrl}
        target='_blank'
        rel='noopener noreferrer'
        {...filterDOMProps(rest)}>
        {children}
      </a>
    )
  }

  // 内部链接（可为对象形式）
  const mergedHref =
    typeof href === 'string'
      ? mergePreservedQueryForStringHref(href)
      : mergePreservedQueryForObjectHref(href)

  return (
    <Link href={mergedHref} {...filterLinkProps(rest)}>
      {children}
    </Link>
  )
}

export default SmartLink
