import BLOG, { LAYOUT_MAPPINGS } from '@/blog.config'
import getConfig from 'next/config'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getQueryParam, getQueryVariable, isBrowser } from '../lib/utils'
import { buildThemeLayout, getThemeExport } from './themeLayouts'

// 在next.config.js中扫描所有主题
export const { THEMES = [] } = getConfig()?.publicRuntimeConfig || {}
const baseLayoutCache = new Map()
const layoutByThemeCache = new Map()
let domFixTimer = null

const LayoutLoading = () => (
  <div className='min-h-screen w-full bg-[#f6f6f1] dark:bg-black' />
)

const EmptyBaseLayout = ({ children }) => <>{children}</>
const EmptyPageLayout = () => null

const IndexLayoutLoading = () => (
  <div className='pt-10 md:pt-18 w-full bg-[#f6f6f1] dark:bg-black'>
    <div className='mx-auto w-full max-w-screen-3xl px-4 py-10 lg:px-0'>
      <div className='grid gap-10 xl:grid-cols-2'>
        <section className='space-y-5'>
          <div className='h-80 w-full animate-pulse bg-gray-200 dark:bg-gray-800' />
          <div className='h-10 w-4/5 animate-pulse bg-gray-200 dark:bg-gray-800' />
          <div className='h-4 w-2/3 animate-pulse bg-gray-200 dark:bg-gray-800' />
          <div className='h-4 w-24 animate-pulse bg-gray-200 dark:bg-gray-800' />
        </section>
        <section className='space-y-6'>
          <div className='h-48 w-full animate-pulse bg-gray-200 dark:bg-gray-800' />
          {[0, 1].map(item => (
            <div
              key={item}
              className='flex gap-6 border-t border-gray-300 pt-6 dark:border-gray-800'>
              <div className='min-w-0 flex-1 space-y-3'>
                <div className='h-6 w-4/5 animate-pulse bg-gray-200 dark:bg-gray-800' />
                <div className='h-4 w-2/3 animate-pulse bg-gray-200 dark:bg-gray-800' />
                <div className='h-4 w-20 animate-pulse bg-gray-200 dark:bg-gray-800' />
              </div>
              <div className='h-32 w-32 shrink-0 animate-pulse bg-gray-200 dark:bg-gray-800' />
            </div>
          ))}
        </section>
      </div>

      <section className='mt-12'>
        <div className='flex items-center justify-between'>
          <div className='h-7 w-28 animate-pulse bg-gray-200 dark:bg-gray-800' />
          <div className='h-5 w-24 animate-pulse bg-gray-200 dark:bg-gray-800' />
        </div>
        <div className='mt-6 grid gap-8 md:grid-cols-2 xl:grid-cols-4'>
          {[0, 1, 2, 3].map(item => (
            <div
              key={item}
              className='space-y-4 border-t border-gray-300 pt-5 dark:border-gray-800'>
              <div className='h-5 w-3/4 animate-pulse bg-gray-200 dark:bg-gray-800' />
              <div className='h-4 w-24 animate-pulse bg-gray-200 dark:bg-gray-800' />
            </div>
          ))}
        </div>
      </section>
    </div>
  </div>
)

const getLayoutLoading = layoutName => {
  if (layoutName === 'LayoutIndex') {
    return IndexLayoutLoading
  }
  return LayoutLoading
}

const normalizeThemeName = themeValue => {
  if (!themeValue || typeof themeValue !== 'string') return BLOG.THEME
  const firstTheme = themeValue.split(',')[0].trim()
  if (!firstTheme) return BLOG.THEME
  return THEMES.includes(firstTheme) ? firstTheme : BLOG.THEME
}

const getFallbackThemeName = themeName => {
  const preferred = normalizeThemeName(BLOG.THEME)
  if (preferred && preferred !== themeName) return preferred
  if (THEMES.includes('example') && themeName !== 'example') return 'example'
  return THEMES.find(item => item !== themeName) || null
}

// getThemeExport 统一放在 themes/themeLayouts.js（布局工厂也用它），这里只 import。

const scheduleFixThemeDOM = (delay = 120) => {
  if (!isBrowser) return
  if (domFixTimer) {
    clearTimeout(domFixTimer)
  }
  domFixTimer = setTimeout(() => {
    fixThemeDOM()
    domFixTimer = null
  }, delay)
}

