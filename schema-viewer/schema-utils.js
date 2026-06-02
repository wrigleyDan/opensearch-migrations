// ── Tree builder ──────────────────────────────────────────────────────────────

export function buildNode(name, schema, pathArr, requiredSet = new Set()) {
  if (!schema || typeof schema !== 'object') return null
  return {
    name,
    pathArr,
    key: pathArr.join('/'),
    schema,
    required: requiredSet.has(name),
    children: buildChildren(schema, pathArr),
  }
}

export function buildChildren(schema, parentPath) {
  const children = []
  const required = new Set(schema.required || [])

  if (schema.properties) {
    for (const [k, v] of Object.entries(schema.properties)) {
      const node = buildNode(k, v, [...parentPath, k], required)
      if (node) children.push(node)
    }
  }

  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    const node = buildNode('[value]', schema.additionalProperties, [...parentPath, '[value]'])
    if (node) children.push(node)
  }

  const unionKey = schema.oneOf ? 'oneOf' : schema.anyOf ? 'anyOf' : null
  if (unionKey) {
    schema[unionKey].forEach((branch, i) => {
      const label = branch.title || `${unionKey}[${i}]`
      const node = buildNode(label, branch, [...parentPath, label])
      if (node) children.push(node)
    })
  }

  if (schema.type === 'array' && schema.items) {
    const node = buildNode('items', schema.items, [...parentPath, 'items'])
    if (node) children.push(node)
  }

  return children
}

export function nodeMatchesSearch(node, term) {
  if (node.name.toLowerCase().includes(term)) return true
  return node.children.some(c => nodeMatchesSearch(c, term))
}

// ── Type helpers ──────────────────────────────────────────────────────────────

export function getTypeLabel(schema) {
  if (schema.oneOf || schema.anyOf) return 'union'
  if (schema.allOf) return 'allOf'
  if (Array.isArray(schema.type)) return schema.type.join(' | ')
  return schema.type || 'any'
}

export function typeBadgeClass(t) {
  const map = {
    string: 'type-string', object: 'type-object', boolean: 'type-boolean',
    array: 'type-array', integer: 'type-integer', number: 'type-number', union: 'type-union',
  }
  return `badge type-badge ${map[t] || ''}`
}

export function variantTitle(branch, i, unionKey) {
  if (branch.title) return branch.title
  const enumVal = branch.properties?.type?.enum?.[0]
  if (enumVal) return enumVal
  return `${unionKey}[${i}]`
}

export function variantDesc(branch) {
  const props = Object.keys(branch.properties || {}).filter(k => k !== 'type')
  return props.length ? `Requires ${props.join(', ')}.` : 'No additional properties required.'
}

// ── Expert field helpers ──────────────────────────────────────────────────────

export function isExpert(desc) {
  return typeof desc === 'string' && desc.startsWith('[Expert]')
}

export function stripExpert(desc) {
  return desc ? desc.replace(/^\[Expert\]\s*/, '') : desc
}
