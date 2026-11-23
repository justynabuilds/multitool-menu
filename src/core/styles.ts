// Shadow-root styles. Theme from outside with the --mt-* custom properties.
export const styles = /* css */ `
:host{
  --mt-button-bg:#141416;
  --mt-button-text:#F5F5F3;
  --mt-plate-bg:#FFFFFF;
  --mt-plate-text:#141416;
  --mt-shadow:20 20 22;
  --mt-font:inherit;
  --mt-button-radius:14px;
  position:relative;display:inline-block;vertical-align:middle;z-index:50;
  font-family:var(--mt-font);-webkit-font-smoothing:antialiased;
}
:host([hidden]){display:none}

.btn{all:unset;box-sizing:border-box;position:relative;height:40px;display:flex;align-items:center;cursor:pointer;
  padding:0 38px 0 18px;border-radius:var(--mt-button-radius);corner-shape:squircle;
  background:var(--mt-button-bg);color:var(--mt-button-text);font-size:14px;font-weight:500;line-height:1;white-space:nowrap;
  box-shadow:inset 0 1px 0 rgb(255 255 255 / .16), inset 0 0 0 1px rgb(255 255 255 / .06),
    0 1px 2px rgb(var(--mt-shadow) / .18), 0 6px 16px -6px rgb(var(--mt-shadow) / .35);
  z-index:2;-webkit-tap-highlight-color:transparent}
:host([side="right"]) .btn{padding:0 18px 0 38px}
@supports (corner-shape:squircle){.btn{border-radius:calc(var(--mt-button-radius) * 1.6)}}
.btn:focus-visible{outline:2px solid var(--mt-button-bg);outline-offset:3px}

/* the rivet is the pivot every plate turns on */
.rivet{position:absolute;right:16px;top:50%;width:9px;height:9px;margin-top:-4.5px;border-radius:50%;
  background:radial-gradient(circle at 35% 30%, #FFFFFF 0 18%, #E4E6EA 45%, #A9ADB4 100%);
  box-shadow:0 0 0 .5px rgb(0 0 0 / .35), 0 1px 1px rgb(0 0 0 / .4)}
:host([side="right"]) .rivet{right:auto;left:16px}

.layer{position:absolute;inset:0;pointer-events:none;z-index:1}
.plate{position:absolute;display:block;box-sizing:border-box;outline:none;text-decoration:none;color:inherit;
  pointer-events:none;visibility:hidden;-webkit-tap-highlight-color:transparent}
:host([open]) .plate{pointer-events:auto}
.face{position:absolute;inset:0;display:flex;align-items:center;box-sizing:border-box;border-radius:999px;
  padding:0 20px;background:var(--mt-plate-bg);color:var(--mt-plate-text);
  font-size:15px;font-weight:500;letter-spacing:-.005em;white-space:nowrap;
  box-shadow:0 0 0 1px rgb(var(--mt-shadow) / .055), 0 1px 2px rgb(var(--mt-shadow) / .06), 0 12px 24px -12px rgb(var(--mt-shadow) / .22)}
:host([side="right"]) .face{justify-content:flex-end}
.plate:focus-visible .face{outline:2px solid var(--mt-plate-text);outline-offset:2px}
`
