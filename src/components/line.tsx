type LineProps = {
  width?: string;     // Tailwind width class or custom like 'w-full'
  height?: string;    // Tailwind height class or custom like 'h-px'
  color?: string;     // Tailwind bg color class
  margin?: string;    // Tailwind margin classes like 'mt-4 mb-2'
};

export default function Line({
  width = "w-px",
  height = "h-px",
  color = "bg-gray-300",
  margin = "",
}: LineProps) {
  return (
    <div
      className={`${width} ${height} ${color} ${margin}`}
    ></div>
  );
}
