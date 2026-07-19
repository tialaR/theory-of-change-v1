#!/usr/bin/env bash
set -euo pipefail
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export PWCLI="${PWCLI:-$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh}"
OUT="$(cd "$(dirname "$0")" && pwd)"

"$PWCLI" goto http://localhost:3000/canvas
sleep 1.2

# Ensure sidebar open
"$PWCLI" eval "(() => { const b=[...document.querySelectorAll('button')].find(x=/Abrir sidebar/i.test(x.getAttribute('aria-label')||'')||/Abrir sidebar/i.test(x.textContent||'')); b?.click(); return !!b; })()"
sleep 0.5

measure_js() {
  local selector_js="$1"
  "$PWCLI" eval "(() => {
    const input = ${selector_js};
    if (!input) return { error: 'input missing' };
    let shell = input.parentElement;
    while (shell && !getComputedStyle(shell).getPropertyValue('--tdm-field-hairline').trim()) {
      shell = shell.parentElement;
    }
    if (!shell) return { error: 'shell missing' };
    const read = () => {
      const cs = getComputedStyle(shell);
      const before = getComputedStyle(shell, '::before');
      const r = shell.getBoundingClientRect();
      return {
        width: +r.width.toFixed(3),
        height: +r.height.toFixed(3),
        borderTopWidth: cs.borderTopWidth,
        backgroundColor: cs.backgroundColor,
        boxShadow: cs.boxShadow,
        useMask: cs.getPropertyValue('--tdm-field-use-mask-border').trim(),
        stageRgb: cs.getPropertyValue('--tdm-stage-field-rgb').trim(),
        hairline: cs.getPropertyValue('--tdm-field-hairline').trim(),
        borderGradient: cs.getPropertyValue('--tdm-field-border-gradient').trim().slice(0,180),
        beforeOpacity: before.opacity,
        beforeBg: before.backgroundImage.slice(0,180),
        beforePaddingTop: before.paddingTop
      };
    };
    // stash for hover/focus helpers
    window.__tdmShell = shell;
    window.__tdmInput = input;
    return { rest: read(), shellFound: true };
  })()"
}

echo "=== GENERIC REST ==="
"$PWCLI" eval "(() => { const i=document.querySelector('[aria-label=\"Nome da teoria da mudança\"]'); i?.blur(); return !!i; })()"
sleep 0.2
measure_js 'document.querySelector("[aria-label=\"Nome da teoria da mudança\"]")' | tee "$OUT/generic-rest.measure.txt"
"$PWCLI" screenshot --filename "$OUT/generic-rest.png"

echo "=== GENERIC HOVER ==="
"$PWCLI" eval "(() => { const s=window.__tdmShell; const r=s.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()" > /tmp/tdm-hover.json
# Use mousemove via pwcli
HOVER_XY=$("$PWCLI" eval "(() => { const s=window.__tdmShell; const r=s.getBoundingClientRect(); return Math.round(r.x+r.width/2)+','+Math.round(r.y+r.height/2); })()")
# Extract coords from result
HX=$(echo "$HOVER_XY" | sed -n 's/.*"\([0-9]*\),[0-9]*".*/\1/p')
HY=$(echo "$HOVER_XY" | sed -n 's/.*"[0-9]*,\([0-9]*\)".*/\1/p')
# fallback parse from ### Result
if [ -z "${HX:-}" ]; then
  COORDS=$(echo "$HOVER_XY" | awk '/### Result/{getline; print}' | tr -d '"')
  HX=${COORDS%%,*}
  HY=${COORDS##*,}
fi
"$PWCLI" mousemove "$HX" "$HY"
sleep 0.25
"$PWCLI" eval "(() => {
  const shell=window.__tdmShell; const cs=getComputedStyle(shell); const before=getComputedStyle(shell,'::before'); const r=shell.getBoundingClientRect();
  return { width:+r.width.toFixed(3), height:+r.height.toFixed(3), borderTopWidth:cs.borderTopWidth, backgroundColor:cs.backgroundColor, useMask:cs.getPropertyValue('--tdm-field-use-mask-border').trim(), stageRgb:cs.getPropertyValue('--tdm-stage-field-rgb').trim(), hairline:cs.getPropertyValue('--tdm-field-hairline').trim(), borderGradient:cs.getPropertyValue('--tdm-field-border-gradient').trim().slice(0,180), beforeOpacity:before.opacity, beforeBg:before.backgroundImage.slice(0,180), beforePaddingTop:before.paddingTop };
})()" | tee "$OUT/generic-hover.measure.txt"