// 未登记在 themes/themeLayouts.js 的主题（例如刚新建还没补进去）仍用运行时动态导入兜底：
// 功能不缺失，但这类页面可能有一次水合切换。
async function importThemeConfig(themeFolderName) {
  try {
    const mod = await import(`@/themes/${themeFolderName}`)
    return getThemeExport(mod, 'THEME_CONFIG')
  } catch (err) {
    console.error(`Failed to load theme config "${themeFolderName}":`, err)
    return null
  }
}

async function importThemeLayout(themeFolderName, layoutName) {
  try {
    const mod = await import(`@/themes/${themeFolderName}`)
    return (
      getThemeExport(mod, layoutName) ||
      getThemeExport(mod, 'LayoutSlug') ||
      null
    )
  } catch (err) {
    console.error(`Failed to load theme "${themeFolderName}":`, err)
    return null
  }
}

async function resolveThemeLayout(themeName, layoutName, emptyLayout) {
  let Layout = await importThemeLayout(themeName, layoutName)
  if (Layout) return Layout

  const fallback = getFallbackThemeName(themeName)
  if (fallback) {
    Layout = await importThemeLayout(fallback, layoutName)
    if (Layout) {
      console.warn(
        `[theme] "${themeName}" missing "${layoutName}", using fallback "${fallback}".`
      )
      return Layout
    }
  }

  console.warn(`[theme] "${themeName}" missing "${layoutName}", using empty layout.`)
  return emptyLayout
}

/**
 * 获取主题配置（始终动态加载，与运行时 BLOG.THEME / URL ?theme 一致；不依赖编译期别名）。
 * @param {string} themeQuery - 主题查询参数（支持多个主题用逗号分隔）
 * @returns {Promise<object|null>} 主题配置对象
 */
export const getThemeConfig = async themeQuery => {
  const themeName = normalizeThemeName(themeQuery)
  let cfg = await importThemeConfig(themeName)
  if (cfg) {
    return cfg
  }
  const fallback = normalizeThemeName(BLOG.THEME)
  if (fallback !== themeName) {
    cfg = await importThemeConfig(fallback)
    if (cfg) {
      console.warn(
        `[theme] "${themeName}" config unavailable, using fallback "${fallback}".`
      )
      return cfg
    }
  }
  console.warn('[theme] No theme configuration could be loaded, using empty config.')
  return {}
}

/**
 * 解析当前需要渲染的主题（**水合安全**）。
 *
 * 为什么不能在渲染期直接读 ?theme=（本轮修复的核心）：
 * 站点页面使用 getStaticProps + revalidate（ISR），预渲染 HTML 只与“路径”绑定，
 * 查询串不参与渲染。实测线上 /、/?theme=hexo、/?theme=medium 三份 HTML 字节完全相同
 * （143193B，均为配置主题的 Endspace 布局，animate-pulse=0）。
 * 因此服务端（与 CDN 缓存）永远输出【配置主题】的布局；若客户端首次渲染就直接采用
 * ?theme=hexo，则与服务端 HTML 不一致 —— 即 #418×4 + #423×1 的根因。
 *
 * 另外，非默认主题的布局组件此前是在“渲染期间”才由 createBaseLayoutComponent /
 * createPageLayoutComponent 创建 dynamic()，不在 preloadReady() 的初始集合里，于是首次
 * 客户端渲染只能输出 LayoutLoading 占位（dev 栈：at LayoutLoading → at GLayout）。
 *
 * 处理方式：
 *  - 服务端渲染与水合期一律返回【配置主题】（与 HTML 一致，布局组件全部命中模块作用域缓存）；
 *  - ?theme= 预览在水合完成后的 effect 中生效，切换前先 registerLayoutsForTheme(主题)，
 *    让预览主题的 loadable 提前就绪；因为此时水合已经结束，这些 loadable 不会进入
 *    preloadAll() / preloadReady() 的作用范围 —— 正常访问不会多加载任何主题 chunk。
 *
 * @param {string} presetTheme 页面/Notion 配置里的主题（即服务端实际使用的那个）
 * @returns {string} 已通过 THEMES 校验的主题名
 */
