import { Calendar, User as UserIcon, X } from 'lucide-react';
import { useState } from 'react';
import { getNewsLocalized, TRANSLATIONS } from '../i18n';
import type { Language, NewsItem } from '../types';
import { SportIcon } from './SportIcon';

interface NewsModalProps {
  lang: Language;
  item: NewsItem | null;
  onClose: () => void;
}

export function NewsModal({ lang, item, onClose }: NewsModalProps) {
  const t = TRANSLATIONS[lang];
  const [imgFailed, setImgFailed] = useState(false);

  if (!item) return null;
  const loc = getNewsLocalized(item, lang);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] overflow-hidden max-h-[90vh] flex flex-col">
        <div className="relative h-56 sm:h-64 bg-slate-900 shrink-0">
          {!imgFailed ? (
            <img
              src={item.image_url}
              alt={loc.title}
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-950 text-blue-300">
              <SportIcon sport={item.sport} className="w-12 h-12" />
            </div>
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 text-white hover:bg-black/80 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-4 left-5 right-5 text-xs text-slate-200 flex items-center gap-3">
            <span>{t.sports[item.sport]}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 font-mono tabular-nums">
              <Calendar className="w-3.5 h-3.5" />
              {item.published_at}
            </span>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-950 dark:text-white leading-snug">
            {loc.title}
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <UserIcon className="w-3.5 h-3.5" />
            <span>{item.author_name}</span>
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
            {loc.summary}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {loc.content}
          </p>
        </div>
      </div>
    </div>
  );
}