echo "=== GENERIC FOCUS ==="
"$PWCLI" eval "(() => { window.__tdmInput.focus(); return true; })()"
sleep 0.25
"$PWCLI" screenshot --filename "$OUT/generic-focus.png"
"$PWCLI" eval "(() => {
  const shell=window.__tdmShell; const cs=getComputedStyle(shell); const before=getComputedStyle(shell,'::before'); const r=shell.getBoundingClientRect();
  return { width:+r.width.toFixed(3), height:+r.height.toFixed(3), borderTopWidth:cs.borderTopWidth, backgroundColor:cs.backgroundColor, useMask:cs.getPropertyValue('--tdm-field-use-mask-border').trim(), stageRgb:cs.getPropertyValue('--tdm-stage-field-rgb').trim(), hairline:cs.getPropertyValue('--tdm-field-hairline').trim(), borderGradient:cs.getPropertyValue('--tdm-field-border-gradient').trim().slice(0,180), beforeOpacity:before.opacity, beforeBg:before.backgroundImage.slice(0,180), beforePaddingTop:before.paddingTop };
})()" | tee "$OUT/generic-focus.measure.txt"
"$PWCLI" eval "(() => { window.__tdmInput.blur(); return true; })()"
"$PWCLI" mousemove 0 0

open_stage() {
  local label="$1"
  "$PWCLI" eval "(() => {
    const b=[...document.querySelectorAll('button')].find(x => (x.textContent||'').trim() === '${label}' || (x.getAttribute('aria-label')||'') === '${label}');
    if (!b) return null;
    if (b.getAttribute('aria-expanded') !== 'true') b.click();
    return b.getAttribute('aria-controls');
  })()"
}

capture_stage() {
  local key="$1"
  local label="$2"
  local rest_shot="$3"
  local focus_shot="${4:-}"

  echo "=== STAGE $key ($label) ==="
  PANEL_OUT=$(open_stage "$label")
  sleep 0.45
  PANEL_ID=$(echo "$PANEL_OUT" | awk '/### Result/{getline; gsub(/"/,\"\"); print}' | tr -d '\r')
  echo "panel=$PANEL_ID"

  "$PWCLI" eval "(() => {
    const panel = document.getElementById('${PANEL_ID}');
    const input = panel?.querySelector('input[placeholder=\"Nome do bloco\"]');
    if (!input) return { error: 'missing', panel: '${PANEL_ID}' };
    input.blur();
    let shell = input.parentElement;
    while (shell && !getComputedStyle(shell).getPropertyValue('--tdm-field-hairline').trim()) shell = shell.parentElement;
    window.__tdmShell = shell;
    window.__tdmInput = input;
    window.__tdmPanel = panel;
    const cs=getComputedStyle(shell); const before=getComputedStyle(shell,'::before'); const r=shell.getBoundingClientRect();
    return { width:+r.width.toFixed(3), height:+r.height.toFixed(3), borderTopWidth:cs.borderTopWidth, backgroundColor:cs.backgroundColor, useMask:cs.getPropertyValue('--tdm-field-use-mask-border').trim(), stageRgb:cs.getPropertyValue('--tdm-stage-field-rgb').trim(), hairline:cs.getPropertyValue('--tdm-field-hairline').trim(), borderGradient:cs.getPropertyValue('--tdm-field-border-gradient').trim().slice(0,180), beforeOpacity:before.opacity, beforeBg:before.backgroundImage.slice(0,180), beforePaddingTop:before.paddingTop };
  })()" | tee "$OUT/${key}-rest.measure.txt"

  "$PWCLI" screenshot --filename "$OUT/${rest_shot}"

  # hover
  HOVER_XY=$("$PWCLI" eval "(() => { const s=window.__tdmShell; const r=s.getBoundingClientRect(); return Math.round(r.x+r.width/2)+','+Math.round(r.y+r.height/2); })()")
  COORDS=$(echo "$HOVER_XY" | awk '/### Result/{getline; print}' | tr -d '"')
  HX=${COORDS%%,*}; HY=${COORDS##*,}
  "$PWCLI" mousemove "$HX" "$HY"
  sleep 0.25
  "$PWCLI" eval "(() => {
    const shell=window.__tdmShell; const cs=getComputedStyle(shell); const before=getComputedStyle(shell,'::before'); const r=shell.getBoundingClientRect();
    return { width:+r.width.toFixed(3), height:+r.height.toFixed(3), borderTopWidth:cs.borderTopWidth, backgroundColor:cs.backgroundColor, useMask:cs.getPropertyValue('--tdm-field-use-mask-border').trim(), stageRgb:cs.getPropertyValue('--tdm-stage-field-rgb').trim(), hairline:cs.getPropertyValue('--tdm-field-hairline').trim(), borderGradient:cs.getPropertyValue('--tdm-field-border-gradient').trim().slice(0,180), beforeOpacity:before.opacity, beforeBg:before.backgroundImage.slice(0,180), beforePaddingTop:before.paddingTop };
  })()" | tee "$OUT/${key}-hover.measure.txt"

  # focus
  "$PWCLI" eval "(() => { window.__tdmInput.focus(); return true; })()"
  sleep 0.25
  if [ -n "$focus_shot" ]; then
    "$PWCLI" screenshot --filename "$OUT/${focus_shot}"
  fi
  "$PWCLI" eval "(() => {
    const shell=window.__tdmShell; const cs=getComputedStyle(shell); const before=getComputedStyle(shell,'::before'); const r=shell.getBoundingClientRect();
    return { width:+r.width.toFixed(3), height:+r.height.toFixed(3), borderTopWidth:cs.borderTopWidth, backgroundColor:cs.backgroundColor, useMask:cs.getPropertyValue('--tdm-field-use-mask-border').trim(), stageRgb:cs.getPropertyValue('--tdm-stage-field-rgb').trim(), hairline:cs.getPropertyValue('--tdm-field-hairline').trim(), borderGradient:cs.getPropertyValue('--tdm-field-border-gradient').trim().slice(0,180), beforeOpacity:before.opacity, beforeBg:before.backgroundImage.slice(0,180), beforePaddingTop:before.paddingTop };
  })()" | tee "$OUT/${key}-focus.measure.txt"
  "$PWCLI" eval "(() => { window.__tdmInput.blur(); return true; })()"
  "$PWCLI" mousemove 0 0
}

