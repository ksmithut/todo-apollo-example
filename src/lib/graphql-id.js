/**
 * @param {string} __typename
 * @param {string} id
 */
export function encodeNodeId (id, __typename) {
  return Buffer.from(`${__typename}:${id}`).toString('base64url')
}

/**
 * @param {string} encodedId
 * @returns {[string, string]} [id, __typename]
 */
export function decodeNodeId (encodedId) {
  const parts = Buffer.from(encodedId.trim(), 'base64url')
    .toString()
    .split(':', 2)
  return [parts[1], parts[0] ?? '']
}
