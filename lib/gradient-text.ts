// 渐变文字兼容性工具函数
export const getGradientTextStyle = (gradient: 'default' | 'purple-blue' = 'default') => {
  const gradients = {
    default: 'linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899)', // blue-500, purple-500, pink-500
    'purple-blue': 'linear-gradient(to right, #a855f7, #3b82f6)' // purple-500, blue-500
  };

  const fallbackColors = {
    default: '#3b82f6', // blue-500
    'purple-blue': '#8b5cf6' // purple-500
  };

  return {
    background: gradients[gradient],
    WebkitBackgroundClip: 'text',
    MozBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    MozTextFillColor: 'transparent',
    color: 'transparent',
    // 降级方案
    fallback: {
      color: fallbackColors[gradient],
      background: 'none'
    }
  };
};

// React Hook 用于检测浏览器支持
export const useGradientTextSupport = () => {
  if (typeof window === 'undefined') return true;
  
  // 检测是否支持 background-clip: text
  const testElement = document.createElement('div');
  testElement.style.background = 'linear-gradient(to right, red, blue)';
  testElement.style.webkitBackgroundClip = 'text';
  testElement.style.backgroundClip = 'text';
  
  return testElement.style.backgroundClip === 'text' || testElement.style.webkitBackgroundClip === 'text';
};
