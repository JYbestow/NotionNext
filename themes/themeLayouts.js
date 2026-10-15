import dynamic from 'next/dynamic'

/**
 * 各主题布局的【静态加载入口】。
 *
 * 为什么必须有这个文件（React #418 / #423 水合不匹配的根因）：
 * next/dynamic 的服务端渲染靠 loadable 在构建期解析出的 chunk 映射。之前布局加载器写成
 * `() => resolveThemeLayout(name, ...)`，内部再用模板字符串 `import(\`@/themes/\${name}\`)`，
 * 构建期无法判定具体 chunk。结果是：服务端 preloadAll() 渲染出真实布局，
 * 客户端首次水合却先渲染 loading 占位 → DOM 不一致 → 每个布局边界报一次 #418，并触发 #423。
 *
 * 实测对照（同一 dev 服务器，首页）：
 *   - 模板字符串/wrapper 形式：7 条水合告警
 *   - dynamic() 与字面量 import() 写在同一表达式内：0 条
 *
 * 因此这里为每个主题生成一个工厂，工厂体内直接 `dynamic(() => import('@/themes/<主题>'))`。
 * layoutName 仍在 .then 内运行时解析，主题切换 / 缺布局回退 / 空布局语义保持不变。
 * 新增主题时在此追加一条（或用 tools 脚本重新生成）。
 */

const getThemeExport = (mod, exportName) => {
  if (mod?.[exportName]) return mod[exportName]
  if (mod?.default?.[exportName]) return mod.default[exportName]
  if (exportName === 'LayoutBase' && typeof mod?.default === 'function') {
    return mod.default
  }
  return null
}

/** 与旧 resolveThemeLayout 完全一致的导出选择规则 */
export const pickLayout = (mod, layoutName) =>
  getThemeExport(mod, layoutName) || getThemeExport(mod, 'LayoutSlug') || null

export { getThemeExport }

/**
 * 主题名 -> 布局组件工厂。
 * @param {{layoutName:string, loading:React.ComponentType, empty:React.ComponentType, fallbackThemeName:string|null}} opts
 */
export const THEME_LAYOUT_FACTORIES = {
  claude: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/claude'), layoutName)
        if (!Layout && fallbackThemeName === 'endspace') {
          Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    ),
  commerce: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/commerce'), layoutName)
        if (!Layout && fallbackThemeName === 'endspace') {
          Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    ),
  endspace: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        if (!Layout && fallbackThemeName === 'example') {
          Layout = pickLayout(await import('@/themes/example'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    ),
  example: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/example'), layoutName)
        if (!Layout && fallbackThemeName === 'endspace') {
          Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    ),
  fukasawa: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/fukasawa'), layoutName)
        if (!Layout && fallbackThemeName === 'endspace') {
          Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    ),
  fuwari: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/fuwari'), layoutName)
        if (!Layout && fallbackThemeName === 'endspace') {
          Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    ),
  game: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/game'), layoutName)
        if (!Layout && fallbackThemeName === 'endspace') {
          Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    ),
  gitbook: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/gitbook'), layoutName)
        if (!Layout && fallbackThemeName === 'endspace') {
          Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    ),
  heo: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/heo'), layoutName)
        if (!Layout && fallbackThemeName === 'endspace') {
          Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    ),
  hexo: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/hexo'), layoutName)
        if (!Layout && fallbackThemeName === 'endspace') {
          Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    ),
  landing: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/landing'), layoutName)
        if (!Layout && fallbackThemeName === 'endspace') {
          Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    ),
  magzine: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/magzine'), layoutName)
        if (!Layout && fallbackThemeName === 'endspace') {
          Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    ),
  matery: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/matery'), layoutName)
        if (!Layout && fallbackThemeName === 'endspace') {
          Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    ),
  medium: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/medium'), layoutName)
        if (!Layout && fallbackThemeName === 'endspace') {
          Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    ),
  movie: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/movie'), layoutName)
        if (!Layout && fallbackThemeName === 'endspace') {
          Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    ),
  nav: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/nav'), layoutName)
        if (!Layout && fallbackThemeName === 'endspace') {
          Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    ),
  next: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/next'), layoutName)
        if (!Layout && fallbackThemeName === 'endspace') {
          Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    ),
  nobelium: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/nobelium'), layoutName)
        if (!Layout && fallbackThemeName === 'endspace') {
          Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    ),
  opc: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/opc'), layoutName)
        if (!Layout && fallbackThemeName === 'endspace') {
          Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    ),
  photo: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/photo'), layoutName)
        if (!Layout && fallbackThemeName === 'endspace') {
          Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    ),
  plog: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/plog'), layoutName)
        if (!Layout && fallbackThemeName === 'endspace') {
          Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    ),
  proxio: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/proxio'), layoutName)
        if (!Layout && fallbackThemeName === 'endspace') {
          Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    ),
  simple: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/simple'), layoutName)
        if (!Layout && fallbackThemeName === 'endspace') {
          Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    ),
  starter: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/starter'), layoutName)
        if (!Layout && fallbackThemeName === 'endspace') {
          Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    ),
  thoughtlite: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/thoughtlite'), layoutName)
        if (!Layout && fallbackThemeName === 'endspace') {
          Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    ),
  typography: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/typography'), layoutName)
        if (!Layout && fallbackThemeName === 'endspace') {
          Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    ),
  xuhome: ({ layoutName, loading, empty, fallbackThemeName }) =>
    dynamic(
      async () => {
        let Layout = pickLayout(await import('@/themes/xuhome'), layoutName)
        if (!Layout && fallbackThemeName === 'endspace') {
          Layout = pickLayout(await import('@/themes/endspace'), layoutName)
        }
        return { default: Layout || empty }
      },
      { ssr: true, loading }
    )
}

/** 取某主题的动态布局组件；未登记的主题返回 null（调用方保留旧回退路径）。 */
export const buildThemeLayout = (themeName, opts) => {
  const factory = themeName && THEME_LAYOUT_FACTORIES[themeName]
  if (!factory) return null
  return factory(opts)
}

export const REGISTERED_THEME_NAMES = ["claude","commerce","endspace","example","fukasawa","fuwari","game","gitbook","heo","hexo","landing","magzine","matery","medium","movie","nav","next","nobelium","opc","photo","plog","proxio","simple","starter","thoughtlite","typography","xuhome"]
export const THEME_LAYOUT_FALLBACKS = {"claude":"endspace","commerce":"endspace","endspace":"example","example":"endspace","fukasawa":"endspace","fuwari":"endspace","game":"endspace","gitbook":"endspace","heo":"endspace","hexo":"endspace","landing":"endspace","magzine":"endspace","matery":"endspace","medium":"endspace","movie":"endspace","nav":"endspace","next":"endspace","nobelium":"endspace","opc":"endspace","photo":"endspace","plog":"endspace","proxio":"endspace","simple":"endspace","starter":"endspace","thoughtlite":"endspace","typography":"endspace","xuhome":"endspace"}
