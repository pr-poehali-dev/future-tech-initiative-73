export default function Featured() {
  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center min-h-screen px-6 py-12 lg:py-0 bg-white">
      <div className="flex-1 h-[400px] lg:h-[800px] mb-8 lg:mb-0 lg:order-2">
        <img
          src="https://cdn.poehali.dev/projects/465f29a2-8679-45d7-b6b1-bac1045f3a05/files/0bb88493-2485-46e8-91ed-946758465310.jpg"
          alt="Fashion editorial lookbook"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 text-left lg:h-[800px] flex flex-col justify-center lg:mr-12 lg:order-1">
        <h3 className="uppercase mb-4 text-sm tracking-wide text-neutral-600">Как это работает</h3>
        <p className="text-2xl lg:text-4xl mb-8 text-neutral-900 leading-tight">
          Стилист загружает твой персональный лук-бук в ассистента. Ты фотографируешь вещь в магазине —
          и за секунды получаешь честный ответ: подходит ли она тебе.
        </p>
        <button className="bg-black text-white border border-black px-4 py-2 text-sm transition-all duration-300 hover:bg-white hover:text-black cursor-pointer w-fit uppercase tracking-wide">
          Получить ассистента
        </button>
      </div>
    </div>
  );
}