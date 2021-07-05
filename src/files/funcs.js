function multiDimentionFind(
  arr,
  lookUpValue,
  lookUpProp,
  subArrItem,
  returnRoot
) {
  let array = Array.from(arr);
  if (!lookUpValue) {
    return array;
  }
  let compare;
  for (let item of array) {
    compare = lookUpProp ? item[lookUpProp] : item;
    if (compare === lookUpValue) {
      return item;
    }
    let root = item;
    let find;
    if (subArrItem && item[subArrItem]) {
      find = multiDimentionFind(
        item[subArrItem],
        lookUpValue,
        lookUpProp,
        subArrItem,
        false
      );
      if (find) {
        return returnRoot ? [find, root] : find;
      }
    }
  }
  return null;
}

export { multiDimentionFind };
