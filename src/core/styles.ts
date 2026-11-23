// Shadow-root styles. Pick a finish with the `finish` attribute; theme further with the --mt-* custom properties
// (set on the element or any parent, they win over the finish defaults).
export const styles = /* css */ `
:host{
  --mt-button-bg:#17171A;
  --mt-button-text:#F5F5F3;
  --mt-plate-bg:#FFFFFF;
  --mt-plate-text:#141416;
  --mt-rim:#DADDE4;
  --mt-shadow:30 45 80;
  --mt-focus:#141416;
  --mt-font:inherit;
  --mt-button-radius:14px;
  position:relative;display:inline-block;vertical-align:middle;z-index:50;
  font-family:var(--mt-font);-webkit-font-smoothing:antialiased;
}
:host([hidden]){display:none}

/* ---------- button ---------- */
.btn{all:unset;box-sizing:border-box;position:relative;height:40px;display:flex;align-items:center;cursor:pointer;
  padding:0 38px 0 18px;border-radius:var(--mt-button-radius);corner-shape:squircle;
  color:var(--mt-button-text);font-size:14px;font-weight:500;line-height:1;white-space:nowrap;
  z-index:2;-webkit-tap-highlight-color:transparent;
  /* raised: a soft top highlight, a lighter inner ring and a fine dark outer ring */
  background:linear-gradient(180deg, color-mix(in srgb, var(--mt-button-bg) 84%, #fff) 0%, var(--mt-button-bg) 55%, color-mix(in srgb, var(--mt-button-bg) 88%, #000) 100%);
  box-shadow:inset 0 1px 0 rgb(255 255 255 / .22), inset 0 0 0 1px rgb(255 255 255 / .07),
    0 0 0 1px color-mix(in srgb, var(--mt-button-bg) 80%, #000),
    0 1px 1px rgb(var(--mt-shadow) / .12), 0 8px 18px -8px rgb(var(--mt-shadow) / .5)}
:host([side="right"]) .btn{padding:0 18px 0 38px}
@supports (corner-shape:squircle){.btn{border-radius:calc(var(--mt-button-radius) * 1.6)}}
.btn:focus-visible{outline:2px solid var(--mt-focus);outline-offset:3px}

/* the rivet is the pivot every plate turns on */
.rivet{position:absolute;right:16px;top:50%;width:9px;height:9px;margin-top:-4.5px;border-radius:50%;
  background:radial-gradient(circle at 35% 30%, #FFFFFF 0 18%, #E4E6EA 45%, #A9ADB4 100%);
  box-shadow:0 0 0 .5px rgb(0 0 0 / .35), 0 1px 1px rgb(0 0 0 / .4)}
:host([side="right"]) .rivet{right:auto;left:16px}

/* ---------- plates ---------- */
.layer{position:absolute;inset:0;pointer-events:none;z-index:1}
.plate{position:absolute;display:block;box-sizing:border-box;outline:none;text-decoration:none;color:inherit;
  pointer-events:none;visibility:hidden;-webkit-tap-highlight-color:transparent}
:host([open]) .plate{pointer-events:auto}
.face{position:absolute;inset:0;display:flex;align-items:center;box-sizing:border-box;border-radius:999px;
  padding:0 20px;color:var(--mt-plate-text);
  font-size:15px;font-weight:500;letter-spacing:-.005em;white-space:nowrap;
  /* pearl: a rim that darkens toward the bottom edge, cool layered shadows that grow as the plate is pulled out */
  border:1px solid transparent;
  background:linear-gradient(180deg, var(--mt-plate-bg) 0%, color-mix(in srgb, var(--mt-plate-bg) 97%, #8090B0) 100%) padding-box,
    linear-gradient(180deg, color-mix(in srgb, var(--mt-plate-bg) 60%, #fff) 0%, var(--mt-rim) 100%) border-box;
  box-shadow:0 1px 1.5px rgb(var(--mt-shadow) / .07),
    0 calc(10px + var(--lift, 0) * 6px) calc(26px + var(--lift, 0) * 12px) -12px rgb(var(--mt-shadow) / calc(.26 + var(--lift, 0) * .1))}
:host([side="right"]) .face{justify-content:flex-end}
.plate:focus-visible .face{outline:2px solid var(--mt-focus);outline-offset:2px}

/* ---------- finish: ink, dark plates out of a dark button ---------- */
:host([finish="ink"]){--mt-plate-bg:#1C1C20;--mt-plate-text:#F4F4F2;--mt-shadow:10 12 20}
:host([finish="ink"]) .face{border:0;
  background:linear-gradient(180deg, color-mix(in srgb, var(--mt-plate-bg) 88%, #fff) 0%, var(--mt-plate-bg) 100%);
  box-shadow:inset 0 1px 0 rgb(255 255 255 / .14), inset 0 0 0 1px rgb(255 255 255 / .06),
    0 0 0 1px color-mix(in srgb, var(--mt-plate-bg) 70%, #000),
    0 calc(10px + var(--lift, 0) * 6px) calc(24px + var(--lift, 0) * 12px) -12px rgb(var(--mt-shadow) / calc(.5 + var(--lift, 0) * .1))}

/* ---------- finish: glass, frosted pieces with hairline edges ---------- */
:host([finish="glass"]){--mt-button-bg:rgb(255 255 255 / .66);--mt-button-text:#141416;--mt-plate-bg:rgb(255 255 255 / .6);--mt-shadow:16 24 40}
:host([finish="glass"]) .btn{background:var(--mt-button-bg);
  -webkit-backdrop-filter:blur(14px) saturate(1.4);backdrop-filter:blur(14px) saturate(1.4);
  box-shadow:inset 0 1px 0 rgb(255 255 255 / .9), inset 0 0 0 1px rgb(var(--mt-shadow) / .1), 0 1px 2px rgb(var(--mt-shadow) / .06)}
:host([finish="glass"]) .rivet{background:radial-gradient(circle at 35% 30%, #9A9FA8 0 14%, #44474F 58%, #1D1E22 100%)}
:host([finish="glass"]) .face{border:0;background:var(--mt-plate-bg);
  -webkit-backdrop-filter:blur(12px) saturate(1.4);backdrop-filter:blur(12px) saturate(1.4);
  box-shadow:inset 0 1px 0 rgb(255 255 255 / .85), inset 0 0 0 1px rgb(var(--mt-shadow) / .085),
    0 calc(6px + var(--lift, 0) * 6px) calc(18px + var(--lift, 0) * 10px) -10px rgb(var(--mt-shadow) / calc(.14 + var(--lift, 0) * .08))}
`
