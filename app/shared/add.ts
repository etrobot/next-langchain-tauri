export function add(a: number, b: number) {
  return {
    data: a + b,
  };
}

export type AddedData = ReturnType<typeof add>;
