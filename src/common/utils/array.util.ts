export function removeDuplicatesString(array: string[]): string[] {
  return array.filter((value, index, self) => {
    return self.indexOf(value) === index;
  });
}
