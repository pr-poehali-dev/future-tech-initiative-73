import { useState } from "react";
import Icon from "@/components/ui/icon";

const CREATE_ASSISTANT_URL = "https://functions.poehali.dev/a5952a75-64a1-4585-ba25-f367df16b35d";

export default function StyleForm() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientLink, setClientLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    clientName: "",
    notes: "",
    file: null as File | null,
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setForm((prev) => ({ ...prev, file }));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFileName(file.name);
      setForm((prev) => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let file_data: string | null = null;
    let file_name: string | null = null;

    if (form.file) {
      const buffer = await form.file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      file_data = btoa(binary);
      file_name = form.file.name;
    }

    const res = await fetch(CREATE_ASSISTANT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_name: form.clientName,
        notes: form.notes,
        file_data,
        file_name,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Произошла ошибка. Попробуйте ещё раз.");
      return;
    }

    const link = `${window.location.origin}/assistant/${data.id}`;
    setClientLink(link);
    setSubmitted(true);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(clientLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="contact" className="bg-white px-6 py-24 lg:py-32">
      <div className="max-w-2xl mx-auto">
        <p className="uppercase text-xs tracking-widest text-neutral-400 mb-4">
          Для стилистов
        </p>
        <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight mb-4">
          Создать ассистента
          <br />
          для клиента
        </h2>
        <p className="text-neutral-500 mb-12 text-lg">
          Загрузите лук-бук и укажите психологические нюансы — ассистент будет
          готов за минуту. Вы получите персональную ссылку для клиента.
        </p>

        {submitted ? (
          <div className="border border-neutral-200 p-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-neutral-900 flex items-center justify-center">
                <Icon name="Check" size={28} className="text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">
              Ассистент создан!
            </h3>
            <p className="text-neutral-500 mb-6">
              Отправьте эту ссылку клиенту{" "}
              <span className="font-semibold text-neutral-900">
                {form.clientName}
              </span>
              :
            </p>
            <div className="flex gap-2 mb-8">
              <input
                readOnly
                value={clientLink}
                className="flex-1 border border-neutral-200 px-4 py-3 text-sm text-neutral-700 focus:outline-none"
              />
              <button
                onClick={copyLink}
                className="bg-neutral-900 text-white px-4 py-3 hover:bg-neutral-700 transition-all duration-300 flex items-center gap-2 text-sm uppercase tracking-wide whitespace-nowrap"
              >
                <Icon name={copied ? "CheckCheck" : "Copy"} size={16} />
                {copied ? "Скопировано" : "Скопировать"}
              </button>
            </div>
            <button
              onClick={() => {
                setSubmitted(false);
                setForm({ clientName: "", notes: "", file: null });
                setFileName(null);
                setClientLink("");
              }}
              className="uppercase tracking-widest text-sm border border-black px-6 py-3 hover:bg-black hover:text-white transition-all duration-300"
            >
              Создать ещё одного
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="uppercase text-xs tracking-widest text-neutral-400">
                Имя клиента
              </label>
              <input
                required
                type="text"
                placeholder="Например, Анна Петрова"
                value={form.clientName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, clientName: e.target.value }))
                }
                className="border border-neutral-200 px-4 py-3 text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors duration-200 text-base"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="uppercase text-xs tracking-widest text-neutral-400">
                Лук-бук клиента (PDF или изображение)
              </label>
              <label
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="cursor-pointer border border-dashed border-neutral-300 hover:border-neutral-900 transition-colors duration-200 px-4 py-8 flex flex-col items-center gap-3 text-center group"
              >
                <Icon
                  name="Upload"
                  size={28}
                  className="text-neutral-300 group-hover:text-neutral-900 transition-colors duration-200"
                />
                {fileName ? (
                  <span className="text-neutral-900 text-sm font-medium">
                    {fileName}
                  </span>
                ) : (
                  <span className="text-neutral-400 text-sm">
                    Перетащите файл сюда или нажмите для выбора
                    <br />
                    <span className="text-xs text-neutral-300">
                      PDF, JPG, PNG — до 20 МБ
                    </span>
                  </span>
                )}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFile}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <label className="uppercase text-xs tracking-widest text-neutral-400">
                Психологические нюансы и дополнительные рекомендации
              </label>
              <textarea
                rows={5}
                placeholder="Например: клиент склонен к излишней скромности в выборе одежды, нужно мягко поощрять более смелые решения. Избегать советов по ярким принтам — вызывают тревогу..."
                value={form.notes}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                className="border border-neutral-200 px-4 py-3 text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors duration-200 text-base resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-neutral-900 text-white px-8 py-4 uppercase tracking-widest text-sm hover:bg-neutral-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 w-full"
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={18} className="animate-spin" />
                  Создаём ассистента...
                </>
              ) : (
                <>
                  <Icon name="Sparkles" size={18} />
                  Создать ассистента
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
