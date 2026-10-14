import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkStrIsNotionId, getLastPartOfUrl } from '@/lib/utils'
import { idToUuid } from 'notion-utils'
import BLOG from './blog.config'

/**
 * Clerk 身份验证中间件
 */
export const config = {
  // 这里设置白名单，防止静态资源被拦截
  matcher: ['/((?!.*\\..*|_next|/sign-in|/auth).*)', '/', '/(api|trpc)(.*)']
}

// 限制登录访问的路由
const isTenantRoute = createRouteMatcher([
  '/user/organization-selector(.*)',
  '/user/orgid/(.*)',
  '/dashboard',
  '/dashboard/(.*)'
])

// 限制权限访问的路由
const isTenantAdminRoute = createRouteMatcher([
  '/admin/(.*)/memberships',
  '/admin/(.*)/domain'
])

/**
 * 没有配置权限相关功能的返回
 * @param req
 * @param ev
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const noAuthMiddleware = async (req: NextRequest, ev: any) => {
  // 如果没有配置 Clerk 相关环境变量，返回一个默认响应或者继续处理请求
  if (BLOG['UUID_REDIRECT']) {
    let redirectJson: Record<string, string> = {}
    try {
      const response = await fetch(`${req.nextUrl.origin}/redirect.json`)
      if (response.ok) {
        redirectJson = (await response.json()) as Record<string, string>
      }
    } catch (err) {
      console.error('Error fetching static file:', err)
    }
    let lastPart = getLastPartOfUrl(req.nextUrl.pathname) as string
    if (checkStrIsNotionId(lastPart)) {
      lastPart = idToUuid(lastPart)
    }
    if (lastPart && redirectJson[lastPart]) {
      const redirectToUrl = req.nextUrl.clone()
      redirectToUrl.pathname = '/' + redirectJson[lastPart]
      console.log(
        `redirect from ${req.nextUrl.pathname} to ${redirectToUrl.pathname}`
      )
      return NextResponse.redirect(redirectToUrl, 308)
    }
  }
  return NextResponse.next()
}
/**
 * 鉴权中间件
 */
const authMiddleware = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  ? clerkMiddleware((auth, req) => {
      const { userId } = auth()
      // 处理 /dashboard 路由的登录保护
      if (isTenantRoute(req)) {
        if (!userId) {
          // 用户未登录，重定向到 /sign-in
          const url = new URL('/sign-in', req.url)
          url.searchParams.set('redirectTo', req.url) // 保存重定向目标
          return NextResponse.redirect(url)
        }
      }

      // 处理管理员相关权限保护
      if (isTenantAdminRoute(req)) {
        auth().protect(has => {
          return (
            has({ permission: 'org:sys_memberships:manage' }) ||
            has({ permission: 'org:sys_domains_manage' })
          )
        })
      }

      // 默认继续处理请求
      return NextResponse.next()
    })
  : noAuthMiddleware

/**
 * 旧的中文分类前缀 -> 新的英文前缀（301）
 *
 * blog.config.js 里的 POST_URL_PREFIX_MAPPING_CATEGORY 生效后，文章 URL 会从
 * /课程/xxx 变成 /courses/xxx。已分享出去的链接、搜索引擎收录、老书签都要能跳过去，
 * 否则一律 404。
 *
 * 为什么不用 next.config.js 的 redirects：Next 匹配 redirects 时用的是
 * 「百分号编码后的」pathname，而 source 里的中文是字面量，实测永远匹配不上
 * （加不加 /zh-CN 前缀都是 404）。中间件里可以自己 decodeURIComponent，
 * 中文字面量和编码形式两种请求都能认出来。
 *
 * 改这里的键时，必须同步改 blog.config.js 的 POST_URL_PREFIX_MAPPING_CATEGORY。
 */
const LEGACY_CATEGORY_PREFIX: Record<string, string> = {
  课程: 'courses',
  妙妙工具: 'tools',
  生活: 'life'
}

/**
 * 命中旧分类前缀就返回新的目标 URL，否则返回 null
 * @param req
 */
function matchLegacyCategoryPath(req: NextRequest): URL | null {
  let pathname = req.nextUrl.pathname
  try {
    // 非 ASCII 路径到中间件这里可能还是编码形态，解一次再比
    pathname = decodeURIComponent(pathname)
  } catch (_) {
    // 解码失败就用原样，不影响后续判断
  }
  for (const [legacy, current] of Object.entries(LEGACY_CATEGORY_PREFIX)) {
    if (pathname === `/${legacy}` || pathname.startsWith(`/${legacy}/`)) {
      const target = req.nextUrl.clone()
      // 只换掉开头的分类段，后面的 slug 和 query 原样保留
      target.pathname = `/${current}${pathname.slice(legacy.length + 1)}`
      return target
    }
  }
  return null
}

/**
 * 顶层中间件：先处理旧链接 301，再走原来的鉴权逻辑。
 * 直接包一层而不是塞进 noAuthMiddleware，是因为配置了 Clerk 时会走
 * clerkMiddleware 分支，那样这个重定向就失效了。
 */
const middleware = async (req: NextRequest, ev: any) => {
  const legacyRedirect = matchLegacyCategoryPath(req)
  if (legacyRedirect) {
    return NextResponse.redirect(legacyRedirect, 301)
  }
  return (authMiddleware as any)(req, ev)
}

export default middleware
