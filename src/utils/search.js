/**
 * 规范化用户端搜索关键词：去首尾空白、压缩分隔符
 * 后端会再做模糊 LIKE（多字段 + 多词 % 连接）
 */
export function normalizeSearchKeyword(raw) {
  if (raw == null) return ''
  return String(raw)
    .trim()
    .replace(/[\s,，、;；|/]+/g, ' ')
    .trim()
}
