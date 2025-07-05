export const Spacer = ({ x = 1, y = 1 }: { x?: number; y?: number }) => {
  return <div className={`space-x-${x} space-y-${y}`} />;
};
