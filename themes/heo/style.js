// themes/heo/style.js

/* eslint-disable react/no-unknown-property */
/**
 * 此处样式只对当前主题生效
 * 此处不支持tailwindCSS的 @apply 语法
 * @returns
 */
const Style = () => {
  return (
    <style jsx global>{`
      /* === 1. 全局基础样式 === */
      body {
        background-color: #f7f9fe;
        /* 优化字体渲染，让代码和中文更清晰 */
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* 选中文字颜色：使用科技感强的靛青色 */
      ::selection {
        background: #6366f1;
        color: white;
      }

      /* 公告栏中的字体固定白色 */
      #theme-heo #announcement-content .notion {
        color: white;
      }

      /* 所有元素使用边框盒模型 */
      * {
        box-sizing: border-box;
      }

      /* === 2. 滚动条美化 (更细、更现代) === */
      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.15);
        border-radius: 10px;
        cursor: pointer;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(99, 102, 241, 0.6); /* 悬停变为品牌色 */
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      
      /* 隐藏特定区域的滚动条但允许滚动 */
      .recent-top-post-group::-webkit-scrollbar,
      .scroll-hidden::-webkit-scrollbar {
        display: none;
      }

      /* === 3. 卡片与容器现代化改造 (核心美化) === */
      
      /* 统一大圆角，增加视觉柔和度 */
      #theme-heo .heo-card,
      #theme-heo .card,
      #side-bar,
      .notion-block,
      .recent-post-item {
        border-radius: 24px !important;
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); /* 类似 iOS 的平滑曲线 */
      }

      /* 浅色模式下的“毛玻璃”特效 */
      :not(.dark) #theme-heo .heo-card,
      :not(.dark) #theme-heo .card,
      :not(.dark) #side-bar {
        background: rgba(255, 255, 255, 0.75) !important;
        backdrop-filter: blur(20px) saturate(180%); /* 核心：模糊+饱和度增强 */
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.6); /* 半透明白边框，增加玻璃质感 */
      }

      /* === 4. 交互动画 (悬浮效果) === */
      
      /* 鼠标悬停时的“上浮” + “光晕”效果 */
      #theme-heo .heo-card:hover,
      .recent-post-item:hover {
        transform: translateY(-6px); /* 上移 */
        box-shadow: 0 12px 24px -8px rgba(99, 102, 241, 0.15) !important; /* 带有品牌色的投影 */
        border-color: rgba(99, 102, 241, 0.3) !important; /* 边框变色 */
        z-index: 10;
      }

      /* === 5. 特殊组件微调 === */

      #more {
        white-space: nowrap;
      }

      /* 今日卡片遮罩优化 */
      .today-card-cover {
        -webkit-mask-image: linear-gradient(to top, transparent 0%, black 60%);
        mask-image: linear-gradient(to top, transparent 0%, black 60%);
      }

      /* 标签滚动动画 (保持原有逻辑) */
      .tags-group-wrapper {
        animation: rowup 60s linear infinite;
      }

      @keyframes rowup {
        0% {
          transform: translateX(0%);
        }
        100% {
          transform: translateX(-50%);
        }
      }
      
      /* 深色模式下的微调 (防止过亮) */
      .dark ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
      }
      
    `}</style>
  )
}

export { Style }
