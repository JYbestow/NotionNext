import CONFIG from './config'
import { themeConsoleStyle } from '@/lib/themeConsoleStyle'

/**
 * Endspace Theme - Global Styles (JSX)
 * Light Industrial / Endfield-inspired aesthetic
 */

export const Style = () => {
  return (
    <style jsx global>{`
      /* ============================================
         CSS Custom Properties - Light Industrial Theme
         ============================================ */
      :root {
        /* Ethereal Whites & Grays */
        --endspace-bg-base-light: #fafafa;
        --endspace-bg-base-dark: #09090b;
        --endspace-bg-primary-light: #ffffff;
        --endspace-bg-primary-dark: #18181b;
        --endspace-bg-base: #fafafa;
        --endspace-bg-primary: #ffffff;
        --endspace-bg-secondary: #f4f4f5;
        --endspace-bg-tertiary: #e4e4e7;

        /* Dark Text (High Contrast)
           NOTE: 灰阶与 jybestow.github.io 的设计系统对齐（--ink / --gray-text / --gray-2）：
           同一个人主页用 #0a0a0a 墨色 + #5a5a5a 正文灰 + #8a8a8a 次级灰，
           原先的 #18181b / #52525b / #a1a1aa 是偏蓝的 zinc 色，与个人主页不一致。 */
        --endspace-text-primary-light: #0a0a0a;
        --endspace-text-primary-dark: #f4f4f5;
        --endspace-text-secondary-light: #5a5a5a;
        --endspace-text-secondary-dark: #d4d4d8;
        --endspace-text-primary: #0a0a0a;
        --endspace-text-secondary: #5a5a5a;
        --endspace-text-muted: #8a8a8a;

        /* Accents —— 单一信号黄，与个人主页 --signal 完全同值，无明度变体 */
        --endspace-accent-yellow-light: #FFFA00;
        --endspace-accent-yellow-dark: #FFFA00;
        --endspace-accent-yellow: #FFFA00;
        --endspace-accent-yellow-dim-light: rgba(255, 250, 0, 0.15);
        --endspace-accent-yellow-dim-dark: rgba(255, 250, 0, 0.18);
        --endspace-accent-yellow-dim: rgba(255, 250, 0, 0.15);
        --endspace-accent-cyan: #FFFA00; /* OVERRIDE: Cyan usage -> Signal Yellow */
        --endspace-accent-cyan-dim: rgba(255, 250, 0, 0.1); /* OVERRIDE: Cyan dim -> Yellow dim */

        /* Borders & Lines —— 对齐个人主页 --line: #d9d9d9 */
        --endspace-border-base-light: #d9d9d9;
        --endspace-border-base-dark: #3f3f46;
        --endspace-border-base: #d9d9d9;
        --endspace-border-active: #FFFA00; /* Active border -> Yellow */
        --endspace-grid-color: rgba(0,0,0,0.03);

        /* ============================================
           UNIFIED DESIGN TOKENS (与 jybestow.github.io 同一套体系)
           等宽微标签 + 单一缓动曲线 + 三档时长 + 工业斜切
           ============================================ */
        --eds-font-mono: 'PlexMono', ui-monospace, 'SF Mono', 'Cascadia Mono',
          Consolas, 'Liberation Mono', 'Courier New', monospace;
        --eds-ease: cubic-bezier(0.22, 0.61, 0.36, 1);
        --eds-d-fast: 180ms;
        --eds-d-mid: 380ms;
        --eds-d-slow: 760ms;
        --eds-skew: -14deg;
        --eds-line: #d9d9d9;
        --eds-plate: #f4f4f5; /* 技术图 contain 时的填充底板 */

        /* Shadows - Enhanced 3D Depth */
        --endspace-shadow-base:
          0 1px 2px rgba(0, 0, 0, 0.04),
          0 2px 4px rgba(0, 0, 0, 0.04),
          0 4px 8px rgba(0, 0, 0, 0.04);
        --endspace-shadow-hover:
          0 4px 8px rgba(0, 0, 0, 0.08),
          0 8px 16px rgba(0, 0, 0, 0.06),
          0 16px 32px rgba(0, 0, 0, 0.04),
          0 0 0 1px var(--endspace-accent-yellow);
      }

      /* ============================================
         Root Font Size —— 固定 16px，不再随视口等比放大
         ============================================
         原先这里是 clamp(14px, calc(16px * (100vw / 1440)), 24px)：
         1920 宽屏会算出 21.3px、2560 宽屏直接顶到上限 24px（+50%）。
         Tailwind 的尺寸全是 rem，于是 max-w-4xl(56rem) 会从 896px 变成 1344px，
         aspect-video 的封面高度随之从 504px 涨到 756px —— 首页一屏只放得下一篇。
         博客是阅读型站点，根字号应当稳定、并尊重浏览器/用户自己的字号设置，
         所以这里固定基准；等比缩放改为用 ENDSPACE_VIEWPORT_SCALE 显式开启。 */
      html {
        font-size: 16px;
      }

      /* ============================================
         Global Base Styles
         ============================================ */
      .dark #theme-endspace {
        --endspace-bg-base: var(--endspace-bg-base-dark);
        --endspace-bg-primary: var(--endspace-bg-primary-dark);
        --endspace-bg-secondary: #27272a;
        --endspace-bg-tertiary: #3f3f46;
        --endspace-text-primary: var(--endspace-text-primary-dark);
        --endspace-text-secondary: var(--endspace-text-secondary-dark);
        --endspace-text-muted: #a1a1aa;
        --endspace-border-base: var(--endspace-border-base-dark);
        --endspace-accent-yellow: var(--endspace-accent-yellow-dark);
        --endspace-accent-yellow-dim: var(--endspace-accent-yellow-dim-dark);
        --endspace-grid-color: rgba(255, 255, 255, 0.04);
      }

      #theme-endspace {
        --endspace-bg-base: var(--endspace-bg-base-light);
        --endspace-bg-primary: var(--endspace-bg-primary-light);
        --endspace-text-primary: var(--endspace-text-primary-light);
        --endspace-text-secondary: var(--endspace-text-secondary-light);
        --endspace-border-base: var(--endspace-border-base-light);
        --endspace-accent-yellow: var(--endspace-accent-yellow-light);
        --endspace-accent-yellow-dim: var(--endspace-accent-yellow-dim-light);
        --endspace-accent-cyan: var(--endspace-accent-yellow);
        --endspace-accent-cyan-dim: var(--endspace-accent-yellow-dim);
        --endspace-border-active: var(--endspace-accent-yellow);
        background-color: var(--endspace-bg-base);
        color: var(--endspace-text-primary);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        overflow-x: hidden;
        /* Custom Tech Cursor - Sharp Spearhead with Heavy Shadow */
        cursor: url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M2 2 L12 28 L16 18 L26 14 L2 2 Z' fill='%2318181b' stroke='%23ffffff' stroke-width='1.5' style='filter: drop-shadow(4px 4px 0px rgba(0,0,0,0.3));'/%3E%3C/svg%3E") 2 2, auto;
      }

      #theme-endspace a, #theme-endspace button, #theme-endspace [role="button"], #theme-endspace .cursor-pointer {
        /* Pointer Cursor - Target Reticle Style */
        cursor: url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M2 2 L12 28 L16 18 L26 14 L2 2 Z' fill='%2362F0F5' stroke='%23000000' stroke-width='1.5' style='filter: drop-shadow(4px 4px 0px rgba(0,0,0,0.3));'/%3E%3Ccircle cx='24' cy='24' r='4' fill='none' stroke='%2362F0F5' stroke-width='2'/%3E%3C/svg%3E") 2 2, pointer;
      }

      /* Technical Grid Background */
      #theme-endspace::before {
        content: '';
        position: fixed;
        inset: 0;
        background-image:
          linear-gradient(var(--endspace-grid-color) 1px, transparent 1px),
          linear-gradient(90deg, var(--endspace-grid-color) 1px, transparent 1px);
        background-size: 40px 40px;
        z-index: -1;
        pointer-events: none;
      }

      /* ============================================
         Typography & Technical Text
         ============================================ */
      .tech-text {
        font-family: 'JetBrains Mono', 'Courier New', monospace;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        font-weight: 500;
      }

      .tech-num {
        font-family: 'Oswald', sans-serif;
        letter-spacing: 1px;
      }

      .endspace-search-highlight {
        color: #a16207;
        background: linear-gradient(90deg, rgba(255, 250, 0, 0.2), rgba(251, 191, 36, 0.35));
        padding: 0 0.25rem;
        box-decoration-break: clone;
        -webkit-box-decoration-break: clone;
      }

      .archive-section {
        position: relative;
      }

      .endspace-section-title {
        color: #E8E8EA !important;
        width: 100%;
        gap: 1rem;
        margin-bottom: 1.5rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--endspace-border-base) !important;
        justify-content: flex-start;
      }

      #theme-endspace .endspace-section-title,
      #theme-endspace .endspace-section-title * {
        color: #E8E8EA !important;
      }

      .endspace-section-meta {
        color: var(--endspace-text-secondary);
        font-size: 0.9rem;
        font-weight: 500;
        letter-spacing: 0.04em;
        padding-top: 1.35rem;
        white-space: nowrap;
      }

      .endspace-archive-heading {
        position: relative;
        display: flex;
        align-items: flex-end;
        gap: 0.75rem;
        width: 100%;
        margin-bottom: 1.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--endspace-border-base) !important;
      }

      .endspace-archive-heading-title {
        color: #E8E8EA !important;
        position: relative;
        z-index: 10;
      }

      @media (max-width: 767px) {
        .endspace-section-title {
          align-items: flex-start;
          flex-direction: column;
          gap: 0.25rem;
        }

        .endspace-section-meta {
          padding-top: 0;
        }

        .endspace-archive-heading {
          align-items: flex-start;
          flex-direction: column;
          gap: 0.25rem;
        }
      }

      /* ============================================
         "Float" Container Styles (Glassmorphism -> Solid Block)
         ============================================ */
      .endspace-frame {
        background: var(--endspace-bg-primary); /* Solid background for floating block effect */
        border: 1px solid var(--endspace-border-base);
        position: relative;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow:
           0 10px 30px -10px rgba(0,0,0,0.1),
           0 4px 6px -2px rgba(0,0,0,0.05); /* Enhanced shadow for lift */
        z-index: 10;
      }

      /* Corner Markers (Minimalist L-shape) */
      .endspace-frame::before {
        content: '';
        position: absolute;
        top: -1px; left: -1px;
        width: 0; height: 0;
        border-top: 3px solid var(--endspace-text-primary);
        border-left: 3px solid var(--endspace-text-primary);
        transition: all 0.3s ease;
        opacity: 0;
        z-index: 20;
      }
      .endspace-frame::after {
        content: '';
        position: absolute;
        bottom: -1px; right: -1px;
        width: 0; height: 0;
        border-bottom: 3px solid var(--endspace-text-primary);
        border-right: 3px solid var(--endspace-text-primary);
        transition: all 0.3s ease;
        opacity: 0;
        z-index: 20;
      }

      /* Active State: Heavy Corners appear */
      .endspace-frame:hover {
        border-color: var(--endspace-border-active);
        box-shadow: var(--endspace-shadow-hover);
        transform: translateY(-2px);
      }
      .endspace-frame:hover::before, .endspace-frame:hover::after {
        opacity: 1;
        width: 16px; height: 16px;
      }

      /* ============================================
         Card Styles - Enhanced 3D Depth
         ============================================ */
      .endspace-card {
        background: var(--endspace-bg-primary); /* Solid background */
        border: 1px solid var(--endspace-border-base);
        position: relative;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: var(--endspace-shadow-base);
      }

      .endspace-card:hover {
        border-color: var(--endspace-border-active);
        box-shadow:
          0 20px 25px -5px rgba(0, 0, 0, 0.1),
          0 10px 10px -5px rgba(0, 0, 0, 0.04),
          0 0 0 1px var(--endspace-accent-yellow); /* Glow border */
        transform: translateY(-4px) scale(1.01);
        z-index: 20;
      }

      /* ============================================
         Notion Content Overrides (Light Mode)
         ============================================ */
      #notion-article {
        color: var(--endspace-text-primary);
        font-size: 1.05rem;
        line-height: 1.75;
      }

      #theme-endspace #article-wrapper,
      #theme-endspace #notion-article,
      #theme-endspace #notion-article .notion,
      #theme-endspace #notion-article .notion-text,
      #theme-endspace #notion-article .notion-blank,
      #theme-endspace #notion-article .notion-h,
      #theme-endspace #notion-article .notion-header,
      #theme-endspace #notion-article .notion-sub_header,
      #theme-endspace #notion-article .notion-sub_sub_header,
      #theme-endspace #notion-article .notion-page,
      #theme-endspace #notion-article .notion-list,
      #theme-endspace #notion-article .notion-list-disc,
      #theme-endspace #notion-article .notion-list-numbered,
      #theme-endspace #notion-article .notion-toggle,
      #theme-endspace #notion-article .notion-quote,
      #theme-endspace #notion-article .notion-callout,
      #theme-endspace #notion-article .notion-bookmark,
      #theme-endspace #notion-article .notion-bookmark-title,
      #theme-endspace #notion-article .notion-collection,
      #theme-endspace #notion-article .notion-collection-row,
      #theme-endspace #notion-article .notion-property,
      #theme-endspace #notion-article .notion-property-text,
      #theme-endspace #notion-article .notion-property-title,
      #theme-endspace #notion-article .notion-simple-table,
      #theme-endspace #notion-article .notion-table,
      #theme-endspace #notion-article .notion-code,
      #theme-endspace #notion-article .notion-equation {
        color: var(--endspace-text-primary) !important;
      }

      #theme-endspace #notion-article p,
      #theme-endspace #notion-article li,
      #theme-endspace #notion-article span,
      #theme-endspace #notion-article figcaption,
      #theme-endspace #notion-article .notion-text,
      #theme-endspace #notion-article .notion-list,
      #theme-endspace #notion-article .notion-list-disc,
      #theme-endspace #notion-article .notion-list-numbered,
      #theme-endspace #notion-article .notion-toggle,
      #theme-endspace #notion-article .notion-bookmark-description,
      #theme-endspace #notion-article .notion-bookmark-link,
      #theme-endspace #notion-article .notion-collection-row-body,
      #theme-endspace #notion-article .notion-simple-table-cell {
        color: var(--endspace-text-secondary) !important;
      }

      #theme-endspace #notion-article h1,
      #theme-endspace #notion-article h2,
      #theme-endspace #notion-article h3,
      #theme-endspace #notion-article h4,
      #theme-endspace #notion-article h5,
      #theme-endspace #notion-article h6,
      #theme-endspace #notion-article strong,
      #theme-endspace #notion-article .notion-bookmark-title {
        color: var(--endspace-text-primary) !important;
      }

      /* 正文标题排版
         这里原先是一段 "NieR: Automata Style Dynamic Shadow"：用两层偏移的彩色 text-shadow
         （左上青 -4px -2px + 右下红 4px 2px）把每个标题画成三层重影，再把 opacity 压到 0.85，
         鼠标 hover 时才合并成一层。正文标题的第一目标是可读，这种偏移副本会让笔画发虚
         （中文方块字尤其明显），已整段移除。
         工业风格改由「信号黄竖条 + 左侧缩进 + 字重字距」承担，样式范围不变，仍是正文标题。 */
      #notion-article h1, #notion-article h2, #notion-article h3 {
        color: var(--endspace-text-primary);
        font-weight: 800;
        margin-top: 2.5em;
        margin-bottom: 1em;
        position: relative;
        padding-left: 1rem;
        letter-spacing: 0.02em; /* Slightly wider spacing for the 'digital' look */
        /* 单层字形：无偏移副本、无半透明，标题保持全对比度 */
        text-shadow: none;
        opacity: 1;
      }

      #notion-article h1::before,
      #notion-article h2::before,
      #notion-article h3::before {
        content: '';
        position: absolute;
        left: 0; top: 0.2em; bottom: 0.2em;
        width: 6px;
        background: var(--endspace-accent-yellow);
        box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
      }

      /* Bar also reacts to hover */
      #notion-article h1:hover::before,
      #notion-article h2:hover::before,
      #notion-article h3:hover::before {
        background: var(--endspace-text-primary);
        width: 8px;
        box-shadow: none;
      }

      /* Quotes */
      #notion-article blockquote {
        background: var(--endspace-bg-secondary);
        border-left: 3px solid var(--endspace-text-primary);
        color: var(--endspace-text-secondary);
        padding: 1.2rem 1.5rem;
        margin: 2rem 0;
        font-style: italic;
      }

      /* Lists */
      #notion-article ul li, #notion-article ol li {
        margin-bottom: 0.5em;
        color: var(--endspace-text-secondary);
      }
      #notion-article ul li::marker {
        color: var(--endspace-accent-cyan);
        font-weight: bold;
      }

      /* Links in Content */
      #notion-article a {
        color: var(--endspace-text-primary);
        text-decoration: none;
        border-bottom: 2px solid var(--endspace-accent-cyan-dim);
        transition: all 0.2s;
        font-weight: 600;
      }
      #notion-article a:hover {
        background: var(--endspace-accent-cyan-dim);
        border-bottom-color: var(--endspace-accent-cyan);
      }

      /* Code Blocks */
      #notion-article pre {
        background: #18181b !important;
        border: 1px solid rgba(0,0,0,0.1);
        border-radius: 4px !important;
        box-shadow: var(--endspace-shadow-base);
      }

      /* ============================================
         Buttons (Cut Corner Aesthetic)
         ============================================ */
      .endspace-btn {
        background: transparent;
        border: 2px solid var(--endspace-border-active);
        color: var(--endspace-text-primary);
        padding: 0.6rem 1.5rem;
        font-family: 'JetBrains Mono', monospace;
        font-weight: 700;
        text-transform: uppercase;
        font-size: 0.85em;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: all 0.2s;
      }

      .endspace-btn:hover {
        background: var(--endspace-border-active);
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }

      .endspace-button-primary {
        background: var(--endspace-border-active);
        border: none;
        color: white;
        padding: 0.75rem 1.5rem;
        font-family: 'JetBrains Mono', monospace;
        font-weight: 700;
        text-transform: uppercase;
        font-size: 0.85em;
        cursor: pointer;
        transition: all 0.2s;
      }

      .endspace-button-primary:hover {
        background: #2563eb;
        transform: translateY(-1px);
      }

      /* ============================================
         Tech Decorations Utilities (Minimalist)
         ============================================ */
      .scan-line {
        width: 100%;
        height: 1px;
        background: var(--endspace-border-base);
        margin: 1rem 0;
      }

      /* Spectrum bar decoration */
      .spectrum-bar {
        height: 2px;
        background: linear-gradient(90deg,
          var(--endspace-accent-cyan) 0%,
          var(--endspace-accent-yellow) 50%,
          var(--endspace-accent-cyan) 100%
        );
      }

      /* Loading Animation (Spinner) */
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .loading-radar {
        width: 24px; height: 24px;
        border: 2px solid var(--endspace-border-base);
        border-top-color: var(--endspace-text-primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      /* Tech corner decoration */
      .tech-corner {
        position: relative;
      }
      .tech-corner::before {
        content: '';
        position: absolute;
        top: 0; left: 0;
        width: 8px; height: 8px;
        border-top: 2px solid var(--endspace-accent-cyan);
        border-left: 2px solid var(--endspace-accent-cyan);
      }
      .tech-corner::after {
        content: '';
        position: absolute;
        bottom: 0; right: 0;
        width: 8px; height: 8px;
        border-bottom: 2px solid var(--endspace-accent-cyan);
        border-right: 2px solid var(--endspace-accent-cyan);
      }

      /* ============================================
         Mobile Responsive Styles
         ============================================ */

      /* Safe area support for notched devices */
      .safe-area-bottom {
        padding-bottom: env(safe-area-inset-bottom);
      }
      .safe-area-top {
        padding-top: env(safe-area-inset-top);
      }

      /* Mobile-specific adjustments */
      @media (max-width: 767px) {
        /* Smaller grid on mobile */
        #theme-endspace::before {
          background-size: 30px 30px;
        }

        /* Reduce padding on mobile */
        .endspace-frame {
          padding: 1rem !important;
        }

        /* Smaller technical text */
        .tech-text {
          font-size: 0.75rem;
          letter-spacing: 0.3px;
        }

        /* Ensure minimum touch targets */
        button, a, [role="button"] {
          min-height: 44px;
        }

        /* 例外：搜索框是固定 30px 高的紧凑控件（.eds-search 自带 1px 边框 + 28px 内容高）。
           通用的 44px 触控高度会把里面的 GO 按钮撑高 16px，令「输入框 / GO」之间的
           竖线（button 的 border-left）溢出到框外，看起来就是那条线位置偏移。
           这里让按钮退回容器内容高度，与输入框等高、竖线不再出头。 */
        .eds-search button {
          min-height: 0;
        }

        /* Notion content adjustments */
        #notion-article {
          font-size: 1.1rem;
          line-height: 1.75;
        }

        #notion-article p {
          margin-bottom: 1.25em;
        }
      }

      /* 窄屏时底部为悬浮控件（FloatingControls 胶囊）预留安全区：
         文章结尾与最后一屏内容不再被浮层压住，同时计入 iOS 安全区。
         悬浮控件在滚动中途仍会浮于内容之上，这一点记录为待改进项。 */
      @media (max-width: 1023px) {
        #notion-article {
          padding-bottom: calc(7rem + env(safe-area-inset-bottom, 0px));
        }
      }

      /* ============================================
         图片替代文本 / 失效图片兜底
         NotionPage 挂载后：无 caption 的图改为空 alt；
         外链失效时给 img 与容器打 eds-img-failed*，这里渲染中性占位块，
         不再显示浏览器破图图标，也不改变原有尺寸与布局。
         ============================================ */
      #notion-article img.eds-img-failed {
        visibility: hidden;
      }

      #notion-article .eds-img-failed-holder {
        position: relative;
      }

      #notion-article .eds-img-failed-holder::after {
        content: '图片不可用';
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        letter-spacing: 0.04em;
        color: var(--endspace-text-muted);
        background: repeating-linear-gradient(
          45deg,
          transparent 0 6px,
          rgba(0, 0, 0, 0.03) 6px 12px
        );
        border: 1px dashed var(--endspace-border-base);
        border-radius: 6px;
        pointer-events: none;
      }

      /* 被 Notion block_width 压小、但原图仍有分辨率余量的图片：
         给一个更大的响应式宽度。只作用于「原图宽 ≥ 渲染宽 1.8 倍」的图，
         因此不会把所有图片强行放大到同一尺寸；比例与顺序均不变。 */
      #notion-article .eds-upscale {
        width: min(100%, 32rem) !important;
        max-width: 100% !important;
      }

      @media (min-width: 1536px) {
        #notion-article .eds-upscale {
          width: min(100%, 40rem) !important;
        }
      }

      /* ============================================
         代码块 / 表格 横向溢出提示
         NotionPage 给真正横向溢出的 pre / table 打 data-eds-xscroll，
         滚到末尾时打 data-eds-xscroll-end —— 提示随之出现与消失。
         ============================================ */
      #notion-article pre[data-eds-xscroll='1'],
      #notion-article table[data-eds-xscroll='1'] {
        scrollbar-width: thin;
      }

      /* 右缘内阴影：表示右侧还有内容。提示只用阴影，不做任何覆盖代码文字的浮层
         （曾试过在工具栏里放文字提示，实测会压住代码行，已撤掉）。 */
      #notion-article pre[data-eds-xscroll='1']:not([data-eds-xscroll-end='1']),
      #notion-article table[data-eds-xscroll='1']:not([data-eds-xscroll-end='1']) {
        box-shadow: inset -26px 0 22px -20px rgba(0, 0, 0, 0.7);
      }

      /* 深色代码块上暗色内阴影不可辨，补一层浅色渐隐；浅色表格不受影响 */
      #notion-article pre[data-eds-xscroll='1']:not([data-eds-xscroll-end='1']) {
        background-image: linear-gradient(
          to left,
          rgba(255, 255, 255, 0.16),
          rgba(255, 255, 255, 0) 20%
        );
        background-repeat: no-repeat;
      }

      /* 滚动条本身也做可见化，作为第二重（不遮挡内容的）提示 */
      #notion-article pre[data-eds-xscroll='1']::-webkit-scrollbar,
      #notion-article table[data-eds-xscroll='1']::-webkit-scrollbar {
        height: 8px;
      }

      #notion-article pre[data-eds-xscroll='1']::-webkit-scrollbar-thumb,
      #notion-article table[data-eds-xscroll='1']::-webkit-scrollbar-thumb {
        background: var(--endspace-text-muted);
        border-radius: 999px;
      }

      /* ============================================
         Player Styles
         ============================================ */
      .endspace-player-glow {
        box-shadow: 0 0 10px var(--endspace-accent-yellow);
      }

      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .endspace-player-rotating {
        animation: rotate 8s linear infinite;
      }

      /* ============================================
         Scan Line & HUD Animations
         ============================================ */

      /* Horizontal Scan Line */
      @keyframes ef-scan-horizontal {
        0% { transform: translateY(-100%); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(100vh); opacity: 0; }
      }

      .ef-scan-line {
        position: absolute;
        left: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg,
          transparent,
          var(--endspace-accent-cyan) 20%,
          var(--endspace-accent-cyan) 80%,
          transparent
        );
        animation: ef-scan-horizontal 4s linear infinite;
        pointer-events: none;
        opacity: 0.5;
      }

      /* Vertical Scan Line */
      @keyframes ef-scan-vertical {
        0% { transform: translateX(-100%); opacity: 0; }
        10% { opacity: 0.8; }
        90% { opacity: 0.8; }
        100% { transform: translateX(100vw); opacity: 0; }
      }

      .ef-scan-line-v {
        position: absolute;
        top: 0;
        width: 1px;
        height: 100%;
        background: linear-gradient(180deg,
          transparent,
          var(--endspace-accent-cyan) 30%,
          var(--endspace-accent-cyan) 70%,
          transparent
        );
        animation: ef-scan-vertical 6s linear infinite;
        pointer-events: none;
        opacity: 0.3;
      }

      /* Pulse Glow Animation */
      @keyframes ef-pulse-glow {
        0%, 100% {
          box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
        }
        50% {
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.3);
        }
      }

      .ef-pulse-glow {
        animation: ef-pulse-glow 3s ease-in-out infinite;
      }

      /* ============================================
         Endfield Button Styles
         ============================================ */

      /* Button with Left Highlight Bar */
      .ef-button {
        position: relative;
        background: var(--endspace-bg-primary);
        border: 1px solid var(--endspace-border-base);
        padding: 0.75rem 1.5rem 0.75rem 2rem;
        font-family: 'JetBrains Mono', monospace;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.85em;
        cursor: pointer;
        overflow: hidden;
        transition: all 0.2s ease;
      }

      .ef-button::before {
        content: '';
        position: absolute;
        left: 0.5rem;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 55%;
        background-color: var(--endspace-accent-yellow);
        transition: all 0.2s ease;
      }

      .ef-button:hover {
        background: var(--endspace-border-active);
        color: white;
        border-color: var(--endspace-border-active);
      }

      .ef-button:hover::before {
        height: 70%;
        background-color: #FFFA00;
      }

      /* ============================================
         Card Enhancement Styles
         ============================================ */

      /* Enhanced Card with texture */
      .ef-card {
        position: relative;
        background: var(--endspace-bg-primary);
        border: 1px solid var(--endspace-border-base);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .ef-card:hover {
        border-color: var(--endspace-accent-yellow);
        box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
        transform: translateY(-2px);
      }

      /* Index Number Badge - Industrial Style */
      .ef-index-badge {
        position: absolute;
        top: -1px;
        left: -1px;
        padding: 0.25rem 0.5rem;
        background: var(--endspace-accent-yellow);
        color: #000;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.5px;
      }

      /* ============================================
         HUD Corner Decorations
         ============================================ */

      .ef-hud-corners {
        position: relative;
      }

      /* Top Left HUD */
      .ef-hud-tl::before {
        content: '';
        position: fixed;
        top: 1rem;
        left: 1rem;
        width: 3rem;
        height: 3rem;
        border-top: 2px solid rgba(6, 182, 212, 0.4);
        border-left: 2px solid rgba(6, 182, 212, 0.4);
        pointer-events: none;
        z-index: 50;
      }

      /* Bottom Right HUD */
      .ef-hud-br::after {
        content: '';
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        width: 3rem;
        height: 3rem;
        border-bottom: 2px solid rgba(6, 182, 212, 0.4);
        border-right: 2px solid rgba(6, 182, 212, 0.4);
        pointer-events: none;
        z-index: 50;
      }

      /* ============================================
         Glowing Border Animation
         ============================================ */

      @keyframes ef-border-glow {
        0%, 100% {
          border-color: var(--endspace-border-base);
          box-shadow: none;
        }
        50% {
          border-color: var(--endspace-accent-cyan);
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
        }
      }

      .ef-glow-border:hover {
        animation: ef-border-glow 2s ease-in-out infinite;
      }

      /* ============================================
         NieR: Automata Style Title (Reusable)
         ============================================ */
      .nier-title {
        position: relative;
        font-weight: 800;
        letter-spacing: 0.05em;
        text-shadow:
          2px 2px 0 rgba(98, 240, 245, 0.35),
          4px 4px 0 rgba(98, 240, 245, 0.18),
          6px 6px 10px rgba(0, 0, 0, 0.15);
      }

      /* ============================================
         3D Button Effects
         ============================================ */
      .endspace-btn-3d {
        position: relative;
        background: var(--endspace-bg-primary);
        border: 2px solid var(--endspace-accent-yellow);
        color: var(--endspace-text-primary);
        padding: 0.75rem 1.5rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow:
          0 4px 0 rgba(98, 240, 245, 0.6),
          0 6px 12px rgba(0, 0, 0, 0.15);
      }

      .endspace-btn-3d:hover {
        transform: translateY(-2px);
        box-shadow:
          0 6px 0 rgba(98, 240, 245, 0.7),
          0 10px 20px rgba(0, 0, 0, 0.2);
      }

      .endspace-btn-3d:active {
        transform: translateY(2px);
        box-shadow:
          0 2px 0 rgba(98, 240, 245, 0.5),
          0 3px 6px rgba(0, 0, 0, 0.1);
      }

      /* ============================================
         Sidebar & Navigation 3D Depth
         ============================================ */
      .endspace-sidebar-3d {
        box-shadow:
          4px 0 8px rgba(0, 0, 0, 0.05),
          8px 0 16px rgba(0, 0, 0, 0.03);
      }

      /* ============================================
         NieR: Automata Style Navigation Transition
         ============================================ */
      /* ============================================
         NieR: Automata Style Navigation Transition
         ============================================ */
      .nier-nav-item {
        position: relative;
        overflow: hidden;
        transition: color 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        z-index: 1;
        /* Default Text Color */
        color: var(--endspace-text-muted);
        border-radius: 1px; /* Rounded corners as seen in screenshot */
        margin-bottom: 2px; /* Slight spacing between items */
      }

      /* Sliding Background Layer */
      .nier-nav-item::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 0%;
        height: 100%;
        background: #E0E0E0; /* Hover: Darker Grey */
        transition: width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        z-index: -1;
      }

      /* Active / Hover State Text Color */
      .nier-nav-item:hover, .nier-nav-item.active {
        color: var(--endspace-text-primary) !important;
      }

      .endspace-notion-menu-image {
        display: inline-block;
        width: 1.25rem;
        height: 1.25rem;
        object-fit: contain;
        opacity: 0.68;
        filter: grayscale(1) brightness(0.45);
        transition: filter 0.2s ease, opacity 0.2s ease;
      }

      .endspace-notion-menu-image-monochrome {
        filter: grayscale(1) brightness(0.45);
      }

      .endspace-notion-menu-image.is-active,
      .nier-nav-item:hover .endspace-notion-menu-image {
        filter: brightness(0) saturate(100%) !important;
        opacity: 1 !important;
      }

      .endspace-notion-menu-class-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.25rem;
        height: 1.25rem;
        color: #666;
        font-size: 1rem;
        line-height: 1;
        flex: 0 0 auto;
        transition: color 0.2s ease, opacity 0.2s ease;
      }

      .endspace-notion-menu-class-icon.is-active,
      .nier-nav-item:hover .endspace-notion-menu-class-icon {
        color: #000;
        opacity: 1;
      }

      .endspace-notion-menu-svg-icon {
        width: 1.25rem;
        height: 1.25rem;
        color: #666;
        fill: none;
        stroke: currentColor;
        flex: 0 0 auto;
        transition: color 0.2s ease, opacity 0.2s ease;
      }

      .endspace-notion-menu-svg-icon.is-active,
      .nier-nav-item:hover .endspace-notion-menu-svg-icon {
        color: #000;
        opacity: 1;
      }

      .endspace-menu-icon-wrap svg.icon {
        width: 1.25rem;
        height: 1.25rem;
        color: #666;
        fill: currentColor;
      }

      .endspace-notion-menu-dot {
        display: inline-flex;
        width: 0.55rem;
        height: 0.55rem;
        border-radius: 9999px;
        background: #666;
        flex: 0 0 auto;
        transition: background-color 0.2s ease;
      }

      .endspace-notion-menu-dot.is-active,
      .nier-nav-item:hover .endspace-notion-menu-dot {
        background: #000;
      }

      .endspace-notion-menu-emoji {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        font-size: 1.15rem;
        line-height: 1;
        filter: grayscale(1);
        opacity: 0.68;
        transition: filter 0.2s ease, opacity 0.2s ease;
      }

      .endspace-notion-menu-emoji.is-active,
      .nier-nav-item:hover .endspace-notion-menu-emoji {
        filter: none;
        opacity: 1;
      }

      /* Hover State: Slide to full width */
      .nier-nav-item:hover::before {
        width: 100%;
      }

      /* Active State: Always full width with Distinct Color */
      .nier-nav-item.active::before {
        width: 100%;
        background: #EBEBEB; /* Active: Lighter Grey */
      }

      /* Target the icon specifically if needed to ensure color fill */
      .nier-nav-item svg, .nier-nav-item .icon-container {
        transition: color 0.3s ease;
        z-index: 2;
      }

      #theme-endspace .endspace-menu-icon-wrap,
      #theme-endspace .endspace-menu-icon-wrap i,
      #theme-endspace .endspace-menu-icon-wrap svg {
        color: #666;
        fill: currentColor;
        stroke: currentColor;
        transition: color 0.2s ease;
      }

      #theme-endspace .nier-nav-item.active .endspace-menu-icon-wrap,
      #theme-endspace .nier-nav-item:hover .endspace-menu-icon-wrap,
      #theme-endspace .nier-nav-item.active .endspace-menu-icon-wrap i,
      #theme-endspace .nier-nav-item:hover .endspace-menu-icon-wrap i,
      #theme-endspace .nier-nav-item.active .endspace-menu-icon-wrap svg,
      #theme-endspace .nier-nav-item:hover .endspace-menu-icon-wrap svg {
        color: #000 !important;
      }

      /* Removed specific active override to keep consistent grey background */

      /* Also update the base hover/active shared rule to use this darker grey */

      /* ============================================
         Endfield Category Button Styles
         ============================================ */
      /* ============================================
         Endfield Unified Button Styles
         ============================================ */
      /* ============================================
         Endfield Unified Button Styles (High Priority)
         ============================================ */
      .ef-btn {
        display: inline-flex !important;
        align-items: center;
        gap: 0.75rem; /* Space between indicator and text */
        padding: 0.5rem 1rem 0.5rem 0.75rem;
        background-color: #3F3F46 !important; /* Normal: Dark Grey matching screenshot */
        border-radius: 1px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        width: fit-content;
        min-width: min-content;
        border: 1px solid transparent;
        text-decoration: none !important; /* Remove default link underline */
        position: relative;
        z-index: 10;
      }

      .ef-btn:hover {
        background-color: #27272A !important; /* Hover: Darker Grey */
        border-radius: 3px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        transform: translateY(-1px);
      }

      /* Indicator Element */
      .ef-btn-indicator {
        display: block;
        width: 4px;
        height: 18px;
        background-color: #FFFA00; /* Yellow */
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); /* Rectangle */
      }

      .ef-btn:hover .ef-btn-indicator {
        width: 12px;
        height: 12px;
        background-color: #FFFA00;
        clip-path: polygon(0 0, 100% 50%, 0 100%); /* Triangle */
      }

      /* Text Styles */
      .ef-btn-text {
        color: #e4e4e7 !important;
        font-weight: 600;
        font-size: 0.95rem;
        letter-spacing: 0.05em;
        white-space: nowrap;
        transition: color 0.3s ease;
      }

      .ef-btn:hover .ef-btn-text {
        color: #ffffff !important;
      }

      .archive-filter-btn:hover {
        background-color: #FFFA00 !important;
        border-color: #FFFA00;
        box-shadow: var(--endspace-shadow-hover);
      }

      .archive-filter-btn:hover .ef-btn-indicator {
        background-color: #000;
      }

      .archive-filter-btn:hover .ef-btn-text {
        color: #000 !important;
      }

      /* ============================================================
         HOME / LIST —— 紧凑工业档案网格
         与 jybestow.github.io 同一套语言：零圆角、1px 线框、单一信号黄、
         等宽微标签、制图网格底纹、切角、克制动效。
         ============================================================ */

      /* 等宽微标签：工业标签体系的统一入口 */
      .eds-mono {
        font-family: var(--eds-font-mono);
        font-size: 10px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        line-height: 1.4;
      }

      /* ---------- 紧凑站点身份头（替代原先约 400px 的纯装饰横幅） ---------- */
      .eds-hero {
        position: relative;
        overflow: hidden;
        background: var(--endspace-bg-base);
        border-bottom: 1px solid var(--endspace-border-base);
      }
      /* 制图网格底纹：88px 模数 + 向下渐隐 mask */
      .eds-hero__mesh {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background-image:
          repeating-linear-gradient(90deg, rgba(10, 10, 10, 0.055) 0 1px, transparent 1px 88px),
          repeating-linear-gradient(0deg, rgba(10, 10, 10, 0.055) 0 1px, transparent 1px 88px);
        mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.25));
        -webkit-mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.25));
      }
      .dark .eds-hero__mesh {
        background-image:
          repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 88px),
          repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 88px);
      }
      .eds-hero__in {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        gap: 7px;
        margin: 0 auto;
        /* 镜像 container-wrapper 的水平内边距与内容宽度，
           截图对比时才不会出现「头部比网格宽出几像素」的错位。
           --eds-list-max 由 LayoutBase 按 ENDSPACE_LIST_MAX_WIDTH 写到根节点上。 */
        max-width: calc(var(--eds-list-max, 64rem) + 2rem);
        padding: 18px 1rem 15px;
      }
      @media (min-width: 768px) {
        .eds-hero__in {
          max-width: calc(var(--eds-list-max, 64rem) + 4rem);
          padding-left: 2rem;
          padding-right: 2rem;
        }
      }
      @media (min-width: 1024px) {
        .eds-hero__in {
          max-width: calc(var(--eds-list-max, 64rem) + 6rem);
          padding-left: 3rem;
          padding-right: 3rem;
        }
      }
      /* [01] ──── LABEL 三段式 eyebrow */
      .eds-eyebrow {
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--endspace-text-secondary);
      }
      .eds-eyebrow__no {
        display: inline-block;
        background: var(--endspace-accent-yellow);
        color: #0a0a0a;
        padding: 2px 6px 1px;
        transform: skewX(var(--eds-skew));
        font-weight: 500;
      }
      .eds-eyebrow__no > span {
        display: inline-block;
        transform: skewX(calc(-1 * var(--eds-skew)));
      }
      .eds-eyebrow__line {
        flex: 1;
        height: 1px;
        background: var(--endspace-border-base);
      }
      .eds-hero__title {
        font-size: clamp(24px, 2.9vw, 40px);
        font-weight: 900;
        letter-spacing: -0.035em;
        line-height: 1.05;
        color: var(--endspace-text-primary);
        margin: 0;
      }
      .eds-hero__sub {
        font-size: 13px;
        line-height: 1.55;
        color: var(--endspace-text-secondary);
        max-width: 62ch;
        margin: 0;
      }
      .eds-hero__stats {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px 10px;
        color: var(--endspace-text-muted);
        margin-top: 1px;
      }
      .eds-hero__stats b {
        color: var(--endspace-text-primary);
        font-weight: 700;
      }
      .eds-hero__stat-sep {
        color: var(--endspace-border-base);
        margin-right: 10px;
      }

      /* ---------- 分类筛选 + 搜索 ---------- */
      .eds-filter {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
        padding: 11px 0;
        margin-bottom: 16px;
        border-bottom: 1px solid var(--endspace-border-base);
      }
      .eds-filter__cats {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
        min-width: 0;
        flex: 1 1 auto;
      }
      .eds-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: 30px;
        padding: 0 10px;
        border: 1px solid var(--endspace-border-base);
        background: transparent;
        color: var(--endspace-text-secondary);
        font-family: var(--eds-font-mono);
        font-size: 10px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        white-space: nowrap;
        text-decoration: none !important;
        border-radius: 0;
        cursor: pointer;
        transition:
          color var(--eds-d-fast) var(--eds-ease),
          border-color var(--eds-d-fast) var(--eds-ease),
          background-color var(--eds-d-fast) var(--eds-ease);
      }
      .eds-chip__n {
        color: var(--endspace-text-muted);
        font-size: 9px;
      }
      .eds-chip:hover {
        color: #0a0a0a;
        background: var(--endspace-accent-yellow);
        border-color: var(--endspace-accent-yellow);
      }
      .eds-chip:hover .eds-chip__n {
        color: rgba(10, 10, 10, 0.65);
      }
      .eds-chip.is-active {
        background: var(--endspace-text-primary);
        border-color: var(--endspace-text-primary);
        color: var(--endspace-bg-primary);
      }
      .eds-chip.is-active .eds-chip__n {
        color: var(--endspace-accent-yellow);
      }
      /* 紧凑搜索：复用真实的 /search/<term> 路由 */
      .eds-search {
        display: flex;
        align-items: stretch;
        flex: 0 0 auto;
        height: 30px;
        border: 1px solid var(--endspace-border-base);
        background: var(--endspace-bg-primary);
        transition: border-color var(--eds-d-fast) var(--eds-ease);
      }
      .eds-search:focus-within {
        border-color: var(--endspace-text-primary);
      }
      .eds-search input {
        width: 146px;
        min-width: 0;
        border: 0;
        outline: none;
        background: transparent;
        color: var(--endspace-text-primary);
        font-family: var(--eds-font-mono);
        font-size: 11px;
        letter-spacing: 0.06em;
        padding: 0 8px;
      }
      .eds-search input::placeholder {
        color: var(--endspace-text-muted);
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }
      .eds-search button {
        border: 0;
        border-left: 1px solid var(--endspace-border-base);
        background: transparent;
        color: var(--endspace-text-secondary);
        font-family: var(--eds-font-mono);
        font-size: 10px;
        letter-spacing: 0.14em;
        padding: 0 10px;
        cursor: pointer;
        transition:
          background-color var(--eds-d-fast) var(--eds-ease),
          color var(--eds-d-fast) var(--eds-ease);
      }
      .eds-search button:hover {
        background: var(--endspace-accent-yellow);
        color: #0a0a0a;
      }

      /* ---------- 文章网格：1 / 2 / 3 列 ---------- */
      .eds-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 14px;
        align-items: stretch;
      }
      @media (min-width: 720px) {
        .eds-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
      }
      @media (min-width: 1100px) {
        .eds-grid {
          grid-template-columns: repeat(var(--eds-cols, 3), minmax(0, 1fr));
          gap: 18px;
        }
      }
      /* 网格项是 PostGrid 的包装 div（用于承载揭示状态），
         让它与内部的 a / article 逐层撑满行高，同排卡片才会底部对齐 */
      .eds-grid > .eds-item {
        display: flex;
        min-width: 0;
      }
      .eds-grid > .eds-item > * {
        display: flex;
        flex: 1 1 auto;
        min-width: 0;
      }

      /* ---------- 文章卡片 ---------- */
      .eds-card {
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-width: 0;
        background: var(--endspace-bg-primary);
        border: 1px solid var(--endspace-border-base);
        border-radius: 0;
        overflow: hidden;
        text-decoration: none !important;
        transition:
          border-color var(--eds-d-mid) var(--eds-ease),
          transform var(--eds-d-mid) var(--eds-ease);
      }
      /* 顶部信号黄定位条：hover 时由左展开（替代原整块黄色横扫） */
      .eds-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--endspace-accent-yellow);
        transform: scaleX(0);
        transform-origin: left;
        transition: transform var(--eds-d-mid) var(--eds-ease);
        z-index: 4;
      }
      .eds-card:hover {
        border-color: var(--endspace-text-primary);
        transform: translateY(-2px);
      }
      .eds-card:hover::before {
        transform: scaleX(1);
      }

      /* 封面区：固定 16:9，高度只由卡片宽度决定，原图再大也撑不大卡片。
         max-height 是硬上限：1440 宽屏 3 列时卡片约 327px，16:9 会到 184px，
         超出设计约定的 140–180px 区间，所以在这里钳住；object-fit 会自适应新比例。 */
      .eds-card__thumb {
        position: relative;
        flex: none;
        width: 100%;
        aspect-ratio: var(--eds-thumb-ratio, 16 / 9);
        max-height: var(--eds-thumb-max, 180px);
        overflow: hidden;
        background: var(--eds-plate);
        border-bottom: 1px solid var(--endspace-border-base);
      }
      .dark .eds-card__thumb {
        background: #27272a;
      }
      .eds-card__img {
        display: block;
        width: 100%;
        height: 100%;
        transition: transform var(--eds-d-slow) var(--eds-ease);
      }
      /* 只有比例真正贴合的图才做 hover 微缩放；contain 的图缩放会切边，不做 */
      .eds-card__thumb[data-fit='cover']:hover .eds-card__img {
        transform: scale(1.04);
      }
      /* 封面缺失 / 图源失效时的自绘底板：不引入任何外部图片，
         用细网格 + 幽灵编号 + 黄色方块标记，保持与个人主页一致的工业档案语气。
         线上 12 篇里已有 3 张封面图源失效（404/400/504），没有兜底就会留一个空框。 */
      .eds-card__thumb--blank {
        display: block;
      }
      .eds-blank__mesh {
        position: absolute;
        inset: 0;
        background-image: repeating-linear-gradient(
            90deg,
            rgba(10, 10, 10, 0.06) 0 1px,
            transparent 1px 20px
          ),
          repeating-linear-gradient(
            0deg,
            rgba(10, 10, 10, 0.05) 0 1px,
            transparent 1px 20px
          );
        -webkit-mask-image: linear-gradient(
          180deg,
          rgba(0, 0, 0, 0.85),
          rgba(0, 0, 0, 0.3)
        );
        mask-image: linear-gradient(
          180deg,
          rgba(0, 0, 0, 0.85),
          rgba(0, 0, 0, 0.3)
        );
      }
      .dark .eds-blank__mesh {
        background-image: repeating-linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.07) 0 1px,
            transparent 1px 20px
          ),
          repeating-linear-gradient(
            0deg,
            rgba(255, 255, 255, 0.055) 0 1px,
            transparent 1px 20px
          );
      }
      .eds-blank__mk {
        position: absolute;
        left: 12px;
        top: 12px;
        width: 7px;
        height: 7px;
        background: var(--endspace-accent-yellow);
      }
      .eds-blank__cat {
        position: absolute;
        left: 26px;
        top: 9px;
        max-width: calc(100% - 78px);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-size: 10px;
        line-height: 1.7;
        color: var(--endspace-text-secondary);
      }
      .eds-blank__num {
        position: absolute;
        right: 10px;
        bottom: 2px;
        font-size: 40px;
        font-weight: 900;
        line-height: 1;
        letter-spacing: -0.03em;
        color: transparent;
        -webkit-text-stroke: 1px rgba(10, 10, 10, 0.22);
        paint-order: stroke fill;
      }
      .dark .eds-blank__num {
        -webkit-text-stroke: 1px rgba(255, 255, 255, 0.24);
      }
      .eds-card__body {
        display: flex;
        flex-direction: column;
        gap: 7px;
        flex: 1 1 auto;
        min-width: 0;
        padding: 12px 13px 11px;
      }
      .eds-card__meta {
        display: flex;
        align-items: center;
        gap: 7px;
        color: var(--endspace-text-muted);
        min-width: 0;
      }
      .eds-card__meta > .eds-card__cat {
        color: var(--endspace-text-secondary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .eds-card__sep {
        width: 1px;
        height: 9px;
        flex: none;
        background: var(--endspace-border-base);
      }
      .eds-card__title {
        margin: 0;
        font-size: 16px;
        font-weight: 800;
        line-height: 1.35;
        letter-spacing: -0.01em;
        color: var(--endspace-text-primary);
        display: -webkit-box;
        -webkit-line-clamp: var(--eds-title-lines, 2);
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .eds-card__summary {
        margin: 0;
        font-size: 12.5px;
        line-height: 1.62;
        color: var(--endspace-text-secondary);
        display: -webkit-box;
        -webkit-line-clamp: var(--eds-summary-lines, 2);
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .eds-card__foot {
        margin-top: auto;
        padding-top: 9px;
        border-top: 1px solid var(--endspace-border-base);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        min-width: 0;
      }
      .eds-card__tags {
        display: flex;
        align-items: center;
        gap: 5px;
        min-width: 0;
        overflow: hidden;
      }
      .eds-tag {
        flex: none;
        font-family: var(--eds-font-mono);
        font-size: 9px;
        letter-spacing: 0.08em;
        color: var(--endspace-text-secondary);
        border: 1px solid var(--endspace-border-base);
        padding: 1px 5px;
        white-space: nowrap;
      }
      .eds-card__go {
        display: flex;
        align-items: center;
        flex: none;
        color: var(--endspace-text-secondary);
      }
      .eds-card__go-mk {
        width: 16px;
        height: 16px;
        display: grid;
        place-items: center;
        border: 1px solid var(--endspace-border-base);
        transition:
          background-color var(--eds-d-fast) var(--eds-ease),
          border-color var(--eds-d-fast) var(--eds-ease),
          color var(--eds-d-fast) var(--eds-ease);
      }
      .eds-card__go-mk svg {
        transition: transform var(--eds-d-mid) var(--eds-ease);
      }
      .eds-card:hover .eds-card__go {
        color: var(--endspace-text-primary);
      }
      .eds-card:hover .eds-card__go-mk {
        background: var(--endspace-accent-yellow);
        border-color: var(--endspace-accent-yellow);
        color: #0a0a0a;
      }
      .eds-card:hover .eds-card__go-mk svg {
        transform: translateX(2px);
      }

      /* ---------- 档案页眉：DOC 编号 + 文档类型 ----------
         编号来自真实 page id（见 components/docMeta.js），hover 时由左向右被信号黄填充，
         这是「编号闪烁」的实现：只动 background-size，不触发重排，文字始终可读。 */
      .eds-doc__head {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: none;
        padding: 5px 10px 4px;
        font-size: 9.5px;
        letter-spacing: 0.14em;
        color: var(--endspace-text-muted);
        background: var(--endspace-bg-secondary);
        border-bottom: 1px solid var(--endspace-border-base);
      }
      .dark .eds-doc__head {
        background: #202023;
      }
      .eds-doc__code {
        flex: none;
        font-weight: 600;
        color: var(--endspace-text-primary);
        padding: 0 3px;
        margin: 0 -3px;
        background-image: linear-gradient(
          var(--endspace-accent-yellow),
          var(--endspace-accent-yellow)
        );
        background-repeat: no-repeat;
        background-position: left center;
        background-size: 0% 100%;
        transition:
          background-size var(--eds-d-mid) var(--eds-ease),
          color var(--eds-d-mid) var(--eds-ease);
      }
      .eds-card:hover .eds-doc__code {
        background-size: 100% 100%;
        color: #0a0a0a;
      }
      .eds-doc__head-line {
        flex: 1;
        height: 1px;
        background: var(--endspace-border-base);
      }
      .eds-doc__type {
        flex: none;
        border: 1px solid var(--endspace-border-base);
        padding: 0 5px;
        color: var(--endspace-text-secondary);
      }

      /* 封面工业扫描线：一道柔和的黄色光带自上而下扫过。
         只在 hover 时出现；prefers-reduced-motion 下整条关闭。 */
      .eds-card__thumb::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 18%;
        background: linear-gradient(
          180deg,
          transparent 0%,
          var(--endspace-accent-yellow) 50%,
          transparent 100%
        );
        opacity: 0;
        transform: translateY(-120%);
        pointer-events: none;
        z-index: 3;
        transition:
          transform var(--eds-d-slow) var(--eds-ease),
          opacity var(--eds-d-fast) linear;
      }
      .eds-card:hover .eds-card__thumb::after {
        opacity: 0.3;
        transform: translateY(560%);
      }

      /* ---------- 卡片上的档案字段（DATE / CAT） ---------- */
      .eds-doc__fields {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 4px 12px;
        font-size: 9.5px;
        letter-spacing: 0.1em;
        color: var(--endspace-text-muted);
        min-width: 0;
      }
      .eds-doc__f {
        display: inline-flex;
        align-items: baseline;
        gap: 5px;
        min-width: 0;
      }
      .eds-doc__f i {
        flex: none;
        font-style: normal;
        opacity: 0.72;
      }
      .eds-doc__f b {
        font-weight: 500;
        color: var(--endspace-text-secondary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* ACCESS 入口文字（箭头沿用原 .eds-card__go-mk 的 hover 变黄） */
      .eds-card__go-txt {
        flex: none;
        font-family: var(--eds-font-mono);
        font-size: 8.5px;
        font-style: normal;
        letter-spacing: 0.16em;
        margin-right: 6px;
        opacity: 0.7;
        transition:
          opacity var(--eds-d-fast) var(--eds-ease),
          color var(--eds-d-fast) var(--eds-ease);
      }
      .eds-card:hover .eds-card__go-txt {
        opacity: 1;
        color: var(--endspace-text-primary);
      }

      /* ---------- Hero 的档案定位行 ---------- */
      .eds-hero__wordmark {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        margin: 0;
        font-size: 11px;
        letter-spacing: 0.2em;
        color: var(--endspace-text-secondary);
      }
      .eds-hero__wm-sep {
        color: var(--endspace-border-base);
      }
      .eds-hero__role {
        color: var(--endspace-text-muted);
      }

      /* ---------- 索引页头：INDEX DATABASE ---------- */
      .eds-idx {
        margin: 0 0 20px;
        padding-bottom: 14px;
        border-bottom: 2px solid var(--endspace-text-primary);
      }
      .eds-idx__bar {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 9.5px;
        letter-spacing: 0.16em;
        color: var(--endspace-text-muted);
      }
      .eds-idx__k {
        flex: none;
        font-weight: 600;
        color: var(--endspace-text-primary);
      }
      .eds-idx__line {
        flex: 1;
        min-width: 12px;
        height: 1px;
        background: var(--endspace-border-base);
      }
      .eds-idx__kind {
        flex: none;
      }
      .eds-idx__n {
        flex: none;
        display: inline-flex;
        align-items: baseline;
        gap: 5px;
      }
      .eds-idx__n i {
        font-style: normal;
        opacity: 0.75;
      }
      .eds-idx__n b {
        font-size: 12.5px;
        color: var(--endspace-text-primary);
      }
      .eds-idx__val {
        margin: 9px 0 0;
        font-size: clamp(22px, 3.2vw, 32px);
        font-weight: 900;
        line-height: 1.15;
        letter-spacing: -0.02em;
        color: var(--endspace-text-primary);
        word-break: break-word;
      }
      .eds-idx__note {
        margin: 4px 0 0;
        font-size: 9.5px;
        letter-spacing: 0.14em;
        color: var(--endspace-text-muted);
      }

      /* ---------- 索引行：分类 / 标签节点的数据库画法 ---------- */
      .eds-idx-list {
        display: flex;
        flex-direction: column;
        border-top: 1px solid var(--endspace-border-base);
      }
      .eds-idx-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 13px 4px;
        border-bottom: 1px solid var(--endspace-border-base);
        text-decoration: none !important;
        transition:
          background-color var(--eds-d-fast) var(--eds-ease),
          padding-left var(--eds-d-fast) var(--eds-ease);
      }
      .eds-idx-row:hover {
        background: var(--endspace-bg-secondary);
        padding-left: 10px;
      }
      .eds-idx-row__k {
        flex: none;
        font-size: 15px;
        font-weight: 700;
        color: var(--endspace-text-primary);
      }
      .eds-idx-row__line {
        flex: 1;
        min-width: 10px;
        height: 1px;
        background: var(--endspace-border-base);
        opacity: 0.7;
      }
      .eds-idx-row__n {
        flex: none;
        font-size: 10px;
        letter-spacing: 0.12em;
        color: var(--endspace-text-muted);
      }
      .eds-idx-row__go {
        flex: none;
        display: grid;
        place-items: center;
        width: 18px;
        height: 18px;
        border: 1px solid var(--endspace-border-base);
        color: var(--endspace-text-secondary);
        transition:
          background-color var(--eds-d-fast) var(--eds-ease),
          border-color var(--eds-d-fast) var(--eds-ease),
          color var(--eds-d-fast) var(--eds-ease);
      }
      .eds-idx-row:hover .eds-idx-row__go {
        background: var(--endspace-accent-yellow);
        border-color: var(--endspace-accent-yellow);
        color: #0a0a0a;
      }

      /* ---------- 文章页档案数据字段 ----------
         用 1px 间隙 + 底色画分隔线，比给每格加 border 更不容易出现双线。 */
      .eds-meta {
        margin-bottom: 30px;
      }
      .eds-meta__bar {
        display: flex;
        align-items: center;
        gap: 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--endspace-border-base);
        font-size: 10px;
        letter-spacing: 0.16em;
        color: var(--endspace-text-muted);
      }
      .eds-meta__id {
        flex: none;
        font-weight: 600;
        color: var(--endspace-text-primary);
      }
      .eds-meta__line {
        flex: 1;
        min-width: 12px;
        height: 1px;
        background: var(--endspace-border-base);
      }
      .eds-meta__status {
        flex: none;
      }
      .eds-meta__title {
        margin: 16px 0 18px;
        font-size: clamp(26px, 4.6vw, 44px);
        font-weight: 900;
        line-height: 1.14;
        letter-spacing: -0.025em;
        color: var(--endspace-text-primary);
      }
      .eds-meta__fields {
        display: grid;
        /* 列数由 PostMeta 按实际字段数算好（--eds-meta-cols）：
           8 个字段 → 4 列两行，不会把最后一个字段孤零零地挤到第二行。 */
        grid-template-columns: repeat(var(--eds-meta-cols, 4), minmax(0, 1fr));
        max-width: calc(var(--eds-meta-cols, 4) * 230px);
        gap: 0;
        margin: 0;
        border-right: 1px solid var(--endspace-border-base);
        border-bottom: 1px solid var(--endspace-border-base);
      }
      .eds-meta__field {
        min-width: 0;
        padding: 8px 10px 9px;
        background: var(--endspace-bg-primary);
        /* 每格自画上/左边框 + 容器补右/下边 → 最后一行没填满的空位不画任何东西。
           原先靠容器底色透过 1px 间隙画线，空位会被涂成一整块灰色。 */
        border-top: 1px solid var(--endspace-border-base);
        border-left: 1px solid var(--endspace-border-base);
      }
      .eds-meta__field dt {
        font-size: 8.5px;
        letter-spacing: 0.16em;
        color: var(--endspace-text-muted);
      }
      .eds-meta__field dd {
        margin: 3px 0 0;
        font-size: 12.5px;
        color: var(--endspace-text-primary);
        /* 不再截断：日期 / 编号 / 分类宁可变两行，也不要变成省略号。 */
        overflow-wrap: anywhere;
      }
      .eds-meta__tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 14px;
      }

      /* ---------- 入场揭示 ----------
         渐进增强：只有 JS 给网格挂上 data-reveal="on" 才隐藏，
         JS 失效时内容默认可见，绝不会被藏起来。 */
      .eds-grid[data-reveal='on'] > * {
        opacity: 0;
        transform: translateY(14px);
        transition:
          opacity var(--eds-d-slow) var(--eds-ease),
          transform var(--eds-d-slow) var(--eds-ease);
        transition-delay: var(--eds-rv-delay, 0ms);
      }
      .eds-grid[data-reveal='on'] > *.is-in {
        opacity: 1;
        transform: none;
      }

      /* ---------- 文章内嵌 PDF ----------
         Notion 的 pdf 块默认渲染成 <object height="100%">，父容器没有高度时
         会塌到 320px，于是 896px 的阅读栏里只剩一个 544x320 的小框，
         讲义/试卷这类长文档基本没法读。这里铺满正文栏并给足高度，
         顶部补一条始终可见的出口信息条（文件名 + 在新标签打开），
         即使浏览器不支持内嵌预览也有明确出路。 */
      .eds-pdf {
        width: 100%;
        margin: 1.75rem 0;
        border: 1px solid var(--eds-line);
        border-radius: 0;
        background: var(--eds-plate);
      }
      /* react-notion-x 给 pdf 块套了两层壳：外层 figure，里面一层 padding 8/16 的
         匿名 div，且这个 div 带 inline width:543.5px（按 Notion 里存的块宽算的）
         与 inline height:320px、overflow:auto，于是 <object> 既被卡在 512px 宽，
         又被 320px 的壳裁掉一大截——而阅读栏有 798px、查看器本身按 85vh（手机 70vh）
         渲染，桌面实测 764x765、手机 290x591，被 320px 的壳切掉 445px / 265px，
         用户只能看到查看器顶部一条、甚至只有一片灰底。
         内联样式只能用 !important 盖，所以 width/height/overflow 都必须带 !important。
         只作用于 -pdf，不影响图片和其它 asset。 */
      .notion-asset-wrapper-pdf {
        display: block;
      }
      .notion-asset-wrapper-pdf > div {
        width: 100% !important;
        max-width: none !important;
        height: auto !important;
        overflow: visible !important;
      }
      .eds-pdf__bar {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 0.75rem;
        border-bottom: 1px solid var(--eds-line);
      }
      .eds-pdf__tag {
        flex: none;
        padding: 0.15rem 0.4rem;
        color: var(--endspace-text-primary);
        background: var(--endspace-accent-yellow);
      }
      .eds-pdf__name {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-size: 0.8125rem;
        color: var(--endspace-text-secondary);
      }
      .eds-pdf__open {
        flex: none;
        font-size: 0.8125rem;
        color: var(--endspace-text-primary);
        text-decoration: none;
        border-bottom: 1px solid transparent;
        transition: border-color var(--eds-d-fast) var(--eds-ease);
      }
      .eds-pdf__open:hover {
        border-bottom-color: var(--endspace-accent-yellow);
      }
      .eds-pdf__view {
        display: block;
        width: 100%;
        /* 长讲义给足高度，上限 1200px 免得短文档留白过多 */
        height: clamp(520px, 85vh, 1200px);
        border: 0;
        background: #ffffff;
      }
      .eds-pdf__fallback {
        padding: 1.5rem;
        font-size: 0.875rem;
        color: var(--endspace-text-secondary);
      }
      .eds-pdf__fallback a {
        color: var(--endspace-text-primary);
        text-decoration: underline;
      }
      /* 始终可见的出口：即使预览区是空白，用户眼前也有明确可点的入口 */
      .eds-pdf__foot {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 0.4rem 0.75rem;
        padding: 0.5rem 0.75rem;
        border-top: 1px solid var(--eds-line);
      }
      .eds-pdf__hint {
        flex: 1 1 12rem;
        min-width: 0;
        font-size: 0.75rem;
        line-height: 1.5;
        color: var(--endspace-text-secondary);
      }
      @media (max-width: 720px) {
        .eds-pdf {
          margin: 1.25rem 0;
        }
        .eds-pdf__view {
          height: 70vh;
        }
      }

      /* ---------- 动效降级 ---------- */
      @media (prefers-reduced-motion: reduce) {
        .eds-card,
        .eds-card__img,
        .eds-card::before,
        .eds-card__go-mk,
        .eds-card__go-mk svg,
        .eds-doc__code,
        .eds-card__thumb::after,
        .eds-idx-row,
        .eds-idx-row__go,
        .eds-chip,
        .eds-search,
        .eds-search button,
        .eds-grid[data-reveal='on'] > * {
          transition-duration: 1ms !important;
        }
        .eds-card:hover {
          transform: none;
        }
        /* 扫描光带整条不出现，而不是「瞬间扫完」——那反而更晃眼 */
        .eds-card:hover .eds-card__thumb::after {
          opacity: 0;
        }
        /* 编号填充也整条关闭：即时闪一下对动效敏感的人同样不友好 */
        .eds-card:hover .eds-doc__code {
          background-size: 0% 100%;
          color: var(--endspace-text-primary);
        }
        .eds-grid[data-reveal='on'] > * {
          opacity: 1 !important;
          transform: none !important;
        }
      }

      /* ---------- 窄屏：索引条折行，字段格收窄 ---------- */
      @media (max-width: 640px) {
        .eds-idx__bar {
          flex-wrap: wrap;
          gap: 5px 9px;
        }
        .eds-idx__line {
          display: none;
        }
        .eds-idx__val {
          font-size: 23px;
        }
        .eds-meta__fields {
          /* 窄屏按可用宽度自然分列；auto-fit 会折叠空轨道，
             配合「每格自画边框」不会留下灰色空块。 */
          grid-template-columns: repeat(auto-fit, minmax(92px, 1fr));
          max-width: none;
        }
        .eds-hero__wordmark {
          font-size: 10px;
          letter-spacing: 0.14em;
        }
      }

      ${themeConsoleStyle('endspace', CONFIG)}
  `}</style>
  )
}
