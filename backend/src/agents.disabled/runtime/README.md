Embedding NEBUAI/Agente runtime
================================

This folder contains a small runtime bridge that allows the backend to "embed" the
NEBUAI/Agente code or call it over HTTP.

Two modes are supported (configure via environment variables):

- Local embed (preferred for tight integration)
  - Set AGENT_LOCAL_PATH to a directory where you've placed the `NEBUAI/Agente` code
    (or a built JS bundle). The runtime will try to `require()` the path (or
    path/index.js) and call an exported function `applyAgentProfile(agent)`.
  - Example: if you cloned the repo into `/opt/agent`, set `AGENT_LOCAL_PATH=/opt/agent`.

- Webhook mode (remote runtime)
  - Set AGENT_RUNTIME_HOOK to a URL (e.g. `http://agent-runtime:4000/apply`) and the
    runtime bridge will POST `{ agent }` to that URL when you call the apply endpoint
    from the API.

How to call from the API
------------------------

The bridge exposes a guarded endpoint in the existing `agents` controller:

- POST /api/v1/agents/:id/apply  (requires JWT)

It will attempt local embed first (if AGENT_LOCAL_PATH is set), then webhook (if
AGENT_RUNTIME_HOOK is set). If neither is configured, it returns { ok: false, reason: 'no-runtime-configured' }.

Notes
-----
- For local embed, you must ensure the node runtime and dependencies for the agent
  code are available in the environment the backend runs in. A common approach is
  to build the agent project into a JS bundle and place it under `/opt/agent` in
  the backend container image or mount it with Docker.
- For webhook mode you can run the agent runtime in a separate container and expose
  an HTTP endpoint to receive and apply profiles.

If you want, I can:
- Add a small Dockerfile + recipe to build the `NEBUAI/Agente` code and copy it into
  the backend image (full embed).  (I'll need the repo contents or permission to fetch it.)
- Implement a simple retry/backoff for webhook calls.
