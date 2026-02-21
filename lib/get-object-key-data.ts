// eg: obj ={name:Ade, address:{primary:"Jumai street"}} ||| key = ["name"] or ["address","primary"]
export function getObjectKeyData(object: Record<string, any>, keyPath: string[], level: number = 0) {
  if (!object) {
    return undefined;
  }
  if (level == keyPath.length - 1) {
    return object[keyPath[level]];
  }

  return getObjectKeyData(object[keyPath[level]], keyPath, level + 1);
}
