/** @param {string} path @param {string} base */
export function withBase(path, base = '/') {
  const prefix = base.replace(/\/+$/, '');
  if (!prefix || !path.startsWith('/') || path.startsWith('//') || path === prefix || path.startsWith(`${prefix}/`)) return path;
  return `${prefix}${path}`;
}

/** @param {{ base: string }} options */
export function rehypeBaseLinks({ base }) {
  /** @param {import('hast').Root} tree */
  return function transform(tree) {
    /** @param {import('hast').Root | import('hast').RootContent} node */
    function visit(node) {
      if (node.type === 'element') {
        for (const key of ['href', 'src']) {
          const value = node.properties[key];
          if (typeof value === 'string') node.properties[key] = withBase(value, base);
        }
      }
      if ('children' in node) node.children.forEach(visit);
    }
    visit(tree);
  };
}
