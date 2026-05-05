export default function ActionCard({
  icon,
  title,
  description,
  buttonText,
  buttonStyle,
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border w-full">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h2 className="font-semibold text-lg">{title}</h2>
      </div>

      <p className="text-gray-500 text-sm mb-4">{description}</p>

      <button className={buttonStyle}>
        {buttonText}
      </button>
    </div>
  );
}