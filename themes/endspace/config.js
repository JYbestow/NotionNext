/**
 * Endspace Theme - Endfield Style Configuration
 * 重要配置项，默认值均为当前效果
 * 
 * ============================================
 * 特殊页面配置说明 (Special Pages)
 * ============================================
 * 
 * 以下页面的入口路径不要硬编码，统一用 siteConfig 读取，
 * 这样在 Notion 配置表里改一个键就能生效（Notion 配置 > blog.config.js > 调用点默认值）：
 * - 【关于我】ENDSPACE_PATH_ABOUT      默认 '/about'，点击侧边栏头像跳转
 * - 【作品集】ENDSPACE_PATH_PORTFOLIO  默认 '/portfolio'，由 ENDSPACE_MENU_PORTFOLIO 控制是否显示
 * - 【友链】  ENDSPACE_PATH_FRIENDS    默认 '/links'
 *
 * 早期版本把 '/aboutme'、'/portfolio'、'/friends' 当成了固定路径，与 Notion 里实际的
 * slug 对不上就会 404；现已全部改为 siteConfig + 与真实 slug 一致的默认值。
 */

const CONFIG = {
  // ============================================
  // 加载动画 (Loading Animation)
  // ============================================
  ENDSPACE_LOADING_COVER: true, // 是否显示加载动画
  
  // 加载动画显示的站点名称 (右侧竖排大字)
  ENDSPACE_LOADING_SITE_NAME: 'GAGASAMA', // 站点名称，显示在加载动画右侧
  
  // 加载进度文字 (不同阶段)
  ENDSPACE_LOADING_TEXT_INIT: 'INITIALIZING', // 初始化阶段显示的文字
  ENDSPACE_LOADING_TEXT_LOADING: 'LOADING', // 加载阶段显示的文字
  ENDSPACE_LOADING_TEXT_COMPLETE: 'READY', // 加载完成阶段显示的文字
  ENDSPACE_LOADING_TEXT_SWEEPING: 'LAUNCHING', // 扫描阶段显示的文字
  ENDSPACE_LOADING_TEXT_FADEOUT: 'WELCOME', // 淡出阶段显示的文字
  
  // 加载动画中的图片，可以使用public目录下的图片如'/images/logo.png'，也可以使用url如https://example.com/image.png
  ENDSPACE_LOADING_IMAGE: '/favicon.svg', // 加载动画中显示的图片（默认使用站点 favicon SVG）

  // ============================================
  // 主题调色 (Theme Colors)
  // ============================================
  ENDSPACE_COLOR_BG_BASE: '#fafafa',
  ENDSPACE_COLOR_SURFACE: '#ffffff',
  ENDSPACE_COLOR_TEXT: '#0a0a0a', // 与个人主页 --ink 同值
  ENDSPACE_COLOR_TEXT_SECONDARY: '#5a5a5a', // 与个人主页 --gray-text 同值
  ENDSPACE_COLOR_ACCENT: '#FFFA00', // 与个人主页 --signal 同值
  ENDSPACE_COLOR_ACCENT_DIM: 'rgba(255, 250, 0, 0.15)',
  ENDSPACE_COLOR_BORDER: '#d9d9d9', // 与个人主页 --line 同值

  // ============================================
  // 水印文字配置 (Watermark Text)
  // ============================================
  // 首页标题栏背景滚动水印文字（大字循环动画）
  ENDSPACE_BANNER_WATERMARK_TEXT: 'GAGASAMA',
  // 文章详情页右上角水印文字
  ENDSPACE_ARTICLE_WATERMARK_TEXT: 'GAGASAMA',

  // ============================================
  // 菜单配置 (Menu)
  // ============================================
  ENDSPACE_MENU_CATEGORY: true, // 显示分类菜单（默认合并到 Archive）
  ENDSPACE_MENU_TAG: false, // 显示标签菜单（默认合并到 Archive）
  ENDSPACE_MENU_ARCHIVE: true, // 显示归档菜单
  ENDSPACE_MENU_SEARCH: true, // 显示搜索菜单（默认合并到 Archive）

  // ============================================
  // 文章列表 (Post List)
  // ============================================
  ENDSPACE_POST_LIST_COVER: true, // 文章列表是否显示封面图
  ENDSPACE_POST_LIST_PREVIEW: true, // 文章列表是否显示摘要预览

  // ============================================
  // 文章详情页 (Article Page)
  // ============================================
  ENDSPACE_ARTICLE_LAYOUT_VERTICAL: false, // 文章页是否使用垂直布局
  ENDSPACE_ARTICLE_ADJACENT: true, // 是否显示上一篇/下一篇文章导航

  // ============================================
  // 视觉体系 (Design System) —— 与个人主页 jybestow.github.io 统一
  // ============================================
  /**
   * Endfield 式「根字号随视口等比放大」。
   * 开启后 1920 宽屏会把根字号推到 19.2px、2560 推到上限 24px（+50%），
   * 所有 rem 尺寸（正文宽度、封面高度、间距、字号）一起膨胀，
   * 结果是大屏首页一屏只放得下一篇。博客是阅读型站点，默认关闭；
   * 如果确实需要游戏官网那种整体等比缩放的观感，再打开它。
   */
  ENDSPACE_VIEWPORT_SCALE: false,

  // ============================================
  // 首页 / 列表页 文章网格 (Post Grid)
  // ============================================
  ENDSPACE_POST_GRID_COLUMNS: 3, // 宽屏(≥1100px)列数；720–1099px 固定 2 列，<720px 单列
  ENDSPACE_LIST_MAX_WIDTH: '64rem', // 列表页正文最大宽度（文章阅读页仍保持 4xl 阅读宽度）
  ENDSPACE_CARD_THUMB_RATIO: '16 / 9', // 卡片封面比例，只决定封面的高度上限
  /**
   * 封面适配策略：
   *  auto    —— 图片加载后按真实比例判断，比例贴合封面框才用 cover，否则 contain（默认：技术图不会被裁）
   *  cover   —— 强制铺满裁切（适合纯摄影站）
   *  contain —— 强制完整显示，留白用底板色填充（适合示意图/公式截图为主的站点）
   */
  ENDSPACE_CARD_THUMB_FIT: 'auto',
  ENDSPACE_CARD_TITLE_LINES: 2, // 标题最多显示行数
  ENDSPACE_CARD_SUMMARY_LINES: 2, // 摘要最多显示行数
  ENDSPACE_CARD_TAGS: 3, // 每张卡片最多显示几个标签
  ENDSPACE_HOME_COMPACT_HEADER: true, // 列表页用紧凑身份头替代原装饰横幅
  ENDSPACE_HOME_FILTER_BAR: true, // 列表页顶部显示分类筛选 + 搜索
  ENDSPACE_HOME_HERO_STATS: true, // 紧凑头部显示文章数/分类数统计

  /**
   * 封面覆盖表：post.id（或 post.slug）-> 图片直链。
   *
   * 用途：Notion 里的封面若指向已失效的图源，卡片和文章横幅都会中招。
   * 有了这张表，不改 Notion 也能修；键用 Notion 的 page id，所以以后即使
   * 改了 POST_URL_PREFIX / 分类映射导致 slug 变化，这里依然命中。
   *
   * 线上 12 篇里实测有 3 篇封面失效，都已在这里替换：
   *   液压I       307aece6-ce4c-80d3-82c2-fbd95693ae55
   *     原图是 Bing 缩略图缓存 -> 搜狐 CDN 的 gif，已失效（504）
   *   运动生物力学  1d7aece6-ce4c-80c3-b596-c67427678e0a
   *     原图是期刊站 pubs-data.cstam.org.cn，拒绝抓取（504）
   *   origin绘图   10aaece6-ce4c-8088-9a26-c9f6d061eeb7
   *     原图是 upload.wikimedia.org/wikipedia/commons/thumb/...（400）
   *     —— Wikimedia 现在只在 thumb.wikimedia.org 提供缩略图，旧主机上
   *        所有 thumb 路径一律 400；原图直链仍可用。这就是该封面挂掉的根因。
   *
   * 替换图源全部来自 Wikimedia Commons，授权都是 CC0（无署名义务），
   * 且比例都接近 16:9，能整块填满卡片、几乎不裁切：
   *   Hydraulic jackhammers - robot.jpg   2419x1360  1.78 ≈ 16:9  零裁切
   *   Relay runner (Unsplash).jpg         3481x2321  1.50        裁 16%
   *   Goodhart scatterplot.png            1964x1000  1.96        裁 9%
   * 用的是 960px 缩略图（不是动辄几 MB 的原图），单张 128-226KB。
   *
   * 想换回 Notion 的封面：删掉对应键即可；若 Notion 封面仍然失效，
   * 卡片会自动落到主题自绘的工业底板（见 style.js 的 .eds-card__thumb--blank）。
   */
  ENDSPACE_COVER_OVERRIDES: {
    '307aece6-ce4c-80d3-82c2-fbd95693ae55':
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4f/Hydraulic_jackhammers_-_robot.jpg/960px-Hydraulic_jackhammers_-_robot.jpg',
    '1d7aece6-ce4c-80c3-b596-c67427678e0a':
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/Relay_runner_%28Unsplash%29.jpg/960px-Relay_runner_%28Unsplash%29.jpg',
    '10aaece6-ce4c-8088-9a26-c9f6d061eeb7':
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Goodhart_scatterplot.png/960px-Goodhart_scatterplot.png'
  },

  // ============================================
  // 浮动控件 (Floating controls)
  // ============================================
  /** 右下角胶囊是否显示浅色/深色切换（夜间模式已禁用） */
  ENDSPACE_WIDGET_DARK_MODE: false
}
export default CONFIG