export const useResolvedTheme = presetTheme => {
  const router = useRouter()
  const configuredTheme = normalizeThemeName(presetTheme || BLOG.THEME)
  const [previewTheme, setPreviewTheme] = useState(null)

  useEffect(() => {
    const queryTheme = getQueryParam(router?.asPath, 'theme')
    const normalizedQueryTheme = queryTheme
      ? normalizeThemeName(queryTheme)
      : null

    if (!normalizedQueryTheme || normalizedQueryTheme === configuredTheme) {
      setPreviewTheme(current => (current === null ? current : null))
      return
    }

    // 水合已经结束，这里注册不会扩大 SSR/水合的预加载范围
    registerLayoutsForTheme(normalizedQueryTheme)
    setPreviewTheme(current =>
      current === normalizedQueryTheme ? current : normalizedQueryTheme
    )
  }, [router?.asPath, configuredTheme])

  return previewTheme || configuredTheme
}

/**
 * 创建某个主题的基础布局组件。
 * 注意：next/dynamic 要求 dynamic() 位于模块顶层，不能在 render 期间调用 —— 原因见下方
 * registerLayoutsForTheme 的说明。
 */
const createBaseLayoutComponent = normalizedTheme =>
  buildThemeLayout(normalizedTheme, {
    layoutName: 'LayoutBase',
    loading: LayoutLoading,
    empty: EmptyBaseLayout,
    fallbackThemeName: getFallbackThemeName(normalizedTheme)
  }) ||
  // 未登记主题（例如刚新建还没补进 themes/themeLayouts.js）走旧路径，功能不缺失。
  dynamic(
    () => resolveThemeLayout(normalizedTheme, 'LayoutBase', EmptyBaseLayout),
    { ssr: true, loading: LayoutLoading }
  )

/** 创建某个主题的页面布局组件。 */
const createPageLayoutComponent = (themeName, layoutName) =>
  buildThemeLayout(themeName, {
    layoutName,
    loading: getLayoutLoading(layoutName),
    empty: EmptyPageLayout,
    fallbackThemeName: getFallbackThemeName(themeName)
  }) ||
  dynamic(() => resolveThemeLayout(themeName, layoutName, EmptyPageLayout), {
    ssr: true,
    loading: getLayoutLoading(layoutName)
  })

/** 应用实际会请求的布局名（取自 LAYOUT_MAPPINGS，不额外硬编码）。 */
const EAGER_LAYOUT_NAMES = [
  ...new Set(Object.values(LAYOUT_MAPPINGS || {}))
].filter(Boolean)

/**
 * 在模块作用域预注册某个主题的所有布局。
 *
 * Next.js 会在每次渲染前调用 Loadable.preloadAll()（next/dist/server/render.js），
 * 而它只 flush “此刻已经注册”的 loadable。若 dynamic() 是在 render 期间才调用的，
 * 对应的 init 注册得太晚，本轮的 loader 不会被 await：首次渲染只能输出 loading 占位。
 * 而 next/dynamic 默认的 loading 在生产环境直接返回 null（见 dynamic.js），
 * 基础布局又恰好没有传 loading —— 于是 #__next 整个为空。
 *
 * 表现就是：同一个进程里 “第一个渲染某布局的页面” SSR 出空壳或骨架，
 * 之后的页面因为模块级缓存命中、且 loadable 已被下一轮 preloadAll() flush 过，才正常。
 * 哪一页排在第一取决于构建期预渲染顺序，所以同一提交重复构建时异常页面集合会漂移，
 * 而这些空壳 HTML 会被写进 .next/server/pages 并由 CDN 原样返回。
 *
 * 在模块作用域预先注册后，preloadAll() 能覆盖它们，SSR 始终输出真实布局。
 */
const registerLayoutsForTheme = themeName => {
  if (!themeName) return
  for (const layoutName of EAGER_LAYOUT_NAMES) {
    if (layoutName === 'LayoutBase') {
      if (!baseLayoutCache.has(themeName)) {
        baseLayoutCache.set(themeName, createBaseLayoutComponent(themeName))
      }
      continue
    }
    const cacheKey = `${themeName}:${layoutName}`
    if (!layoutByThemeCache.has(cacheKey)) {
      layoutByThemeCache.set(
        cacheKey,
        createPageLayoutComponent(themeName, layoutName)
      )
    }
  }
}

registerLayoutsForTheme(normalizeThemeName(BLOG.THEME))

/**
 * 加载全局布局
 * @param {*} theme
 * @returns
 */
export const getBaseLayoutByTheme = theme => {
  const normalizedTheme = normalizeThemeName(theme)
  if (baseLayoutCache.has(normalizedTheme)) {
    return baseLayoutCache.get(normalizedTheme)
  }
  const DynamicBaseLayout = createBaseLayoutComponent(normalizedTheme)
  baseLayoutCache.set(normalizedTheme, DynamicBaseLayout)
  return DynamicBaseLayout
}

