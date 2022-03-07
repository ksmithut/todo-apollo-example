/**
 * @template TValue
 * @param {TValue[]} list
 * @param {keyof TValue} key
 */
export function keyBy (list, key) {
  return list.reduce(
    /**
     * @param {Record<string, TValue>} byId
     * @param {TValue} item
     */
    (byId, item) => {
      byId[String(item[key])] = item
      return byId
    },
    {}
  )
}
