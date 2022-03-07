/**
 * @template TValue
 * @param {TValue[]} list
 * @param {keyof TValue} key
 */
export function groupBy (list, key) {
  return list.reduce(
    /**
     * @param {Record<string, TValue[]>} byId
     * @param {TValue} item
     */
    (byId, item) => {
      const itemKey = String(item[key])
      byId[itemKey] = byId[itemKey] ?? []
      byId[itemKey].push(item)
      return byId
    },
    {}
  )
}
