import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";

const GET_ASSISTANT_URL = "https://functions.poehali.dev/672abe49-1db6-4de1-90a9-ccc2a937b265";
const ANALYZE_ITEM_URL = "https://functions.poehali.dev/b162d0a1-aace-4c9b-8e41-a2cd0e5faf1d";

interface AnalysisResult {
  verdict: "да" | "нет" | "зависит";
  emoji: string;
  summary: string;
  reasons: string[];
  tip?: string;
}

export default function AssistantPage() {
  const { id } = useParams<{ id: string }>();
  const [clientName, setClientName] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState("image/jpeg");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`${GET_ASSISTANT_URL}?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setNotFound(true);
        else setClientName(data.client_name);
      })
      .catch(() => setNotFound(true));
  }, [id]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    setError("");
    setImageMime(file.type || "image/jpeg");

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      const base64 = dataUrl.split(",")[1];
      setImageData(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setResult(null);
    setError("");
    setImageMime(file.type || "image/jpeg");

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      const base64 = dataUrl.split(",")[1];
      setImageData(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!imageData || !id) return;
    setLoading(true);
    setError("");
    setResult(null);

    const res = await fetch(ANALYZE_ITEM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assistant_id: id,
        image_data: imageData,
        image_mime: imageMime,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Ошибка при анализе. Попробуйте ещё раз.");
      return;
    }
    setResult(data);
  };

  const verdictColors = {
    да: "bg-green-50 border-green-200",
    нет: "bg-red-50 border-red-200",
    зависит: "bg-amber-50 border-amber-200",
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-6xl mb-6">🔍</p>
          <h1 className="text-3xl font-bold text-neutral-900 mb-3">Ассистент не найден</h1>
          <p className="text-neutral-500">Проверьте ссылку или обратитесь к вашему стилисту.</p>
        </div>
      </div>
    );
  }

  if (!clientName) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Icon name="Loader2" size={32} className="animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-neutral-900 px-6 py-5 flex items-center justify-between">
        <span className="text-white text-sm uppercase tracking-widest">Style by AI</span>
        <span className="text-neutral-400 text-sm">для {clientName}</span>
      </div>

      <div className="max-w-lg mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Подходит ли эта вещь?
          </h1>
          <p className="text-neutral-500">
            Сфотографируйте или загрузите изображение вещи — я скажу, подходит ли она вашему стилю
          </p>
        </div>

        <label
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="cursor-pointer block border-2 border-dashed border-neutral-300 hover:border-neutral-900 transition-colors duration-200 rounded-none overflow-hidden mb-6 group"
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Загруженная вещь"
              className="w-full max-h-80 object-contain bg-white"
            />
          ) : (
            <div className="py-16 flex flex-col items-center gap-4 text-center px-6">
              <Icon
                name="Camera"
                size={40}
                className="text-neutral-300 group-hover:text-neutral-700 transition-colors duration-200"
              />
              <div>
                <p className="text-neutral-500 font-medium">Загрузите фото вещи</p>
                <p className="text-neutral-400 text-sm mt-1">
                  Одежда, обувь, аксессуар, сумка
                </p>
              </div>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImage}
            className="hidden"
          />
        </label>

        {imagePreview && !result && (
          <button
            onClick={analyze}
            disabled={loading}
            className="w-full bg-neutral-900 text-white py-4 uppercase tracking-widest text-sm hover:bg-neutral-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 mb-6"
          >
            {loading ? (
              <>
                <Icon name="Loader2" size={18} className="animate-spin" />
                Анализирую...
              </>
            ) : (
              <>
                <Icon name="Sparkles" size={18} />
                Проверить вещь
              </>
            )}
          </button>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {result && (
          <div className={`border-2 p-6 mb-6 ${verdictColors[result.verdict] || "bg-neutral-50 border-neutral-200"}`}>
            <div className="text-center mb-5">
              <span className="text-5xl">{result.emoji}</span>
              <h2 className="text-2xl font-bold text-neutral-900 mt-3">{result.summary}</h2>
            </div>
            <ul className="flex flex-col gap-2 mb-5">
              {result.reasons.map((r, i) => (
                <li key={i} className="flex gap-2 text-neutral-700 text-sm">
                  <span className="text-neutral-400 mt-0.5">—</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
            {result.tip && (
              <div className="bg-white border border-neutral-200 px-4 py-3 text-sm text-neutral-700">
                <span className="font-semibold text-neutral-900">Совет: </span>
                {result.tip}
              </div>
            )}
            <button
              onClick={() => {
                setResult(null);
                setImagePreview(null);
                setImageData(null);
              }}
              className="mt-5 w-full border border-neutral-400 text-neutral-700 py-3 text-sm uppercase tracking-wide hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all duration-300"
            >
              Проверить другую вещь
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
