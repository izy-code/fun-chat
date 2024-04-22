function isObject(item: unknown): boolean {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
}

export default function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  if (!isObject(source)) {
    return target;
  }

  const result = target;

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key as keyof T];
    let targetValue = target[key as keyof T];

    if (isObject(sourceValue) && isObject(targetValue)) {
      targetValue = deepMerge(targetValue as object, sourceValue as object) as T[keyof T];
    } else {
      targetValue = sourceValue as T[keyof T];
    }

    result[key as keyof T] = targetValue;
  });

  return result;
}
