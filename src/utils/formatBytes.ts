export default function formatBytes(bytes: number, decimals: number = 2) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    (bytes / Math.pow(k, i)).toLocaleString("en-US", {
      maximumFractionDigits: dm,
      minimumFractionDigits: 0,
    }) +
    " " +
    sizes[i]
  );
}
