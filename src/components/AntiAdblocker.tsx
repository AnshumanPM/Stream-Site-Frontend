import { useEffect, useRef, useState } from "react";

export default function AntiAdblocker() {
  const adRef = useRef<HTMLDivElement>(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (adRef.current && adRef.current.clientHeight === 0) {
        setBlocked(true);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div ref={adRef} aria-hidden="true" className="overflow-hidden h-auto">
        <iframe
          data-aa="2304846"
          src="//ad.a-ads.com/2304846?size=300x250"
          className="border-0"
          style={{
            width: 3,
            height: 2,
            padding: 0,
            overflow: "hidden",
            backgroundColor: "transparent",
          }}
          title="ad"
        />
      </div>

      {blocked && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="adblock-title"
          aria-describedby="adblock-desc"
          className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <div className="bg-white rounded-2xl p-10 max-w-sm w-[90%] text-center shadow-2xl border border-black/10">
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              width={48}
              height={48}
              aria-hidden="true"
              className="mx-auto mb-5"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="#f3f3f3"
                stroke="#111"
                strokeWidth="2"
              />
              <line
                x1="12"
                y1="8"
                x2="12"
                y2="13"
                stroke="#111"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="16.5" r="1" fill="#111" />
            </svg>

            <h2
              id="adblock-title"
              className="text-xl font-bold text-black mb-3 tracking-tight"
            >
              AdBlock Detected!
            </h2>

            <p
              id="adblock-desc"
              className="text-sm text-neutral-500 leading-relaxed mb-7"
            >
              Our website is made possible by displaying ads to our visitors.
              Please support us by whitelisting our website in your ad blocker.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-6 bg-black text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 active:bg-neutral-900 transition-colors duration-150"
            >
              I've Whitelisted — Reload
            </button>
          </div>
        </div>
      )}
    </>
  );
}
