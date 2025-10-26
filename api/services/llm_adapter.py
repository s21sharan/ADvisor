import json
import os
import time
from typing import Any, Dict, Optional, Tuple


def _strict_json_loads(s: str) -> Dict[str, Any]:
    return json.loads(s)


def complete_structured(
    provider: str,
    temperature: float,
    system_prompt: str,
    user_prompt: str,
    schema_hint: Optional[Dict[str, Any]] = None,
) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """Provider-agnostic interface returning (data_dict, debug_info).

    debug_info may include tokens, raw prompts, etc.
    """
    start = time.time()
    provider = (provider or "local").lower()

    if provider == "local":
        # Deterministic local behavior: do nothing smart, rely on upstream heuristics to supply priors.
        # Expect schema_hint to already approximate the brand_meta dict structure.
        data = schema_hint or {}
        dbg = {"provider": provider, "note": "local deterministic"}
        dbg_time = int((time.time() - start) * 1000)
        dbg["latency_ms"] = dbg_time
        return data, dbg

    if provider == "openai":
        # Use OpenAI Chat Completions with function-calling to enforce schema
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("Missing OPENAI_API_KEY for provider 'openai'.")

        try:
            from openai import OpenAI  # type: ignore
        except Exception as exc:  # pragma: no cover - import-time failure
            raise RuntimeError("openai package not installed. Add it to requirements.") from exc

        # Build JSON schema for inner BrandMeta only (simpler, more reliable), we'll wrap server-side
        try:
            from api.schemas_brandmeta import BrandMeta  # local import to avoid cycles at module load
            brand_schema = BrandMeta.model_json_schema()
        except Exception as exc:
            raise RuntimeError("Failed to build JSON schema from BrandMeta") from exc

        client = OpenAI(api_key=api_key)
        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

        # Chat Completions with tools
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "emit_brandmeta",
                    "description": "Return a BrandMeta object strictly matching the schema.",
                    "parameters": brand_schema,
                },
            }
        ]
        resp = client.chat.completions.create(
            model=model,
            temperature=temperature,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            tools=tools,
            tool_choice={"type": "function", "function": {"name": "emit_brandmeta"}},
        )

        # Prefer parsed output when available; robustly handle multiple SDK shapes
        data: Dict[str, Any] = {}
        try:
            # Parse from tool_calls
            choices = getattr(resp, "choices", None) or []
            if choices:
                msg = getattr(choices[0], "message", None)
                tool_calls = getattr(msg, "tool_calls", None) if msg else None
                if tool_calls:
                    func = getattr(tool_calls[0], "function", None)
                    arguments = getattr(func, "arguments", None) if func else None
                    if arguments:
                        try:
                            data = json.loads(arguments)
                        except Exception:
                            data = {}
        except Exception:
            data = {}

        # If model returned only the inner object, wrap it now
        if data and "brand_meta" not in data and isinstance(data, dict):
            data = {"brand_meta": data}

        dbg: Dict[str, Any] = {
            "provider": provider,
            "model": model,
        }
        try:
            usage = getattr(resp, "usage", None)
            if usage is not None:
                dbg["usage"] = getattr(usage, "to_dict", lambda: usage)()
        except Exception:
            pass
        dbg["mode"] = "chat.tools"

        dbg["latency_ms"] = int((time.time() - start) * 1000)
        return data, dbg

    # Stubs for other providers
    if provider in {"google", "anthropic"}:
        raise NotImplementedError(f"Provider '{provider}' not implemented in this build.")

    raise ValueError(f"Unknown provider: {provider}")