# Crop-ish: full page screenshots of open accordion are OK per prompt filenames
capture_stage "input" "Criar novo insumo" "input-stage-rest.png" "input-stage-focus.png"
capture_stage "activity" "Criar nova atividade" "activity-stage-rest.png"
capture_stage "product" "Criar novo produto" "product-stage-rest.png"
capture_stage "result" "Criar novo resultado" "result-stage-rest.png"

python3 - <<PY
import json,re,pathlib
out=pathlib.Path("$OUT")
keys=["generic","input","activity","product","result"]
report={}
for key in keys:
    states={}
    for st in ["rest","hover","focus"]:
        p=out/f"{key}-{st}.measure.txt"
        if not p.exists():
            # generic rest used different name pattern
            if key=="generic" and st=="rest":
                p=out/"generic-rest.measure.txt"
            else:
                continue
        text=p.read_text()
        m=re.search(r"### Result\n(\{.*\})", text, re.S)
        if not m:
            # try nested
            m=re.search(r"(\{\"width\".*\})", text, re.S)
        if not m:
            # generic rest wraps in {rest:...}
            m=re.search(r"\"rest\":\s*(\{.*?\})\s*(,|\})", text, re.S)
        if m:
            raw=m.group(1)
            try:
                states[st]=json.loads(raw)
            except Exception as e:
                states[st]={"parseError":str(e),"raw":raw[:300]}
    report[key]=states

inv={}
for key,states in report.items():
    if not {"rest","hover","focus"} <= set(states):
        inv[key]={"incomplete":list(states)}
        continue
    r,h,f=states["rest"],states["hover"],states["focus"]
    inv[key]={
      "widthStable": r.get("width")==h.get("width")==f.get("width"),
      "heightStable": r.get("height")==h.get("height")==f.get("height"),
      "hairlineStable": r.get("beforePaddingTop")==h.get("beforePaddingTop")==f.get("beforePaddingTop"),
      "bgTransparent": all(s.get("backgroundColor") in ("rgba(0, 0, 0, 0)","transparent") for s in (r,h,f)),
      "maskOn": r.get("useMask")=="1",
      "borderWidthZeroInMask": all(s.get("borderTopWidth")=="0px" for s in (r,h,f)),
      "widths":[r.get("width"),h.get("width"),f.get("width")],
      "heights":[r.get("height"),h.get("height"),f.get("height")],
      "stageRgb": r.get("stageRgb"),
      "beforeOpacity":[r.get("beforeOpacity"),h.get("beforeOpacity"),f.get("beforeOpacity")],
    }

final={"measures":report,"invariant":inv}
(out/"measures.json").write_text(json.dumps(final, indent=2))
print(json.dumps(final, indent=2))
PY

echo "DONE"
ls -la "$OUT"/*.png
