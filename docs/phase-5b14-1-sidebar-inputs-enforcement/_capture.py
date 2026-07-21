#!/usr/bin/env python3
"""Capture 5B.14.1 sidebar field screenshots + computed measures via playwright-cli."""

from __future__ import annotations

import json
import os
import re
import subprocess
import time
from pathlib import Path

OUT = Path(__file__).resolve().parent
PWCLI = os.path.expanduser(
    os.environ.get("PWCLI", "~/.codex/skills/playwright/scripts/playwright_cli.sh")
)


def run(*args: str, check: bool = True) -> str:
    proc = subprocess.run([PWCLI, *args], text=True, capture_output=True)
    text = (proc.stdout or "") + (proc.stderr or "")
    if check and proc.returncode != 0:
        raise RuntimeError(f"pwcli {' '.join(args)} failed ({proc.returncode}):\n{text}")
    return text


def eval_js(code: str):
    out = run("eval", code)
    m = re.search(r"### Result\n([\s\S]*?)(?:\n### |\Z)", out)
    raw = (m.group(1).strip() if m else "null")
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return raw


def screenshot(filename: str) -> None:
    run("screenshot", "--filename", str(OUT / filename))


READ_SHELL = r"""(() => {
  const shell = window.__tdmShell;
  if (!shell) return { error: 'no shell' };
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
    borderGradient: cs.getPropertyValue('--tdm-field-border-gradient').trim().slice(0, 180),
    beforeOpacity: before.opacity,
    beforeBg: before.backgroundImage.slice(0, 180),
    beforePaddingTop: before.paddingTop
  };
})()"""


def bind_input(selector_js: str):
    return eval_js(
        f"""(() => {{
      const input = {selector_js};
      if (!input) return {{ error: 'input missing' }};
      let shell = input.parentElement;
      while (shell && !getComputedStyle(shell).getPropertyValue('--tdm-field-hairline').trim()) {{
        shell = shell.parentElement;
      }}
      if (!shell) return {{ error: 'shell missing' }};
      window.__tdmShell = shell;
      window.__tdmInput = input;
      input.scrollIntoView({{ block: 'center', inline: 'nearest' }});
      return {{ ok: true, tag: input.tagName }};
    }})()"""
    )


def measure_states(prefix: str) -> dict:
    eval_js("(() => { window.__tdmInput?.blur(); return true; })()")
    run("mousemove", "0", "0", check=False)
    time.sleep(0.2)
    rest = eval_js(READ_SHELL)

    box = eval_js(
        "(() => { const r=window.__tdmShell.getBoundingClientRect(); return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2)}; })()"
    )
    run("mousemove", str(box["x"]), str(box["y"]))
    time.sleep(0.25)
    hover = eval_js(READ_SHELL)

    eval_js("(() => { window.__tdmInput.focus(); return true; })()")
    time.sleep(0.25)
    focus = eval_js(READ_SHELL)

    eval_js("(() => { window.__tdmInput.blur(); return true; })()")
    run("mousemove", "0", "0", check=False)
    return {"rest": rest, "hover": hover, "focus": focus}


def open_accordion(label: str) -> str | None:
    return eval_js(
        f"""(() => {{
      const b = [...document.querySelectorAll('button')].find((x) =>
        (x.textContent || '').trim() === {label!r} || (x.getAttribute('aria-label') || '') === {label!r}
      );
      if (!b) return null;
      if (b.getAttribute('aria-expanded') !== 'true') b.click();
      return b.getAttribute('aria-controls');
    }})()"""
    )


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    run("open", "http://localhost:3000/canvas")
    time.sleep(1.2)
    eval_js(
        """(() => {
          const b = [...document.querySelectorAll('button')].find((x) =>
            /Abrir sidebar/i.test(x.getAttribute('aria-label') || '') ||
            /Abrir sidebar/i.test(x.textContent || '')
          );
          b?.click();
          return !!b;
        })()"""
    )
    time.sleep(0.5)

    report: dict = {"measures": {}, "invariant": {}}

    # Generic
    bind = bind_input('document.querySelector("[aria-label=\\"Nome da teoria da mudança\\"]")')
    assert bind.get("ok"), bind
    report["measures"]["generic"] = measure_states("generic")
    eval_js("(() => { window.__tdmInput.blur(); return true; })()")
    time.sleep(0.15)
    screenshot("generic-rest.png")
    eval_js("(() => { window.__tdmInput.focus(); return true; })()")
    time.sleep(0.2)
    screenshot("generic-focus.png")
    eval_js("(() => { window.__tdmInput.blur(); return true; })()")

    stages = [
        ("input", "Criar novo insumo", "input-stage-rest.png", "input-stage-focus.png"),
        ("activity", "Criar nova atividade", "activity-stage-rest.png", None),
        ("product", "Criar novo produto", "product-stage-rest.png", None),
        ("result", "Criar novo resultado", "result-stage-rest.png", None),
    ]

    for key, label, rest_shot, focus_shot in stages:
        panel_id = open_accordion(label)
        time.sleep(0.45)
        assert panel_id, f"missing panel for {label}"
        bind = bind_input(
            f'document.getElementById({panel_id!r})?.querySelector("input[placeholder=\\"Nome do bloco\\"]")'
        )
        assert bind.get("ok"), (key, bind)
        report["measures"][key] = measure_states(key)
        eval_js("(() => { window.__tdmInput.blur(); return true; })()")
        time.sleep(0.15)
        screenshot(rest_shot)
        if focus_shot:
            eval_js("(() => { window.__tdmInput.focus(); return true; })()")
            time.sleep(0.2)
            screenshot(focus_shot)
            eval_js("(() => { window.__tdmInput.blur(); return true; })()")

    for key, states in report["measures"].items():
        r, h, f = states["rest"], states["hover"], states["focus"]
        report["invariant"][key] = {
            "widthStable": r.get("width") == h.get("width") == f.get("width"),
            "heightStable": r.get("height") == h.get("height") == f.get("height"),
            "hairlineStable": r.get("beforePaddingTop")
            == h.get("beforePaddingTop")
            == f.get("beforePaddingTop"),
            "bgTransparent": all(
                s.get("backgroundColor") in ("rgba(0, 0, 0, 0)", "transparent")
                for s in (r, h, f)
            ),
            "maskOn": r.get("useMask") == "1",
            "borderWidthZeroInMask": all(s.get("borderTopWidth") == "0px" for s in (r, h, f)),
            "widths": [r.get("width"), h.get("width"), f.get("width")],
            "heights": [r.get("height"), h.get("height"), f.get("height")],
            "stageRgb": r.get("stageRgb"),
            "beforeOpacity": [r.get("beforeOpacity"), h.get("beforeOpacity"), f.get("beforeOpacity")],
            "hairline": r.get("hairline"),
            "beforePaddingTop": r.get("beforePaddingTop"),
        }

    (OUT / "measures.json").write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