/**
 * 动态获取布局
 * @param {*} props
 */
export const DynamicLayout = props => {
  const { theme, layoutName } = props
  const SelectedLayout = useLayoutByTheme({ layoutName, theme })
  return <SelectedLayout {...props} />
}

/**
 * 加载主题文件
 * @param {*} layoutName
 * @param {*} theme
 * @returns
 */
export const useLayoutByTheme = ({ layoutName, theme }) => {
  // 与 _app.js 的 GLayout 共用同一套解析规则：服务端与水合期固定为配置主题，
  // ?theme= 预览在水合后生效 —— 保证基础布局与页面布局始终是同一个主题。
  const themeQuery = useResolvedTheme(theme)
  const cacheKey = `${themeQuery}:${layoutName}`

  if (layoutByThemeCache.has(cacheKey)) {
    scheduleFixThemeDOM(themeQuery === BLOG.THEME ? 80 : 240)
    return layoutByThemeCache.get(cacheKey)
  }

  const DynamicLayoutComponent = createPageLayoutComponent(
    themeQuery,
    layoutName
  )
  layoutByThemeCache.set(cacheKey, DynamicLayoutComponent)
  scheduleFixThemeDOM(themeQuery === BLOG.THEME ? 80 : 240)
  return DynamicLayoutComponent
}

/**
 * 根据路径 获取对应的layout名称
 * @param {*} path
 * @returns
 */
const getLayoutNameByPath = path => {
  const layoutName = LAYOUT_MAPPINGS[path] || 'LayoutSlug'
  //   console.log('path-layout',path,layoutName)
  return layoutName
}

/**
 * 切换主题时的特殊处理
 * 删除多余的元素
 */
const fixThemeDOM = () => {
  if (isBrowser) {
    const elements = document.querySelectorAll('[id^="theme-"]')
    if (elements?.length > 1) {
      for (let i = 0; i < elements.length - 1; i++) {
        if (
          elements[i] &&
          elements[i].parentNode &&
          elements[i].parentNode.contains(elements[i])
        ) {
          elements[i].parentNode.removeChild(elements[i])
        }
      }
      elements[0]?.scrollIntoView()
    }
  }
}

/**
 * 初始化主题 , 优先级 query > cookies > systemPrefer
 * @param isDarkMode
 * @param updateDarkMode 更改主题ChangeState函数
 * @description 读取cookie中存的用户主题
 */
export const initDarkMode = (updateDarkMode, defaultDarkMode) => {
  // 查看用户设备浏览器是否深色模型
  let newDarkMode = isPreferDark()

  // 查看localStorage中用户记录的是否深色模式
  const userDarkMode = loadDarkModeFromLocalStorage()
  if (userDarkMode) {
    newDarkMode = userDarkMode === 'dark' || userDarkMode === 'true'
    saveDarkModeToLocalStorage(newDarkMode) // 用户手动的才保存
  }

  // 如果站点强制设置默认深色，则优先级改过用
  if (defaultDarkMode === 'true') {
    newDarkMode = true
  }

  // url查询条件中是否深色模式
  const queryMode = getQueryVariable('mode')
  if (queryMode) {
    newDarkMode = queryMode === 'dark'
  }

  updateDarkMode(newDarkMode)
  document
    .getElementsByTagName('html')[0]
    .setAttribute('class', newDarkMode ? 'dark' : 'light')
}

/**
 * 是否优先深色模式， 根据系统深色模式以及当前时间判断
 * @returns {*}
 */
export function isPreferDark() {
  if (BLOG.APPEARANCE === 'dark') {
    return true
  }
  if (BLOG.APPEARANCE === 'auto') {
    // 系统深色模式或时间是夜间时，强行置为夜间模式
    const date = new Date()
    const prefersDarkMode = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
    return (
      prefersDarkMode ||
      (BLOG.APPEARANCE_DARK_TIME &&
        (date.getHours() >= BLOG.APPEARANCE_DARK_TIME[0] ||
          date.getHours() < BLOG.APPEARANCE_DARK_TIME[1]))
    )
  }
  return false
}

/**
 * 读取深色模式
 * @returns {*}
 */
export const loadDarkModeFromLocalStorage = () => {
  return localStorage.getItem('darkMode')
}

/**
 * 保存深色模式
 * @param newTheme
 */
export const saveDarkModeToLocalStorage = newTheme => {
  localStorage.setItem('darkMode', newTheme)
}
